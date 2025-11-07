import mongoose from "mongoose"
import dotenv from "dotenv"
import Farmer from "./models/Farmer.js"
import Room from "./models/Room.js"
import Sensor from "./models/Sensor.js"
import MarketData from "./models/MarketData.js"
import TrainingCourse from "./models/TrainingCourse.js"

dotenv.config()

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cold-chain")
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    await Promise.all([
      Room.deleteMany({}),
      Sensor.deleteMany({}),
      MarketData.deleteMany({}),
      TrainingCourse.deleteMany({}),
      Farmer.deleteMany({})
    ])
    console.log("🗑️  Cleared existing data")

    // Create Admin User
    const adminUser = new Farmer({
      email: "admin@stayfresh.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      phone: "+1234567890",
      location: "System",
      farmName: "Stay Fresh Admin",
      isActive: true
    })
    await adminUser.save()
    console.log("✅ Created admin user: admin@stayfresh.com / admin123")

    // Seed Rooms
    const rooms = []
    for (let i = 1; i <= 20; i++) {
      const room = new Room({
        roomNumber: `R${String(i).padStart(3, "0")}`,
        capacity: Math.floor(Math.random() * 2000) + 500, // 500-2500 kg
        size: Math.floor(Math.random() * 50) + 20, // 20-70 cubic meters
        temperature: 4,
        targetTemperature: 4,
        humidity: 85,
        targetHumidity: 85,
        sterilization: "Completed",
        sterilizationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextSterilizationDue: new Date(Date.now() + 83 * 24 * 60 * 60 * 1000),
        conditioning: ["Excellent", "Good", "Fair"][Math.floor(Math.random() * 3)],
        conditioningScore: Math.floor(Math.random() * 30) + 70,
        status: i <= 15 ? "Available" : ["Occupied", "Maintenance"][Math.floor(Math.random() * 2)],
  rentalRate: Math.floor(Math.random() * 300) + 200, // KSH 200-500 per month
        airCirculation: "Good",
        lightExposure: "None",
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextMaintenanceDue: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      })
      await room.save()
      rooms.push(room)
    }
    console.log(`✅ Created ${rooms.length} rooms`)

    // Seed Sensors
    const sensors = []
    for (const room of rooms) {
      const sensor = new Sensor({
        sensorId: `SEN-${room.roomNumber}`,
        room: room._id,
        temperature: 3 + Math.random() * 2, // 3-5°C
        humidity: 80 + Math.random() * 10, // 80-90%
        co2Level: Math.floor(Math.random() * 1000) + 300,
        ethyleneLevel: Math.floor(Math.random() * 50),
        airPressure: 101300 + Math.floor(Math.random() * 100),
        isOnline: Math.random() > 0.1, // 90% online
        batteryLevel: Math.floor(Math.random() * 30) + 70,
        lastReading: new Date(),
        temperatureMin: 2,
        temperatureMax: 6,
        humidityMin: 80,
        humidityMax: 95,
        co2Max: 5000,
        ethyleneMax: 100,
        lastCalibration: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        nextCalibrationDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      await sensor.save()
      
      // Update room with sensor ID
      room.sensorId = sensor._id
      await room.save()
      
      sensors.push(sensor)
    }
    console.log(`✅ Created ${sensors.length} sensors`)

    // Seed Market Data
    const produceTypes = ["tomato", "potato", "onion", "carrot", "cabbage", "beans", "lettuce", "cucumber"]
    const regions = ["North", "South", "East", "West", "Central"]
    
    const marketData = []
    for (const produce of produceTypes) {
      for (const region of regions) {
        const basePrice = Math.floor(Math.random() * 50) + 20
        const data = new MarketData({
          produceType: produce,
          region: region,
          currentPrice: basePrice,
          previousPrice: basePrice - (Math.random() * 10 - 5),
          lowestPrice: basePrice - Math.floor(Math.random() * 10),
          highestPrice: basePrice + Math.floor(Math.random() * 15),
          averagePrice: basePrice,
          demand: ["Low", "Medium", "High", "Very High"][Math.floor(Math.random() * 4)],
          supply: ["Low", "Medium", "High", "Very High"][Math.floor(Math.random() * 4)],
          trendDirection: ["Rising", "Falling", "Stable"][Math.floor(Math.random() * 3)],
          trendPercentage: (Math.random() * 20 - 10).toFixed(2),
          predictedPeakPrice: basePrice + Math.floor(Math.random() * 20),
          predictedPeakDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          bestTimeToSell: "Next 3-5 days",
          marketConfidence: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
          activeBuyers: Math.floor(Math.random() * 50) + 10,
          avgBuyerOfferPrice: basePrice - Math.floor(Math.random() * 5),
          dataSource: "Market Survey",
          lastUpdated: new Date()
        })
        data.calculateTrend()
        await data.save()
        marketData.push(data)
      }
    }
    console.log(`✅ Created ${marketData.length} market data records`)

    // Seed Training Courses
    const courses = [
      {
        title: "Introduction to Stay Fresh Management",
        description: "Learn the basics of Stay Fresh storage and best practices for produce preservation.",
        category: "Cold Storage",
        level: "Beginner",
        duration: 2,
        modules: [
          { title: "What is Stay Fresh?", description: "Understanding Stay Fresh basics", duration: 30, order: 1 },
          { title: "Temperature Control", description: "Maintaining optimal temperatures", duration: 45, order: 2 },
          { title: "Best Practices", description: "Industry best practices", duration: 45, order: 3 }
        ],
        objectives: ["Understand Stay Fresh basics", "Learn temperature requirements", "Implement best practices"],
        whatYouWillLearn: ["Cold storage fundamentals", "Temperature management", "Quality control"],
        instructor: "Dr. Jane Smith",
        rating: 4.5,
        reviewsCount: 128,
        providesCertificate: true,
        isPublished: true
      },
      {
        title: "Produce Quality Management",
        description: "Master techniques to maintain produce quality during storage.",
        category: "Produce Quality",
        level: "Intermediate",
        duration: 3,
        modules: [
          { title: "Quality Indicators", description: "Identifying quality markers", duration: 40, order: 1 },
          { title: "Handling Techniques", description: "Proper produce handling", duration: 50, order: 2 },
          { title: "Storage Optimization", description: "Maximizing shelf life", duration: 50, order: 3 },
          { title: "Quality Testing", description: "Testing and monitoring", duration: 40, order: 4 }
        ],
        objectives: ["Identify quality indicators", "Master handling techniques", "Optimize storage conditions"],
        whatYouWillLearn: ["Quality assessment", "Proper handling", "Storage optimization"],
        instructor: "Prof. John Doe",
        rating: 4.7,
        reviewsCount: 95,
        providesCertificate: true,
        isPublished: true
      },
      {
        title: "Market Analysis and Pricing Strategies",
        description: "Learn to analyze market trends and optimize your selling strategy.",
        category: "Market Skills",
        level: "Advanced",
        duration: 4,
        modules: [
          { title: "Market Research", description: "Conducting market analysis", duration: 60, order: 1 },
          { title: "Price Trends", description: "Understanding price movements", duration: 60, order: 2 },
          { title: "Timing Your Sales", description: "Optimal selling windows", duration: 50, order: 3 },
          { title: "Negotiation Skills", description: "Effective negotiation", duration: 50, order: 4 }
        ],
        objectives: ["Conduct market research", "Analyze price trends", "Master negotiation"],
        whatYouWillLearn: ["Market analysis", "Pricing strategies", "Sales timing"],
        instructor: "Sarah Johnson",
        rating: 4.8,
        reviewsCount: 73,
        providesCertificate: true,
        isPublished: true
      },
      {
        title: "IoT Sensors in Agriculture",
        description: "Understanding and utilizing IoT sensors for smart farming.",
        category: "Technology",
        level: "Intermediate",
        duration: 3,
        modules: [
          { title: "Sensor Types", description: "Different sensor technologies", duration: 45, order: 1 },
          { title: "Data Interpretation", description: "Reading sensor data", duration: 50, order: 2 },
          { title: "Alert Management", description: "Responding to alerts", duration: 45, order: 3 },
          { title: "Maintenance", description: "Sensor maintenance", duration: 40, order: 4 }
        ],
        objectives: ["Understand sensor technology", "Interpret sensor data", "Manage alerts"],
        whatYouWillLearn: ["Sensor basics", "Data analysis", "System maintenance"],
        instructor: "Dr. Tech Kumar",
        rating: 4.6,
        reviewsCount: 54,
        providesCertificate: true,
        isPublished: true
      },
      {
        title: "Business Planning for Farmers",
        description: "Develop business skills to grow your farming operation.",
        category: "Business",
        level: "Beginner",
        duration: 2.5,
        modules: [
          { title: "Business Basics", description: "Fundamentals of farm business", duration: 40, order: 1 },
          { title: "Financial Planning", description: "Managing farm finances", duration: 50, order: 2 },
          { title: "Marketing Your Produce", description: "Effective marketing", duration: 45, order: 3 }
        ],
        objectives: ["Learn business fundamentals", "Plan finances", "Market effectively"],
        whatYouWillLearn: ["Business planning", "Financial management", "Marketing basics"],
        instructor: "Mark Wilson",
        rating: 4.4,
        reviewsCount: 89,
        providesCertificate: true,
        isPublished: true
      }
    ]

    for (const courseData of courses) {
      const course = new TrainingCourse(courseData)
      await course.save()
    }
    console.log(`✅ Created ${courses.length} training courses`)

    console.log("\n🎉 Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
