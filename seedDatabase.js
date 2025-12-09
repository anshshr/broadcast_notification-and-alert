import mongoose from "mongoose";
import {
  trainingUserModel,
  trainingCenterModel,
  trainingMachineModel,
  courseModuleModel,
  courseCenterModel,
  userTrainingAssignmentModel,
  assignmentCenterAccessModel,
  trainingSessionModel,
  certificateModel,
} from "./trainingModels.js";

const MONGO_URI =
  "mongodb+srv://anshshr:ansh123@freelancing-platform.esbya.mongodb.net/iot_data_collection";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep data)
    await trainingUserModel.deleteMany({});
    await trainingCenterModel.deleteMany({});
    await trainingMachineModel.deleteMany({});
    await courseModuleModel.deleteMany({});
    await courseCenterModel.deleteMany({});
    await userTrainingAssignmentModel.deleteMany({});
    await assignmentCenterAccessModel.deleteMany({});
    await trainingSessionModel.deleteMany({});
    await certificateModel.deleteMany({});
    console.log("🧹 Cleared existing data");

    // ========== CREATE USERS ==========
    const users = await trainingUserModel.insertMany([
      {
        email: "rahul.kumar@example.com",
        password: "SecurePass123!",
        full_name: "Rahul Kumar",
        phone: "+91-9876543210",
        role: "trainee",
        status: "active",
      },
      {
        email: "priya.sharma@example.com",
        password: "SecurePass456!",
        full_name: "Priya Sharma",
        phone: "+91-9876543211",
        role: "trainee",
        status: "active",
      },
      {
        email: "amit.trainer@example.com",
        password: "TrainerPass789!",
        full_name: "Amit Patel",
        phone: "+91-9876543212",
        role: "trainer",
        status: "active",
      },
      {
        email: "admin@surakshaschakra.com",
        password: "AdminPass2025!",
        full_name: "Admin User",
        phone: "+91-9876543213",
        role: "admin",
        status: "active",
      },
    ]);

    console.log(`✅ Created ${users.length} training users`);

    // ========== CREATE TRAINING CENTERS ==========
    const centers = await trainingCenterModel.insertMany([
      {
        name: "Malviya Nagar Training Center",
        description:
          "State-of-the-art training facility with advanced CNC and welding equipment",
        address: "Shop 12, Industrial Area, Malviya Nagar",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302017",
        latitude: 26.9124,
        longitude: 75.7873,
        contact_number: "+91-141-2345678",
        contact_email: "malviya@surakshaschakra.com",
        status: "active",
        specializations: ["CNC Lathe", "TIG Welder", "Heavy Lathe"],
      },
      {
        name: "Vaishali Nagar Training Hub",
        description:
          "Modern facility specializing in pump and lathe operations",
        address: "Plot 45, Vaishali Nagar",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302021",
        latitude: 26.9065,
        longitude: 75.7445,
        contact_number: "+91-141-2345679",
        contact_email: "vaishali@surakshaschakra.com",
        status: "active",
        specializations: ["Heavy Lathe", "Centrifugal Pump", "CNC Lathe"],
      },
      {
        name: "Bani Park Training Facility",
        description:
          "Comprehensive training center with welding and conveyor systems",
        address: "Street 5, Bani Park",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302006",
        latitude: 26.9212,
        longitude: 75.7891,
        contact_number: "+91-141-2345680",
        contact_email: "banipark@surakshaschakra.com",
        status: "active",
        specializations: ["TIG Welder", "Conveyor System", "CNC Lathe"],
      },
    ]);

    console.log(`✅ Created ${centers.length} training centers`);

    // ========== CREATE MACHINES ==========
    const machines = await trainingMachineModel.insertMany([
      {
        name: "CNC Lathe Pro",
        description: "High-precision CNC lathe for advanced operations",
        type: "CNC Lathe",
        model_number: "CL-3000",
        manufacturer: "Haas Automation",
        year: 2023,
        center_id: centers[0]._id,
        latitude: 26.91245,
        longitude: 75.78735,
        status: "active",
        qr_code: "QR_m_tc1_1_2025",
        model_3d_url: "https://cdn.example.com/models/cnc_lathe_pro.glb",
        specifications: {
          max_speed: "4000 RPM",
          power: "15 kW",
          capacity: "200mm diameter",
          weight: "2500 kg",
        },
        last_maintenance: new Date("2025-12-01"),
        next_maintenance: new Date("2025-12-15"),
      },
      {
        name: "Heavy Lathe XL",
        description: "Industrial-grade lathe for heavy-duty operations",
        type: "Heavy Lathe",
        model_number: "HL-5000",
        manufacturer: "DMG Mori",
        year: 2022,
        center_id: centers[1]._id,
        latitude: 26.90655,
        longitude: 75.74455,
        status: "active",
        qr_code: "QR_m_tc2_1_2025",
        model_3d_url: "https://cdn.example.com/models/heavy_lathe_xl.glb",
        specifications: {
          max_speed: "3000 RPM",
          power: "25 kW",
          capacity: "300mm diameter",
          weight: "4500 kg",
        },
        last_maintenance: new Date("2025-12-05"),
        next_maintenance: new Date("2025-12-20"),
      },
      {
        name: "TIG Welder Professional",
        description: "Advanced TIG welding equipment for precision work",
        type: "TIG Welder",
        model_number: "TW-200",
        manufacturer: "Lincoln Electric",
        year: 2024,
        center_id: centers[2]._id,
        latitude: 26.92125,
        longitude: 75.78915,
        status: "active",
        qr_code: "QR_m_tc3_1_2025",
        model_3d_url: "https://cdn.example.com/models/tig_welder.glb",
        specifications: {
          max_amperage: "200A",
          power: "10 kW",
          cooling: "Water cooled",
          weight: "150 kg",
        },
        last_maintenance: new Date("2025-12-03"),
        next_maintenance: new Date("2025-12-17"),
      },
      {
        name: "Centrifugal Pump Station",
        description: "Industrial centrifugal pump with training setup",
        type: "Centrifugal Pump",
        model_number: "CP-500",
        manufacturer: "Grundfos",
        year: 2023,
        center_id: centers[1]._id,
        latitude: 26.90665,
        longitude: 75.74465,
        status: "active",
        qr_code: "QR_m_tc2_2_2025",
        model_3d_url: "https://cdn.example.com/models/pump_station.glb",
        specifications: {
          capacity: "500 LPM",
          power: "5 kW",
          head: "30 meters",
          weight: "800 kg",
        },
        last_maintenance: new Date("2025-12-02"),
        next_maintenance: new Date("2025-12-16"),
      },
    ]);

    console.log(`✅ Created ${machines.length} training machines`);

    // ========== CREATE COURSE MODULES ==========
    const courses = await courseModuleModel.insertMany([
      {
        module_name: "CNC Lathe Operations",
        machine_type: "CNC Lathe",
        category: "CNC",
        description:
          "Learn professional CNC lathe operations including programming, setup, and advanced cutting techniques.",
        total_hours_required: 10,
        level: "Intermediate",
        prerequisites: ["Basic machine operation", "Safety certification"],
        syllabus: [
          "Introduction to CNC programming",
          "Machine setup and tooling",
          "G-code basics",
          "Advanced cutting techniques",
          "Quality control and inspection",
        ],
        certification_name: "CNC Lathe Operator - Level 2",
        price: 5000,
        currency: "INR",
        icon_name: "cog",
        color: "#3B82F6",
        status: "active",
      },
      {
        module_name: "Heavy Lathe Mastery",
        machine_type: "Heavy Lathe",
        category: "CNC",
        description:
          "Comprehensive training on operating industrial-grade heavy lathe machinery",
        total_hours_required: 15,
        level: "Advanced",
        prerequisites: ["CNC Lathe Operations", "2+ years experience"],
        syllabus: [
          "Heavy lathe fundamentals",
          "Advanced tool geometry",
          "Large component machining",
          "Production optimization",
          "Maintenance procedures",
        ],
        certification_name: "Heavy Lathe Operator - Level 3",
        price: 7500,
        currency: "INR",
        icon_name: "settings",
        color: "#EF4444",
        status: "active",
      },
      {
        module_name: "TIG Welding Fundamentals",
        machine_type: "TIG Welder",
        category: "Welding",
        description:
          "Master TIG welding techniques for precision metal joining applications",
        total_hours_required: 12,
        level: "Beginner",
        prerequisites: ["Safety training"],
        syllabus: [
          "Welding safety and PPE",
          "Equipment setup and maintenance",
          "Electrode selection",
          "Different joint types",
          "Quality assessment",
        ],
        certification_name: "TIG Welder - Level 1",
        price: 4500,
        currency: "INR",
        icon_name: "flame",
        color: "#F59E0B",
        status: "active",
      },
      {
        module_name: "Pump Maintenance & Operations",
        machine_type: "Centrifugal Pump",
        category: "Pumps",
        description:
          "Learn centrifugal pump operations, troubleshooting, and preventive maintenance",
        total_hours_required: 8,
        level: "Intermediate",
        prerequisites: ["Mechanical fundamentals"],
        syllabus: [
          "Pump theory and principles",
          "Installation and commissioning",
          "Operation procedures",
          "Troubleshooting guide",
          "Preventive maintenance",
        ],
        certification_name: "Pump Operator - Level 2",
        price: 3500,
        currency: "INR",
        icon_name: "droplet",
        color: "#06B6D4",
        status: "active",
      },
    ]);

    console.log(`✅ Created ${courses.length} course modules`);

    // ========== CREATE COURSE-CENTER MAPPINGS ==========
    const courseCenters = await courseCenterModel.insertMany([
      { module_id: courses[0]._id, center_id: centers[0]._id },
      { module_id: courses[0]._id, center_id: centers[1]._id },
      { module_id: courses[1]._id, center_id: centers[1]._id },
      { module_id: courses[2]._id, center_id: centers[2]._id },
      { module_id: courses[3]._id, center_id: centers[1]._id },
    ]);

    console.log(`✅ Created ${courseCenters.length} course-center mappings`);

    // ========== CREATE USER TRAINING ASSIGNMENTS ==========
    const expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + 3);

    const assignments = await userTrainingAssignmentModel.insertMany([
      {
        user_id: users[0]._id,
        module_id: courses[0]._id,
        assigned_date: new Date("2025-11-01"),
        expiry_date: expireDate,
        status: "active",
        assigned_by: users[3]._id,
      },
      {
        user_id: users[0]._id,
        module_id: courses[3]._id,
        assigned_date: new Date("2025-12-01"),
        expiry_date: expireDate,
        status: "active",
        assigned_by: users[3]._id,
      },
      {
        user_id: users[1]._id,
        module_id: courses[0]._id,
        assigned_date: new Date("2025-10-15"),
        expiry_date: new Date("2025-11-25"),
        status: "completed",
        completed_at: new Date("2025-11-25T15:30:00Z"),
        assigned_by: users[3]._id,
      },
      {
        user_id: users[1]._id,
        module_id: courses[2]._id,
        assigned_date: new Date("2025-12-05"),
        expiry_date: expireDate,
        status: "active",
        assigned_by: users[3]._id,
      },
    ]);

    console.log(`✅ Created ${assignments.length} user training assignments`);

    // ========== CREATE ASSIGNMENT-CENTER ACCESS ==========
    const accessRecords = await assignmentCenterAccessModel.insertMany([
      { assignment_id: assignments[0]._id, center_id: centers[0]._id },
      { assignment_id: assignments[0]._id, center_id: centers[1]._id },
      { assignment_id: assignments[1]._id, center_id: centers[1]._id },
      { assignment_id: assignments[2]._id, center_id: centers[0]._id },
      { assignment_id: assignments[2]._id, center_id: centers[1]._id },
      { assignment_id: assignments[3]._id, center_id: centers[2]._id },
    ]);

    console.log(`✅ Created ${accessRecords.length} access records`);

    // ========== CREATE TRAINING SESSIONS ==========
    const sessions = await trainingSessionModel.insertMany([
      {
        user_id: users[0]._id,
        assignment_id: assignments[0]._id,
        center_id: centers[0]._id,
        machine_id: machines[0]._id,
        check_in_time: new Date("2025-11-10T09:00:00Z"),
        check_out_time: new Date("2025-11-10T12:00:00Z"),
        hours_completed: 3.0,
        status: "approved",
        notes: "Basic operations and safety training",
        approved_by: users[2]._id,
        approved_at: new Date("2025-11-10T13:00:00Z"),
        rating: 5,
      },
      {
        user_id: users[0]._id,
        assignment_id: assignments[0]._id,
        center_id: centers[1]._id,
        machine_id: machines[1]._id,
        check_in_time: new Date("2025-11-20T14:00:00Z"),
        check_out_time: new Date("2025-11-20T16:00:00Z"),
        hours_completed: 2.0,
        status: "approved",
        notes: "Advanced cutting techniques",
        approved_by: users[2]._id,
        approved_at: new Date("2025-11-20T17:00:00Z"),
        rating: 5,
      },
      {
        user_id: users[0]._id,
        assignment_id: assignments[0]._id,
        center_id: centers[0]._id,
        machine_id: machines[0]._id,
        check_in_time: new Date("2025-11-25T10:00:00Z"),
        check_out_time: new Date("2025-11-25T15:00:00Z"),
        hours_completed: 5.0,
        status: "approved",
        notes: "Final practical assessment and complex operations",
        approved_by: users[2]._id,
        approved_at: new Date("2025-11-25T16:00:00Z"),
        rating: 5,
      },
      {
        user_id: users[1]._id,
        assignment_id: assignments[2]._id,
        center_id: centers[0]._id,
        machine_id: machines[0]._id,
        check_in_time: new Date("2025-11-05T08:30:00Z"),
        check_out_time: new Date("2025-11-05T11:30:00Z"),
        hours_completed: 3.0,
        status: "approved",
        notes: "Introduction session",
        approved_by: users[2]._id,
        approved_at: new Date("2025-11-05T12:00:00Z"),
        rating: 4,
      },
      {
        user_id: users[1]._id,
        assignment_id: assignments[2]._id,
        center_id: centers[1]._id,
        machine_id: machines[1]._id,
        check_in_time: new Date("2025-11-15T09:00:00Z"),
        check_out_time: new Date("2025-11-15T14:00:00Z"),
        hours_completed: 5.0,
        status: "approved",
        notes: "Intermediate level training",
        approved_by: users[2]._id,
        approved_at: new Date("2025-11-15T15:00:00Z"),
        rating: 5,
      },
      {
        user_id: users[1]._id,
        assignment_id: assignments[2]._id,
        center_id: centers[0]._id,
        machine_id: machines[0]._id,
        check_in_time: new Date("2025-11-25T10:00:00Z"),
        check_out_time: new Date("2025-11-25T13:00:00Z"),
        hours_completed: 2.0,
        status: "approved",
        notes: "Final session - completion",
        approved_by: users[2]._id,
        approved_at: new Date("2025-11-25T14:00:00Z"),
        rating: 5,
      },
      {
        user_id: users[0]._id,
        assignment_id: assignments[1]._id,
        center_id: centers[1]._id,
        machine_id: machines[3]._id,
        check_in_time: new Date("2025-12-08T10:00:00Z"),
        check_out_time: new Date("2025-12-08T12:00:00Z"),
        hours_completed: 2.0,
        status: "approved",
        notes: "Pump operations basics",
        approved_by: users[2]._id,
        approved_at: new Date("2025-12-08T13:00:00Z"),
        rating: 4,
      },
    ]);

    console.log(`✅ Created ${sessions.length} training sessions`);

    // ========== CREATE CERTIFICATES ==========
    const certificates = await certificateModel.insertMany([
      {
        assignment_id: assignments[2]._id,
        user_id: users[1]._id,
        certificate_number: "SC-CNC-2025-001",
        certificate_url: "https://cdn.example.com/certificates/cert_001.pdf",
        issued_date: new Date("2025-11-26"),
        expiry_date: new Date("2027-11-26"),
        verification_code: "VERIFY-SC-CNC-2025-001",
      },
    ]);

    console.log(`✅ Created ${certificates.length} certificates`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Training Centers: ${centers.length}`);
    console.log(`   - Machines: ${machines.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Assignments: ${assignments.length}`);
    console.log(`   - Sessions: ${sessions.length}`);
    console.log(`   - Certificates: ${certificates.length}`);

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
