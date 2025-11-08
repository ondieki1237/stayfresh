import mongoose from "mongoose"
import Produce from "../models/Produce.js"
import Stocking from "../models/Stocking.js"
import Room from "../models/Room.js"
import dotenv from "dotenv"

dotenv.config()

/**
 * Migration Script: Convert Legacy Produce to Approved Stockings
 * 
 * This script migrates old Produce records to the new Stocking model
 * with automatic approval status.
 * 
 * Usage:
 *   node scripts/migrate-legacy-produce.js [--dry-run] [--admin-id=<id>]
 * 
 * Options:
 *   --dry-run    Preview changes without saving
 *   --admin-id   Specify admin who approved (defaults to first farmer)
 */

const DRY_RUN = process.argv.includes("--dry-run")
const ADMIN_ID_ARG = process.argv.find(arg => arg.startsWith("--admin-id="))
const ADMIN_ID = ADMIN_ID_ARG ? ADMIN_ID_ARG.split("=")[1] : null

async function migrateLegacyProduce() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/coldchain")
    console.log("✅ Connected to MongoDB")

    // Find all legacy produce (not sold, active)
    const legacyProduce = await Produce.find({
      sold: false,
      status: { $in: ["Active", "Listed"] }
    })
    .populate("farmer")
    .populate("room")

    console.log(`\n📦 Found ${legacyProduce.length} legacy produce records to migrate\n`)

    if (legacyProduce.length === 0) {
      console.log("ℹ️  No legacy produce to migrate")
      return
    }

    // Get admin ID (use first farmer as fallback)
    let adminId = ADMIN_ID
    if (!adminId && legacyProduce.length > 0) {
      adminId = legacyProduce[0].farmer._id
      console.log(`⚠️  No admin ID provided, using first farmer as admin: ${adminId}`)
    }

    const migrations = []
    const errors = []

    for (const produce of legacyProduce) {
      try {
        // Map produce type to enum values
        const produceType = mapProduceType(produce.produceType)
        
        // Map condition
        const condition = mapCondition(produce.condition)

        // Calculate estimated value
        const estimatedValue = produce.quantity * (produce.currentMarketPrice || 0)

        // Create stocking object
        const stockingData = {
          room: produce.room._id,
          farmer: produce.farmer._id,
          produceType: produceType,
          quantity: produce.quantity,
          estimatedValue: estimatedValue,
          condition: condition,
          targetPrice: produce.expectedPeakPrice || produce.minimumSellingPrice || produce.currentMarketPrice,
          currentMarketPrice: produce.currentMarketPrice || 0,
          status: "Approved", // Auto-approve legacy data
          approvalStatus: "Approved",
          approvedBy: adminId,
          approvedAt: new Date(),
          stockedAt: produce.storageDate || produce.createdAt,
          notes: `Migrated from legacy Produce model. Original ID: ${produce._id}`,
          priceHistory: [{
            price: produce.currentMarketPrice || 0,
            checkedAt: produce.storageDate || produce.createdAt
          }]
        }

        if (DRY_RUN) {
          console.log(`\n[DRY RUN] Would migrate:`)
          console.log(`  📦 ${produce.produceType} (${produce.quantity}kg)`)
          console.log(`  👨‍🌾 Farmer: ${produce.farmer.firstName} ${produce.farmer.lastName}`)
          console.log(`  🏠 Room: ${produce.room.roomNumber}`)
          console.log(`  💰 Price: KSH ${produce.currentMarketPrice}/kg`)
          console.log(`  ✅ Will be approved automatically`)
        } else {
          // Create new stocking
          const stocking = new Stocking(stockingData)
          await stocking.save()

          // Update room occupancy
          const room = await Room.findById(produce.room._id)
          if (room) {
            room.currentOccupancy += produce.quantity
            await room.save()
          }

          // Mark legacy produce as migrated (or delete)
          // Option 1: Update status
          produce.status = "Removed"
          produce.notes = produce.notes 
            ? `${produce.notes}\n[MIGRATED to Stocking: ${stocking._id}]`
            : `[MIGRATED to Stocking: ${stocking._id}]`
          await produce.save()

          // Option 2: Delete (uncomment if you want to delete)
          // await Produce.findByIdAndDelete(produce._id)

          migrations.push({
            legacyId: produce._id,
            stockingId: stocking._id,
            produceType: produce.produceType,
            quantity: produce.quantity
          })

          console.log(`✅ Migrated: ${produce.produceType} (${produce.quantity}kg) → Stocking ${stocking._id}`)
        }
      } catch (error) {
        console.error(`❌ Error migrating produce ${produce._id}:`, error.message)
        errors.push({
          produceId: produce._id,
          produceType: produce.produceType,
          error: error.message
        })
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60))
    console.log("📊 MIGRATION SUMMARY")
    console.log("=".repeat(60))
    
    if (DRY_RUN) {
      console.log(`\n✅ Would migrate: ${legacyProduce.length} records`)
      console.log(`\n⚠️  This was a DRY RUN - no changes were made`)
      console.log(`\nTo perform the actual migration, run:`)
      console.log(`  node scripts/migrate-legacy-produce.js --admin-id=<admin-farmer-id>`)
    } else {
      console.log(`\n✅ Successfully migrated: ${migrations.length} records`)
      console.log(`❌ Failed: ${errors.length} records`)
      
      if (errors.length > 0) {
        console.log("\n⚠️  Errors:")
        errors.forEach(err => {
          console.log(`  - ${err.produceType} (${err.produceId}): ${err.error}`)
        })
      }

      console.log("\n📋 Migrated Records:")
      migrations.forEach(m => {
        console.log(`  ✓ ${m.produceType} (${m.quantity}kg)`)
        console.log(`    Legacy ID: ${m.legacyId}`)
        console.log(`    New ID: ${m.stockingId}`)
      })
    }

    console.log("\n" + "=".repeat(60))

  } catch (error) {
    console.error("❌ Migration failed:", error)
  } finally {
    await mongoose.disconnect()
    console.log("\n✅ Disconnected from MongoDB")
  }
}

// Helper: Map produce type to Stocking enum
function mapProduceType(type) {
  const validTypes = [
    "Tomatoes", "Potatoes", "Onions", "Carrots", "Cabbage",
    "Spinach", "Kale", "Lettuce", "Broccoli", "Cauliflower",
    "Peppers", "Cucumbers", "Beans", "Peas", "Maize",
    "Bananas", "Mangoes", "Avocados", "Oranges", "Apples",
    "Strawberries", "Passion Fruit", "Pineapples"
  ]

  // Direct match
  if (validTypes.includes(type)) return type

  // Case-insensitive search
  const matched = validTypes.find(
    valid => valid.toLowerCase() === type.toLowerCase()
  )
  
  return matched || "Other"
}

// Helper: Map condition to Stocking enum
function mapCondition(condition) {
  const conditionMap = {
    "Excellent": "Fresh",
    "Fresh": "Fresh",
    "Good": "Good",
    "Fair": "Fair",
    "Poor": "Needs Attention",
    "Spoiled": "Needs Attention"
  }

  return conditionMap[condition] || "Good"
}

// Run migration
migrateLegacyProduce()
  .then(() => {
    console.log("\n✨ Migration process completed!")
    process.exit(0)
  })
  .catch(error => {
    console.error("\n💥 Migration process failed:", error)
    process.exit(1)
  })
