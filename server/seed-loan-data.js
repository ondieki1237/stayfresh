import mongoose from "mongoose"
import dotenv from "dotenv"
import Loan from "../models/Loan.js"
import Produce from "../models/Produce.js"
import Farmer from "../models/Farmer.js"
import Room from "../models/Room.js"

dotenv.config({ path: ".env.local" })

async function seedLoanData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/coldchain")
    console.log("✅ Connected to MongoDB")

    // Get existing farmers, rooms, and produce
    const farmers = await Farmer.find().limit(3)
    const rooms = await Room.find().limit(3)
    const produceItems = await Produce.find({ 
      sold: false,
      status: { $in: ["Active", "Listed"] }
    }).limit(5)

    if (farmers.length === 0 || rooms.length === 0 || produceItems.length === 0) {
      console.log("⚠️  Please run seed-market-data.js first to create farmers, rooms, and produce")
      process.exit(0)
    }

    console.log(`\n📊 Found: ${farmers.length} farmers, ${rooms.length} rooms, ${produceItems.length} produce items`)

    // Clear existing loans (optional - comment out if you want to keep existing)
    // await Loan.deleteMany({})
    // console.log("🗑️  Cleared existing loans")

    // Create sample loans

    // 1. Pending loan application
    const pendingLoan = new Loan({
      farmer: farmers[0]._id,
      produce: produceItems[0]._id,
      collateralValue: produceItems[0].quantity * produceItems[0].currentMarketPrice,
      collateralQuantity: produceItems[0].quantity,
      principal: (produceItems[0].quantity * produceItems[0].currentMarketPrice) * 0.6,
      ltv: 0.6,
      termDays: 60,
      interestRate: 0.18,
      status: "Pending",
      purpose: "Purchase farm inputs",
      appliedAt: new Date()
    })
    await pendingLoan.save()
    console.log(`✅ Created pending loan: ${pendingLoan._id}`)

    // 2. Active loan (approved and disbursed)
    if (produceItems.length > 1) {
      const collateralValue = produceItems[1].quantity * produceItems[1].currentMarketPrice
      const principal = collateralValue * 0.65
      const activeLoan = new Loan({
        farmer: farmers[1]._id,
        produce: produceItems[1]._id,
        collateralValue,
        collateralQuantity: produceItems[1].quantity,
        principal,
        ltv: 0.65,
        termDays: 90,
        interestRate: 0.18,
        status: "Active",
        purpose: "Business expansion",
        appliedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        approvedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        approvedBy: farmers[0]._id,
        disbursedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        dueAt: new Date(Date.now() + 76 * 24 * 60 * 60 * 1000) // 76 days from now
      })
      await activeLoan.save()

      // Mark produce as pledged
      produceItems[1].isPledged = true
      produceItems[1].pledgedToLoan = activeLoan._id
      produceItems[1].collateralValue = collateralValue
      produceItems[1].pledgedAt = activeLoan.disbursedAt
      produceItems[1].pledgedQuantity = activeLoan.collateralQuantity
      await produceItems[1].save()

      console.log(`✅ Created active loan: ${activeLoan._id}`)
      console.log(`   Pledged produce: ${produceItems[1].produceType} (${produceItems[1].quantity}kg)`)
    }

    // 3. Loan with partial payment
    if (produceItems.length > 2 && farmers.length > 2) {
      const collateralValue = produceItems[2].quantity * produceItems[2].currentMarketPrice
      const principal = collateralValue * 0.7
      const interestAmount = principal * 0.18 * (60 / 365)
      const originationFee = principal * 0.02
      
      const partialLoan = new Loan({
        farmer: farmers[2]._id,
        produce: produceItems[2]._id,
        collateralValue,
        collateralQuantity: produceItems[2].quantity,
        principal,
        ltv: 0.7,
        termDays: 60,
        interestRate: 0.18,
        interestAmount,
        originationFee,
        totalFees: originationFee,
        status: "Active",
        purpose: "Emergency expenses",
        appliedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        approvedBy: farmers[0]._id,
        disbursedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        dueAt: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
        payments: [
          {
            amount: principal * 0.3, // 30% paid
            paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            method: "Mobile Money",
            reference: "MPESA123456",
            note: "Partial payment"
          }
        ]
      })
      
      // Update balances
      partialLoan.updateBalances()
      
      await partialLoan.save()

      // Mark produce as pledged
      produceItems[2].isPledged = true
      produceItems[2].pledgedToLoan = partialLoan._id
      produceItems[2].collateralValue = collateralValue
      produceItems[2].pledgedAt = partialLoan.disbursedAt
      produceItems[2].pledgedQuantity = partialLoan.collateralQuantity
      await produceItems[2].save()

      console.log(`✅ Created loan with partial payment: ${partialLoan._id}`)
      console.log(`   Paid: ${formatCurrency(partialLoan.amountPaid)}, Outstanding: ${formatCurrency(partialLoan.outstandingBalance)}`)
    }

    // 4. Repaid loan
    if (produceItems.length > 3) {
      const collateralValue = produceItems[3].quantity * produceItems[3].currentMarketPrice
      const principal = collateralValue * 0.6
      const interestAmount = principal * 0.18 * (45 / 365)
      const originationFee = principal * 0.02
      const totalDue = principal + interestAmount + originationFee
      
      const repaidLoan = new Loan({
        farmer: farmers[0]._id,
        produce: produceItems[3]._id,
        collateralValue,
        collateralQuantity: produceItems[3].quantity,
        principal,
        ltv: 0.6,
        termDays: 45,
        interestRate: 0.18,
        interestAmount,
        originationFee,
        totalFees: originationFee,
        totalDue,
        status: "Repaid",
        purpose: "Working capital",
        appliedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
        approvedBy: farmers[0]._id,
        disbursedAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
        dueAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        repaidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        payments: [
          {
            amount: totalDue,
            paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            method: "Bank Transfer",
            reference: "BANK789012",
            note: "Full repayment"
          }
        ]
      })
      
      repaidLoan.updateBalances()
      await repaidLoan.save()

      console.log(`✅ Created repaid loan: ${repaidLoan._id}`)
    }

    // Summary
    const loanStats = {
      total: await Loan.countDocuments(),
      pending: await Loan.countDocuments({ status: "Pending" }),
      active: await Loan.countDocuments({ status: "Active" }),
      repaid: await Loan.countDocuments({ status: "Repaid" })
    }

    console.log("\n📊 Loan Database Summary:")
    console.log(`   Total Loans: ${loanStats.total}`)
    console.log(`   Pending: ${loanStats.pending}`)
    console.log(`   Active: ${loanStats.active}`)
    console.log(`   Repaid: ${loanStats.repaid}`)

    console.log("\n✨ Loan data seeding completed!")
    console.log("\n🎯 Test the API:")
    console.log("   GET  /api/loans/pending/all - View pending loans")
    console.log("   GET  /api/loans/active/all - View active loans")
    console.log("   GET  /api/loans/farmer/:farmerId - View farmer's loans")
    console.log("   GET  /api/loans/stats/summary - View loan statistics")

  } catch (error) {
    console.error("❌ Error seeding loan data:", error)
  } finally {
    await mongoose.disconnect()
    console.log("\n✅ Disconnected from MongoDB")
    process.exit(0)
  }
}

function formatCurrency(amount) {
  return `KSH ${Number(amount).toLocaleString('en-KE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`
}

seedLoanData()
