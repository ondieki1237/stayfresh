import mongoose from "mongoose"
import Farmer from "./models/Farmer.js"
import Room from "./models/Room.js"
import Produce from "./models/Produce.js"
import Stocking from "./models/Stocking.js"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

/**
 * Seed Market Data Script
 * Creates sample farmers, rooms, and produce for testing the marketplace
 */

async function seedMarketData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/coldchain"
    await mongoose.connect(mongoUri)
    console.log("✅ Connected to MongoDB:", mongoUri)

    // Check if data already exists
    const existingFarmers = await Farmer.countDocuments()
    const existingRooms = await Room.countDocuments()
    const existingProduce = await Produce.countDocuments()
    const existingStockings = await Stocking.countDocuments()

    console.log("\n📊 Current Database State:")
    console.log(`   Farmers: ${existingFarmers}`)
    console.log(`   Rooms: ${existingRooms}`)
    console.log(`   Legacy Produce: ${existingProduce}`)
    console.log(`   Stockings: ${existingStockings}`)

    if (existingFarmers === 0) {
      console.log("\n⚠️  No farmers found. Creating sample farmers...")
      await createSampleFarmers()
    }

    if (existingRooms === 0) {
      console.log("\n⚠️  No rooms found. Creating sample rooms...")
      await createSampleRooms()
    }

    // Create sample produce for marketplace
    console.log("\n🌱 Creating sample produce for marketplace...")
    await createSampleProduce()

    console.log("\n✨ Market data seeding completed!")
    
    // Show final counts
    const finalFarmers = await Farmer.countDocuments()
    const finalRooms = await Room.countDocuments()
    const finalProduce = await Produce.countDocuments()
    const finalStockings = await Stocking.countDocuments()

    console.log("\n📊 Final Database State:")
    console.log(`   Farmers: ${finalFarmers}`)
    console.log(`   Rooms: ${finalRooms}`)
    console.log(`   Legacy Produce: ${finalProduce}`)
    console.log(`   Stockings: ${finalStockings}`)

    console.log("\n🎉 Done! Visit http://localhost:3000/market to see the produce!")

  } catch (error) {
    console.error("❌ Error seeding data:", error)
  } finally {
    await mongoose.disconnect()
    console.log("\n✅ Disconnected from MongoDB")
    process.exit(0)
  }
}

async function createSampleFarmers() {
  const farmers = [
    {
      firstName: "John",
      lastName: "Kamau",
      email: "john.kamau@example.com",
      phone: "+254712345678",
      password: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789", // hashed password
      location: "Kisumu",
      isActive: true
    },
    {
      firstName: "Mary",
      lastName: "Wanjiku",
      email: "mary.wanjiku@example.com",
      phone: "+254723456789",
      password: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789",
      location: "Nakuru",
      isActive: true
    },
    {
      firstName: "Peter",
      lastName: "Omondi",
      email: "peter.omondi@example.com",
      phone: "+254734567890",
      password: "$2b$10$abcdefghijklmnopqrstuvwxyz123456789",
      location: "Eldoret",
      isActive: true
    }
  ]

  await Farmer.insertMany(farmers)
  console.log(`   ✓ Created ${farmers.length} sample farmers`)
}

async function createSampleRooms() {
  const owner = await Farmer.findOne()
  
  const rooms = [
    {
      roomNumber: "101",
      capacity: 1000,
      currentOccupancy: 0,
      temperature: 4,
      humidity: 85,
      status: "Available",
      pricePerKg: 5,
      rentalRate: 5000,
      owner: owner._id
    },
    {
      roomNumber: "102",
      capacity: 1500,
      currentOccupancy: 0,
      temperature: 2,
      humidity: 80,
      status: "Available",
      pricePerKg: 5,
      rentalRate: 7500,
      owner: owner._id
    },
    {
      roomNumber: "103",
      capacity: 2000,
      currentOccupancy: 0,
      temperature: 3,
      humidity: 82,
      status: "Available",
      pricePerKg: 5,
      rentalRate: 10000,
      owner: owner._id
    }
  ]

  await Room.insertMany(rooms)
  console.log(`   ✓ Created ${rooms.length} sample rooms`)
}

async function createSampleProduce() {
  const farmers = await Farmer.find().limit(3)
  const rooms = await Room.find().limit(3)

  if (farmers.length === 0 || rooms.length === 0) {
    console.log("   ⚠️  Need farmers and rooms to create produce")
    return
  }

  // Sample produce data
  const produceData = [
    {
      produceType: "Tomatoes",
      quantity: 500,
      currentMarketPrice: 120,
      condition: "Fresh",
      farmer: farmers[0]._id,
      room: rooms[0]._id
    },
    {
      produceType: "Potatoes",
      quantity: 800,
      currentMarketPrice: 80,
      condition: "Good",
      farmer: farmers[1]._id,
      room: rooms[1]._id
    },
    {
      produceType: "Onions",
      quantity: 600,
      currentMarketPrice: 100,
      condition: "Fresh",
      farmer: farmers[2]._id,
      room: rooms[2]._id
    },
    {
      produceType: "Carrots",
      quantity: 400,
      currentMarketPrice: 90,
      condition: "Good",
      farmer: farmers[0]._id,
      room: rooms[0]._id
    },
    {
      produceType: "Cabbage",
      quantity: 700,
      currentMarketPrice: 60,
      condition: "Fresh",
      farmer: farmers[1]._id,
      room: rooms[1]._id
    }
  ]

  // Create legacy produce
  const legacyProduce = produceData.slice(0, 2).map(p => ({
    ...p,
    status: "Active",
    sold: false,
    storageDate: new Date(),
    expectedPeakPrice: p.currentMarketPrice * 1.2,
    minimumSellingPrice: p.currentMarketPrice * 0.9
  }))

  await Produce.insertMany(legacyProduce)
  console.log(`   ✓ Created ${legacyProduce.length} legacy produce items`)

  // Create approved stockings
  const stockings = produceData.slice(2).map(p => ({
    ...p,
    targetPrice: p.currentMarketPrice * 1.15,
    estimatedValue: p.quantity * p.currentMarketPrice,
    status: "Monitoring",
    approvalStatus: "Approved",
    approvedBy: farmers[0]._id,
    approvedAt: new Date(),
    stockedAt: new Date(),
    priceHistory: [{
      price: p.currentMarketPrice,
      checkedAt: new Date()
    }]
  }))

  await Stocking.insertMany(stockings)
  console.log(`   ✓ Created ${stockings.length} approved stocking items`)

  // Update room occupancy
  for (let i = 0; i < rooms.length; i++) {
    const roomProduce = [...legacyProduce, ...stockings].filter(
      p => p.room.toString() === rooms[i]._id.toString()
    )
    const totalQuantity = roomProduce.reduce((sum, p) => sum + p.quantity, 0)
    rooms[i].currentOccupancy = totalQuantity
    await rooms[i].save()
  }
  console.log(`   ✓ Updated room occupancy`)
}

// Run the seed script
seedMarketData()
