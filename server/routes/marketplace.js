import express from "express"
import MarketplaceListing from "../models/MarketplaceListing.js"
import Produce from "../models/Produce.js"
import Stocking from "../models/Stocking.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

// Get all available produce from cold storage (Stocking model + Legacy Produce)
router.get("/produce", async (req, res) => {
  try {
    const { produceType, minPrice, maxPrice, condition } = req.query
    
    // Query for approved stockings
    let stockingQuery = {
      approvalStatus: "Approved",
      status: { $in: ["Monitoring", "Target Reached", "Stocked"] }
    }
    
    if (produceType) stockingQuery.produceType = produceType
    if (condition) stockingQuery.condition = condition
    if (minPrice || maxPrice) {
      stockingQuery.currentMarketPrice = {}
      if (minPrice) stockingQuery.currentMarketPrice.$gte = Number(minPrice)
      if (maxPrice) stockingQuery.currentMarketPrice.$lte = Number(maxPrice)
    }
    
    // Query for legacy produce (active and not sold)
    let legacyQuery = {
      sold: false,
      status: { $in: ["Active", "Listed"] }
    }
    
    if (produceType) legacyQuery.produceType = produceType
    if (condition) legacyQuery.condition = condition
    if (minPrice || maxPrice) {
      legacyQuery.currentMarketPrice = {}
      if (minPrice) legacyQuery.currentMarketPrice.$gte = Number(minPrice)
      if (maxPrice) legacyQuery.currentMarketPrice.$lte = Number(maxPrice)
    }
    
    // Fetch both approved stockings and legacy produce
    const [stockings, legacyProduce] = await Promise.all([
      Stocking.find(stockingQuery)
        .populate("farmer", "firstName lastName phone email")
        .populate("room", "roomNumber temperature")
        .sort({ stockedAt: -1 })
        .lean(),
      Produce.find(legacyQuery)
        .populate("farmer", "firstName lastName phone email")
        .populate("room", "roomNumber temperature")
        .sort({ storageDate: -1 })
        .lean()
    ])
    
    // Transform approved stockings for marketplace display
    const stockingItems = stockings.map(item => ({
      _id: item._id,
      name: item.produceType,
      image: getProduceImage(item.produceType),
      price: item.currentMarketPrice,
      quantity: item.quantity,
      condition: item.condition,
      farmer: {
        name: `${item.farmer.firstName} ${item.farmer.lastName}`,
        phone: item.farmer.phone,
        email: item.farmer.email
      },
      room: item.room.roomNumber,
      stockedAt: item.stockedAt,
      estimatedValue: item.estimatedValue,
      source: "stocking" // Mark as new system
    }))
    
    // Transform legacy produce for marketplace display
    const legacyItems = legacyProduce.map(item => ({
      _id: item._id,
      name: item.produceType,
      image: getProduceImage(item.produceType),
      price: item.currentMarketPrice,
      quantity: item.quantity,
      condition: item.condition,
      farmer: {
        name: `${item.farmer.firstName} ${item.farmer.lastName}`,
        phone: item.farmer.phone,
        email: item.farmer.email
      },
      room: item.room.roomNumber,
      stockedAt: item.storageDate || item.createdAt,
      estimatedValue: item.quantity * item.currentMarketPrice,
      source: "legacy" // Mark as legacy
    }))
    
    // Combine and sort by date (newest first)
    const allProduce = [...stockingItems, ...legacyItems].sort((a, b) => 
      new Date(b.stockedAt) - new Date(a.stockedAt)
    )
    
    res.json(allProduce)
  } catch (error) {
    console.error("Get marketplace produce error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get marketplace statistics
router.get("/produce/stats", async (req, res) => {
  try {
    // Count approved stockings
    const totalStockings = await Stocking.countDocuments({
      approvalStatus: "Approved",
      status: { $in: ["Monitoring", "Target Reached", "Stocked"] }
    })
    
    // Count legacy produce
    const totalLegacy = await Produce.countDocuments({
      sold: false,
      status: { $in: ["Active", "Listed"] }
    })
    
    // Get produce types from stockings
    const stockingTypes = await Stocking.aggregate([
      {
        $match: {
          approvalStatus: "Approved",
          status: { $in: ["Monitoring", "Target Reached", "Stocked"] }
        }
      },
      {
        $group: {
          _id: "$produceType",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" }
        }
      }
    ])
    
    // Get produce types from legacy
    const legacyTypes = await Produce.aggregate([
      {
        $match: {
          sold: false,
          status: { $in: ["Active", "Listed"] }
        }
      },
      {
        $group: {
          _id: "$produceType",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" }
        }
      }
    ])
    
    // Get total quantities
    const stockingQuantity = await Stocking.aggregate([
      {
        $match: {
          approvalStatus: "Approved",
          status: { $in: ["Monitoring", "Target Reached", "Stocked"] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" }
        }
      }
    ])
    
    const legacyQuantity = await Produce.aggregate([
      {
        $match: {
          sold: false,
          status: { $in: ["Active", "Listed"] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$quantity" }
        }
      }
    ])
    
    // Merge produce types (combine duplicates)
    const typesMap = new Map()
    
    stockingTypes.forEach(type => {
      typesMap.set(type._id, {
        _id: type._id,
        count: type.count,
        totalQuantity: type.totalQuantity
      })
    })
    
    legacyTypes.forEach(type => {
      if (typesMap.has(type._id)) {
        const existing = typesMap.get(type._id)
        existing.count += type.count
        existing.totalQuantity += type.totalQuantity
      } else {
        typesMap.set(type._id, {
          _id: type._id,
          count: type.count,
          totalQuantity: type.totalQuantity
        })
      }
    })
    
    const allCategories = Array.from(typesMap.values())
    
    res.json({
      totalListings: totalStockings + totalLegacy,
      totalQuantity: (stockingQuantity[0]?.total || 0) + (legacyQuantity[0]?.total || 0),
      produceTypes: allCategories.length,
      categories: allCategories,
      breakdown: {
        approved: totalStockings,
        legacy: totalLegacy
      }
    })
  } catch (error) {
    console.error("Get marketplace stats error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Helper function to get produce image
function getProduceImage(produceType) {
  const imageMap = {
    "Tomatoes": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
    "Potatoes": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400",
    "Onions": "https://images.unsplash.com/photo-1508747703725-719777637510?w=400",
    "Carrots": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400",
    "Cabbage": "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400",
    "Spinach": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
    "Kale": "https://images.unsplash.com/photo-1590777675726-1de89d92b0cb?w=400",
    "Lettuce": "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400",
    "Broccoli": "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400",
    "Cauliflower": "https://images.unsplash.com/photo-1568584711-5e87db4b9442?w=400",
    "Peppers": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400",
    "Cucumbers": "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400",
    "Beans": "https://images.unsplash.com/photo-1589621316382-008455b857cd?w=400",
    "Peas": "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400",
    "Maize": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400",
    "Bananas": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
    "Mangoes": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400",
    "Avocados": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400",
    "Oranges": "https://images.unsplash.com/photo-1547514701-42782101795e?w=400",
    "Apples": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
    "Strawberries": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
    "Passion Fruit": "https://images.unsplash.com/photo-1595576464634-c7e02b96e27f?w=400",
    "Pineapples": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400",
    "Other": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400"
  }
  
  return imageMap[produceType] || imageMap["Other"]
}

// Get all active listings
router.get("/", async (req, res) => {
  try {
    const { produceType, region, maxPrice, isUrgent } = req.query
    let query = { status: "Active" }
    
    if (produceType) query.produceType = produceType
    if (region) query.location = { $regex: region, $options: "i" }
    if (maxPrice) query.pricePerKg = { $lte: parseFloat(maxPrice) }
    if (isUrgent === "true") query.isUrgent = true
    
    const listings = await MarketplaceListing.find(query)
      .populate("farmer", "firstName lastName phone location")
      .populate("produce")
      .sort({ isUrgent: -1, createdAt: -1 })
      
    res.json(listings)
  } catch (error) {
    console.error("Get listings error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get farmer's listings
router.get("/farmer/:farmerId", authMiddleware, async (req, res) => {
  try {
    const listings = await MarketplaceListing.find({ farmer: req.params.farmerId })
      .populate("produce")
      .sort({ createdAt: -1 })
      
    res.json(listings)
  } catch (error) {
    console.error("Get farmer listings error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get single listing
router.get("/:id", async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id)
      .populate("farmer", "firstName lastName phone location email")
      .populate("produce")
      
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" })
    }
    
    // Increment view count
    listing.views += 1
    await listing.save()
    
    res.json(listing)
  } catch (error) {
    console.error("Get listing error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Create listing
router.post("/", authMiddleware, async (req, res) => {
  try {
    const listing = new MarketplaceListing(req.body)
    await listing.save()
    
    // Update produce status
    if (req.body.produce) {
      await Produce.findByIdAndUpdate(
        req.body.produce,
        { status: "Listed" }
      )
    }
    
    res.status(201).json({ 
      message: "Listing created successfully", 
      listing 
    })
  } catch (error) {
    console.error("Create listing error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Update listing
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" })
    }
    
    res.json({ message: "Listing updated successfully", listing })
  } catch (error) {
    console.error("Update listing error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Submit offer for listing
router.post("/:id/offer", async (req, res) => {
  try {
    const { buyerName, buyerPhone, offeredPrice, quantity, message } = req.body
    
    const listing = await MarketplaceListing.findById(req.params.id)
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" })
    }
    
    if (listing.status !== "Active") {
      return res.status(400).json({ message: "Listing is not active" })
    }
    
    // Add offer
    listing.offers.push({
      buyerName,
      buyerPhone,
      offeredPrice,
      quantity,
      message,
      status: "Pending"
    })
    
    listing.inquiries += 1
    await listing.save()
    
    res.json({ 
      message: "Offer submitted successfully", 
      listing 
    })
  } catch (error) {
    console.error("Submit offer error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Accept/Reject offer
router.put("/:id/offer/:offerIndex", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body // "Accepted" or "Rejected"
    
    const listing = await MarketplaceListing.findById(req.params.id)
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" })
    }
    
    const offerIndex = parseInt(req.params.offerIndex)
    if (offerIndex >= 0 && offerIndex < listing.offers.length) {
      listing.offers[offerIndex].status = status
      
      // If accepted, update listing and produce
      if (status === "Accepted") {
        const offer = listing.offers[offerIndex]
        listing.availableQuantity -= offer.quantity
        
        if (listing.availableQuantity <= 0) {
          listing.status = "Sold"
          listing.availableQuantity = 0
        } else {
          listing.status = "Reserved"
        }
        
        // Update produce
        if (listing.produce) {
          await Produce.findByIdAndUpdate(
            listing.produce,
            { status: "Reserved" }
          )
        }
      }
      
      await listing.save()
    }
    
    res.json({ message: `Offer ${status.toLowerCase()} successfully`, listing })
  } catch (error) {
    console.error("Update offer error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Mark listing as sold
router.post("/:id/sold", authMiddleware, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id)
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" })
    }
    
    listing.status = "Sold"
    listing.availableQuantity = 0
    await listing.save()
    
    // Update produce
    if (listing.produce) {
      await Produce.findByIdAndUpdate(
        listing.produce,
        { status: "Sold", sold: true, soldDate: new Date() }
      )
    }
    
    res.json({ message: "Listing marked as sold", listing })
  } catch (error) {
    console.error("Mark sold error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Cancel listing
router.post("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id)
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" })
    }
    
    listing.status = "Cancelled"
    await listing.save()
    
    // Update produce
    if (listing.produce) {
      await Produce.findByIdAndUpdate(
        listing.produce,
        { status: "Active" }
      )
    }
    
    res.json({ message: "Listing cancelled", listing })
  } catch (error) {
    console.error("Cancel listing error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get urgent listings (perishable items)
router.get("/urgent/all", async (req, res) => {
  try {
    const urgentListings = await MarketplaceListing.find({
      isUrgent: true,
      status: "Active",
      daysUntilPerish: { $gt: 0 }
    })
    .populate("farmer", "firstName lastName phone location")
    .populate("produce")
    .sort({ daysUntilPerish: 1 })
    
    res.json(urgentListings)
  } catch (error) {
    console.error("Get urgent listings error:", error)
    res.status(500).json({ message: error.message })
  }
})

// Delete listing
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findByIdAndDelete(req.params.id)
    
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" })
    }
    
    // Update produce
    if (listing.produce) {
      await Produce.findByIdAndUpdate(
        listing.produce,
        { status: "Active" }
      )
    }
    
    res.json({ message: "Listing deleted successfully" })
  } catch (error) {
    console.error("Delete listing error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
