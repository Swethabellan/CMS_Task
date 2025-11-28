import { PrismaClient } from "@prisma/client"
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting seed...")

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning existing data...")
  await prisma.notification.deleteMany()
  await prisma.serviceHistory.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.complaint.deleteMany()
  await prisma.technician.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin Users
  console.log("👤 Creating admin users...")
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin1 = await prisma.user.create({
    data: {
      email: "admin@test.com",
      password_hash: adminPassword,
      name: "Admin User",
      phone: "+1234567890",
      role: "admin",
    },
  })

  const admin2 = await prisma.user.create({
    data: {
      email: "swetha@test.com",
      password_hash: "$2a$10$slYQmyNdGzin7olVeZixHOpsBPwqPkBR6uYMKnvxNs8qIJvlWdUTe", // bcrypt hash of "12345"
      name: "Swetha Admin",
      phone: "+1234567891",
      role: "admin",
    },
  })

  // Create Customer Users
  console.log("👥 Creating customer users...")
  const customerPassword = await bcrypt.hash("password123", 10)
  const customers = []
  
  const customerNames = [
    { name: "John Doe", email: "john.doe@example.com", phone: "+1234567001" },
    { name: "Jane Smith", email: "jane.smith@example.com", phone: "+1234567002" },
    { name: "Bob Johnson", email: "bob.johnson@example.com", phone: "+1234567003" },
    { name: "Alice Williams", email: "alice.williams@example.com", phone: "+1234567004" },
    { name: "Charlie Brown", email: "charlie.brown@example.com", phone: "+1234567005" },
    { name: "Diana Prince", email: "diana.prince@example.com", phone: "+1234567006" },
    { name: "Ethan Hunt", email: "ethan.hunt@example.com", phone: "+1234567007" },
    { name: "Fiona Green", email: "fiona.green@example.com", phone: "+1234567008" },
  ]

  for (const customerData of customerNames) {
    const customer = await prisma.user.create({
      data: {
        email: customerData.email,
        password_hash: customerPassword,
        name: customerData.name,
        phone: customerData.phone,
        city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][Math.floor(Math.random() * 5)],
        country: "USA",
        role: "user",
      },
    })
    customers.push(customer)
  }

  // Create Technicians
  console.log("🔧 Creating technicians...")
  const technicians = []
  const technicianData = [
    { name: "Mike Technician", email: "mike.tech@example.com", phone: "+1234568001", specialization: "Electrical" },
    { name: "Sarah Engineer", email: "sarah.eng@example.com", phone: "+1234568002", specialization: "Plumbing" },
    { name: "Tom Fixer", email: "tom.fixer@example.com", phone: "+1234568003", specialization: "HVAC" },
    { name: "Lisa Repair", email: "lisa.repair@example.com", phone: "+1234568004", specialization: "General" },
    { name: "David Handyman", email: "david.handy@example.com", phone: "+1234568005", specialization: "Electronics" },
  ]

  for (const techData of technicianData) {
    const technician = await prisma.technician.create({
      data: {
        name: techData.name,
        email: techData.email,
        phone: techData.phone,
        specialization: techData.specialization,
        availability: Math.random() > 0.3 ? "available" : "busy",
      },
    })
    technicians.push(technician)
  }

  // Create Complaints
  console.log("📝 Creating complaints...")
  const complaints = []
  const complaintTitles = [
    "Air conditioner not working",
    "Leaky faucet in kitchen",
    "Electrical outlet not functioning",
    "Heating system malfunction",
    "Internet connection issues",
    "Refrigerator making strange noise",
    "Water heater not heating",
    "Door lock not working",
    "Washing machine not draining",
    "TV screen flickering",
    "Garbage disposal jammed",
    "Ceiling fan not spinning",
    "Microwave not heating",
    "Oven temperature inaccurate",
    "Dishwasher not cleaning properly",
  ]

  const categories = ["General", "Product Quality", "Service", "Billing", "Other"]
  const statuses = ["Open", "In Progress", "Resolved", "Closed"]
  const priorities = ["low", "medium", "high"]

  for (let i = 0; i < complaintTitles.length; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const technician = Math.random() > 0.5 ? technicians[Math.floor(Math.random() * technicians.length)] : null
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    const complaint = await prisma.complaint.create({
      data: {
        user_id: customer.id,
        technician_id: technician?.id,
        title: complaintTitles[i],
        description: `Detailed description of the issue: ${complaintTitles[i]}. This is a comprehensive description of the problem that needs to be resolved. The customer has reported this issue and is awaiting resolution.`,
        category: categories[Math.floor(Math.random() * categories.length)],
        status: status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      },
    })
    complaints.push(complaint)
  }

  // Create Feedbacks
  console.log("💬 Creating feedbacks...")
  const feedbackMessages = [
    "Thank you for the quick response!",
    "The issue has been partially resolved but still needs attention.",
    "Excellent service, very satisfied!",
    "The technician was professional and helpful.",
    "Still experiencing the same problem.",
    "Great customer support team.",
    "Issue resolved completely, thank you!",
    "Need more information about the resolution.",
    "Very happy with the service provided.",
    "Could you please provide an update?",
  ]

  // Create feedbacks for complaints
  for (const complaint of complaints) {
    if (Math.random() > 0.4) { // 60% chance of having feedback
      const numFeedbacks = Math.floor(Math.random() * 3) + 1 // 1-3 feedbacks per complaint
      
      for (let i = 0; i < numFeedbacks; i++) {
        await prisma.feedback.create({
          data: {
            user_id: complaint.user_id,
            complaint_id: complaint.id,
            message: feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)],
            rating: Math.floor(Math.random() * 5) + 1, // 1-5 rating
            created_at: new Date(complaint.created_at.getTime() + (i + 1) * 24 * 60 * 60 * 1000), // Days after complaint
          },
        })
      }
    }
  }

  // Create standalone feedbacks
  for (let i = 0; i < 5; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    await prisma.feedback.create({
      data: {
        user_id: customer.id,
        title: `General Feedback ${i + 1}`,
        message: feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)],
        rating: Math.floor(Math.random() * 5) + 1,
      },
    })
  }

  // Create Service History
  console.log("📋 Creating service history...")
  const serviceDescriptions = [
    "Routine maintenance check completed",
    "Repair service performed successfully",
    "Installation completed",
    "Inspection and testing done",
    "Replacement of faulty component",
    "System upgrade performed",
    "Cleaning and calibration completed",
  ]

  for (const complaint of complaints.filter(c => c.status === "Resolved" || c.status === "Closed")) {
    if (complaint.technician_id && Math.random() > 0.5) {
      await prisma.serviceHistory.create({
        data: {
          user_id: complaint.user_id,
          technician_id: complaint.technician_id,
          complaint_id: complaint.id,
          service_date: new Date(complaint.created_at.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Within 7 days of complaint
          description: serviceDescriptions[Math.floor(Math.random() * serviceDescriptions.length)],
          duration_minutes: Math.floor(Math.random() * 180) + 30, // 30-210 minutes
          status: "completed",
          notes: "Service completed successfully. Customer satisfied with the work performed.",
        },
      })
    }
  }

  // Create Notifications
  console.log("🔔 Creating notifications...")
  const notificationTypes = ["complaint_raised", "complaint_updated", "feedback_received", "service_completed"]
  const notificationMessages = [
    "New complaint has been raised",
    "Complaint status has been updated",
    "New feedback received",
    "Service has been completed",
  ]

  for (const admin of [admin1, admin2]) {
    for (let i = 0; i < 5; i++) {
      const complaint = complaints[Math.floor(Math.random() * complaints.length)]
      const typeIndex = Math.floor(Math.random() * notificationTypes.length)
      
      await prisma.notification.create({
        data: {
          user_id: admin.id,
          complaint_id: complaint.id,
          type: notificationTypes[typeIndex],
          message: notificationMessages[typeIndex],
          is_read: Math.random() > 0.5,
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      })
    }
  }

  console.log("✅ Seed completed successfully!")
  console.log("\n📊 Summary:")
  console.log(`   - Admin users: 2`)
  console.log(`   - Customer users: ${customers.length}`)
  console.log(`   - Technicians: ${technicians.length}`)
  console.log(`   - Complaints: ${complaints.length}`)
  console.log(`   - Feedbacks: ${await prisma.feedback.count()}`)
  console.log(`   - Service History: ${await prisma.serviceHistory.count()}`)
  console.log(`   - Notifications: ${await prisma.notification.count()}`)
  console.log("\n🔑 Login Credentials:")
  console.log("   Admin: admin@test.com / admin123")
  console.log("   Admin: swetha@test.com / 12345")
  console.log("   Customer: john.doe@example.com / password123")
  console.log("   (All customers use password: password123)")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

