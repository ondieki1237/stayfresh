import express from "express"
import MarketplaceListing from "../models/MarketplaceListing.js"
import Produce from "../models/Produce.js"
import { authMiddleware } from "../middleware/auth.js"

const router = express.Router()

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
