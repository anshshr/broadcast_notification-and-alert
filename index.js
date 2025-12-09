import express from "express";
import cors from "cors";
import fs from "fs";
import admin from "firebase-admin";
import mongoose from "mongoose";
import { userModel, alertModel, machineModel } from "./models.js";
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

// ----------- FIREBASE SERVICE ACCOUNT LOAD -----------
const serviceAccountPath = "./serviceAccountKey.json";

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ Firebase key file not found!");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ---------- MONGOOSE CONNECTION ----------
const MONGO_URI =
  "mongodb+srv://anshshr:ansh123@freelancing-platform.esbya.mongodb.net/iot_data_collection";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------- EXPRESS APP ----------
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("server started");
});

app.get("/health", (req, res) => {
  res.send("healthy");
});

// ---------- CREATE ALERT ----------
app.post("/postAlert", async (req, res) => {
  try {
    const alertData = req.body;

    const newAlert = await alertModel.create(alertData);

    res.status(200).json({
      message: "Successfully added machine alert",
      alert: newAlert,
    });
  } catch (error) {
    res.status(400).json({
      message: "Unable to save alert",
      error: error.message,
    });
  }
});

// ---------- MACHINE ROUTES ----------
// Get all machines
app.get("/machines", async (req, res) => {
  try {
    const machines = await machineModel.find();
    res.status(200).json({ count: machines.length, data: machines });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new machine
app.post("/machines", async (req, res) => {
  try {
    const {
      username,
      alertType,
      machineName,
      machine_defect_url,
      machine_desc,
      machine_location,
      machine_under_maintainance,
      machine_maintainance_status,
      start_time,
      end_time,
    } = req.body;

    if (!machineName || !machine_location || !start_time || !end_time) {
      return res.status(400).json({
        error:
          "Required fields: machineName, machine_location, start_time, end_time",
      });
    }

    const machine = await machineModel.create({
      username,
      alertType,
      machineName,
      machine_defect_url,
      machine_desc,
      machine_location,
      machine_under_maintainance,
      machine_maintainance_status,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
    });

    res.status(201).json({ message: "Machine created", machine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- GET ALL ALERTS ----------
app.get("/getAlerts", async (req, res) => {
  try {
    const data = await alertModel.find();
    res.status(200).json({
      message: "Alerts fetched",
      data,
    });
  } catch (error) {
    res.status(400).json({
      message: "Unable to fetch alerts",
      error: error.message,
    });
  }
});

app.post("/broadcast-notification", async (req, res) => {
  try {
    const { title, body } = req.body;

    const users = await userModel.find({ FCM_TOKEN: { $ne: null } });

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      const message = {
        token: user.FCM_TOKEN,
        notification: { title, body },
        data: { screen: "screen", id: "123" },
        android: {
          priority: "high",
          collapseKey: String(Date.now()),
          ttl: 86400 * 1000, // 24 hours in milliseconds
          // OR ttl: "86400s"
        },
      };

      try {
        await admin.messaging().send(message);
        successCount++;
      } catch (err) {
        console.error("FCM Error:", err.message);
        failCount++;
      }
    }

    res.status(200).json({
      message: "Broadcast completed",
      sent_to: successCount,
      failed_for: failCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Broadcast failed",
      error: error.message,
    });
  }
});

// ---------- UPSERT USER ----------
app.post("/upsert-user", async (req, res) => {
  try {
    const { firstname, lastname, role, email, password, verified, FCM_TOKEN } =
      req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    let user = await userModel.findOne({ email });

    if (user) {
      const updatedUser = await userModel.findOneAndUpdate(
        { email },
        { FCM_TOKEN },
        { new: true }
      );

      return res.status(200).json({
        message: "FCM token updated",
        exists: true,
        user: updatedUser,
      });
    }

    if (!firstname || !password)
      return res.status(400).json({
        error: "Firstname & Password required for new user",
      });

    user = await userModel.create({
      firstname,
      lastname,
      role: role || "trainee",
      email,
      password,
      verified: verified || false,
      FCM_TOKEN,
    });

    res.status(201).json({
      message: "New user created",
      exists: false,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Upsert failed",
      error: error.message,
    });
  }
});

// ========== TRAINING SYSTEM ENDPOINTS ==========

// ========== AUTHENTICATION & USERS ==========
// Register training user
app.post("/training/auth/register", async (req, res) => {
  try {
    const { email, password, full_name, phone, role } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        error: "Required fields: email, password, full_name",
      });
    }

    const existingUser = await trainingUserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await trainingUserModel.create({
      email,
      password,
      full_name,
      phone,
      role: role || "trainee",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        user_id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Login training user
app.post("/training/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await trainingUserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        photo_url: user.photo_url,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// Get training user profile
app.get("/training/auth/profile/:userId", async (req, res) => {
  try {
    const user = await trainingUserModel.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        user_id: user._id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        photo_url: user.photo_url,
        created_at: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// ========== TRAINING CENTERS ==========
// Get all training centers
app.get("/training/centers", async (req, res) => {
  try {
    const { city, status } = req.query;
    let query = {};

    if (city) query.city = city;
    if (status) query.status = status;

    const centers = await trainingCenterModel.find(query);

    res.status(200).json({
      success: true,
      total: centers.length,
      data: centers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create training center (Admin only)
app.post("/training/centers", async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      contact_number,
      contact_email,
      specializations,
    } = req.body;

    if (
      !name ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !contact_number ||
      !contact_email
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const center = await trainingCenterModel.create({
      name,
      description,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      contact_number,
      contact_email,
      specializations: specializations || [],
    });

    res.status(201).json({
      message: "Training center created",
      center,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create center",
      error: error.message,
    });
  }
});

// Get center by ID with machines
app.get("/training/centers/:centerId", async (req, res) => {
  try {
    const center = await trainingCenterModel.findById(req.params.centerId);

    if (!center) {
      return res.status(404).json({ error: "Center not found" });
    }

    const machines = await trainingMachineModel.find({
      center_id: req.params.centerId,
    });

    res.status(200).json({
      success: true,
      center,
      machines,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== MACHINES ==========
// Get all machines
app.get("/training/machines", async (req, res) => {
  try {
    const { center_id, status } = req.query;
    let query = {};

    if (center_id) query.center_id = center_id;
    if (status) query.status = status;

    const machines = await trainingMachineModel
      .find(query)
      .populate("center_id", "name address city");

    res.status(200).json({
      success: true,
      total: machines.length,
      data: machines,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create machine
app.post("/training/machines", async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      model_number,
      manufacturer,
      year,
      center_id,
      latitude,
      longitude,
      qr_code,
      model_3d_url,
      specifications,
    } = req.body;

    if (!name || !type || !center_id) {
      return res
        .status(400)
        .json({ error: "Required fields: name, type, center_id" });
    }

    // Verify center exists
    const center = await trainingCenterModel.findById(center_id);
    if (!center) {
      return res.status(404).json({ error: "Training center not found" });
    }

    const machine = await trainingMachineModel.create({
      name,
      description,
      type,
      model_number,
      manufacturer,
      year,
      center_id,
      latitude,
      longitude,
      qr_code,
      model_3d_url,
      specifications: specifications || {},
    });

    res.status(201).json({
      message: "Machine created",
      machine,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create machine",
      error: error.message,
    });
  }
});

// Get machine by ID
app.get("/training/machines/:machineId", async (req, res) => {
  try {
    const machine = await trainingMachineModel
      .findById(req.params.machineId)
      .populate("center_id");

    if (!machine) {
      return res.status(404).json({ error: "Machine not found" });
    }

    res.status(200).json({
      success: true,
      machine,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== COURSES ==========
// Get all courses
app.get("/training/courses", async (req, res) => {
  try {
    const { category, level, machine_type } = req.query;
    let query = {};

    if (category) query.category = category;
    if (level) query.level = level;
    if (machine_type) query.machine_type = machine_type;

    const courses = await courseModuleModel.find(query);

    res.status(200).json({
      success: true,
      total: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create course module
app.post("/training/courses", async (req, res) => {
  try {
    const {
      module_name,
      machine_type,
      category,
      description,
      total_hours_required,
      level,
      prerequisites,
      syllabus,
      certification_name,
      price,
      currency,
      icon_name,
      color,
    } = req.body;

    if (!module_name || !machine_type || !total_hours_required) {
      return res.status(400).json({
        error:
          "Required fields: module_name, machine_type, total_hours_required",
      });
    }

    const course = await courseModuleModel.create({
      module_name,
      machine_type,
      category,
      description,
      total_hours_required,
      level,
      prerequisites: prerequisites || [],
      syllabus: syllabus || [],
      certification_name,
      price: price || 0,
      currency: currency || "INR",
      icon_name,
      color,
    });

    res.status(201).json({
      message: "Course created",
      course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create course",
      error: error.message,
    });
  }
});

// ========== COURSE ENROLLMENT ==========
// Enroll user in course
app.post("/training/enroll", async (req, res) => {
  try {
    const { user_id, module_id, assigned_center_ids } = req.body;

    if (!user_id || !module_id || !assigned_center_ids) {
      return res.status(400).json({
        error: "Required fields: user_id, module_id, assigned_center_ids",
      });
    }

    // Verify user exists
    const user = await trainingUserModel.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify course exists
    const course = await courseModuleModel.findById(module_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Calculate expiry date (3 months from now)
    const expiry_date = new Date();
    expiry_date.setMonth(expiry_date.getMonth() + 3);

    // Create assignment
    const assignment = await userTrainingAssignmentModel.create({
      user_id,
      module_id,
      expiry_date,
      status: "active",
    });

    // Create center access records
    for (const center_id of assigned_center_ids) {
      await assignmentCenterAccessModel.create({
        assignment_id: assignment._id,
        center_id,
      });
    }

    res.status(201).json({
      message: "Successfully enrolled in course",
      assignment: {
        assignment_id: assignment._id,
        user_id,
        module_id,
        module_name: course.module_name,
        total_hours_required: course.total_hours_required,
        allowed_center_ids: assigned_center_ids,
        assigned_date: assignment.assigned_date,
        expiry_date: assignment.expiry_date,
        status: assignment.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Enrollment failed",
      error: error.message,
    });
  }
});

// Get user's enrolled courses
app.get("/training/users/:userId/courses", async (req, res) => {
  try {
    const { status } = req.query;
    let query = { user_id: req.params.userId };

    if (status) query.status = status;

    const assignments = await userTrainingAssignmentModel
      .find(query)
      .populate("module_id")
      .populate("user_id");

    const coursesData = await Promise.all(
      assignments.map(async (assignment) => {
        const centerAccess = await assignmentCenterAccessModel
          .find({ assignment_id: assignment._id })
          .populate("center_id");

        const sessions = await trainingSessionModel.find({
          assignment_id: assignment._id,
        });

        const totalHoursCompleted = sessions.reduce(
          (sum, session) => sum + (session.hours_completed || 0),
          0
        );

        return {
          assignment_id: assignment._id,
          module_id: assignment.module_id._id,
          module_name: assignment.module_id.module_name,
          machine_type: assignment.module_id.machine_type,
          total_hours_required: assignment.module_id.total_hours_required,
          total_hours_completed: totalHoursCompleted,
          progress_percentage: (
            (totalHoursCompleted / assignment.module_id.total_hours_required) *
            100
          ).toFixed(2),
          is_completed: assignment.status === "completed",
          completion_date: assignment.completed_at,
          allowed_centers: centerAccess.map((ca) => ({
            center_id: ca.center_id._id,
            center_name: ca.center_id.name,
          })),
          session_count: sessions.length,
          last_session_date:
            sessions.length > 0
              ? sessions[sessions.length - 1].createdAt
              : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      total: coursesData.length,
      data: coursesData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
});

// ========== TRAINING SESSIONS ==========
// Check-in to training session
app.post("/training/sessions/check-in", async (req, res) => {
  try {
    const { user_id, assignment_id, machine_id, center_id, notes } = req.body;

    if (!user_id || !assignment_id || !machine_id || !center_id) {
      return res.status(400).json({
        error: "Required fields: user_id, assignment_id, machine_id, center_id",
      });
    }

    // Check if user has active session
    const activeSession = await trainingSessionModel.findOne({
      user_id,
      status: "in-progress",
    });

    if (activeSession) {
      return res.status(409).json({
        error: "User already has an active session",
      });
    }

    const session = await trainingSessionModel.create({
      user_id,
      assignment_id,
      machine_id,
      center_id,
      check_in_time: new Date(),
      notes,
      status: "in-progress",
    });

    res.status(201).json({
      message: "Check-in successful",
      session: {
        session_id: session._id,
        user_id,
        assignment_id,
        machine_id,
        center_id,
        check_in_time: session.check_in_time,
        status: session.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Check-in failed",
      error: error.message,
    });
  }
});

// Check-out from training session
app.post("/training/sessions/check-out", async (req, res) => {
  try {
    const { session_id, notes } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: "session_id required" });
    }

    const session = await trainingSessionModel.findById(session_id);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status !== "in-progress") {
      return res.status(400).json({ error: "Session is not active" });
    }

    const check_out_time = new Date();
    const hours_completed =
      (check_out_time - session.check_in_time) / (1000 * 60 * 60);

    session.check_out_time = check_out_time;
    session.hours_completed = parseFloat(hours_completed.toFixed(2));
    session.status = "completed";
    if (notes) session.notes = notes;

    await session.save();

    // Get assignment and course info
    const assignment = await userTrainingAssignmentModel
      .findById(session.assignment_id)
      .populate("module_id");

    const allSessions = await trainingSessionModel.find({
      assignment_id: session.assignment_id,
    });

    const totalHours = allSessions.reduce(
      (sum, s) => sum + (s.hours_completed || 0),
      0
    );

    const progress_percentage = (
      (totalHours / assignment.module_id.total_hours_required) *
      100
    ).toFixed(2);

    res.status(200).json({
      message: "Check-out successful",
      session: {
        session_id: session._id,
        check_in_time: session.check_in_time,
        check_out_time: session.check_out_time,
        hours_completed: session.hours_completed,
        status: session.status,
      },
      course_progress: {
        total_hours_completed: totalHours,
        total_hours_required: assignment.module_id.total_hours_required,
        progress_percentage,
        remaining_hours: (
          assignment.module_id.total_hours_required - totalHours
        ).toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Check-out failed",
      error: error.message,
    });
  }
});

// Get user's session history
app.get("/training/users/:userId/sessions", async (req, res) => {
  try {
    const { assignment_id, center_id, status } = req.query;
    let query = { user_id: req.params.userId };

    if (assignment_id) query.assignment_id = assignment_id;
    if (center_id) query.center_id = center_id;
    if (status) query.status = status;

    const sessions = await trainingSessionModel
      .find(query)
      .populate("assignment_id")
      .populate("center_id")
      .populate("machine_id")
      .sort({ check_in_time: -1 });

    res.status(200).json({
      success: true,
      total: sessions.length,
      data: sessions.map((s) => ({
        session_id: s._id,
        user_id: s.user_id,
        assignment_id: s.assignment_id._id,
        module_name: s.assignment_id.module_id,
        center_name: s.center_id.name,
        machine_name: s.machine_id.name,
        machine_type: s.machine_id.type,
        check_in_time: s.check_in_time,
        check_out_time: s.check_out_time,
        hours_completed: s.hours_completed,
        status: s.status,
        notes: s.notes,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sessions",
      error: error.message,
    });
  }
});

// Get user's active session
app.get("/training/users/:userId/sessions/active", async (req, res) => {
  try {
    const session = await trainingSessionModel
      .findOne({
        user_id: req.params.userId,
        status: "in-progress",
      })
      .populate("assignment_id")
      .populate("center_id")
      .populate("machine_id");

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "No active training session found",
      });
    }

    const elapsed_time = new Date() - session.check_in_time;
    const elapsed_hours = (elapsed_time / (1000 * 60 * 60)).toFixed(2);

    res.status(200).json({
      success: true,
      session: {
        session_id: session._id,
        module_name: session.assignment_id.module_id,
        center_name: session.center_id.name,
        machine_name: session.machine_id.name,
        check_in_time: session.check_in_time,
        elapsed_hours,
        status: session.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch active session",
      error: error.message,
    });
  }
});

// ========== PROGRESS TRACKING ==========
// Get course progress details
app.get(
  "/training/users/:userId/courses/:assignmentId/progress",
  async (req, res) => {
    try {
      const { userId, assignmentId } = req.params;

      const assignment = await userTrainingAssignmentModel
        .findById(assignmentId)
        .populate("module_id")
        .populate("user_id");

      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      const sessions = await trainingSessionModel
        .find({ assignment_id: assignmentId })
        .populate("center_id")
        .populate("machine_id")
        .sort({ check_in_time: 1 });

      const totalHours = sessions.reduce(
        (sum, s) => sum + (s.hours_completed || 0),
        0
      );

      const progress_percentage = (
        (totalHours / assignment.module_id.total_hours_required) *
        100
      ).toFixed(2);

      res.status(200).json({
        success: true,
        data: {
          assignment_id: assignment._id,
          user_id: assignment.user_id._id,
          user_name: assignment.user_id.full_name,
          module_name: assignment.module_id.module_name,
          machine_type: assignment.module_id.machine_type,
          total_hours_required: assignment.module_id.total_hours_required,
          total_hours_completed: totalHours,
          progress_percentage,
          is_completed: assignment.status === "completed",
          completion_date: assignment.completed_at,
          sessions: sessions.map((s) => ({
            session_id: s._id,
            center_name: s.center_id.name,
            machine_name: s.machine_id.name,
            check_in_time: s.check_in_time,
            check_out_time: s.check_out_time,
            hours_completed: s.hours_completed,
            status: s.status,
          })),
          statistics: {
            total_sessions: sessions.length,
            unique_centers: new Set(sessions.map((s) => s.center_id._id)).size,
            unique_machines: new Set(sessions.map((s) => s.machine_id._id))
              .size,
            average_hours_per_session: (
              totalHours / (sessions.length || 1)
            ).toFixed(2),
            first_session_date:
              sessions.length > 0 ? sessions[0].check_in_time : null,
            last_session_date:
              sessions.length > 0
                ? sessions[sessions.length - 1].check_out_time
                : null,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch progress",
        error: error.message,
      });
    }
  }
);

// Get user dashboard statistics
app.get("/training/users/:userId/dashboard", async (req, res) => {
  try {
    const user = await trainingUserModel.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const assignments = await userTrainingAssignmentModel.find({
      user_id: req.params.userId,
    });

    const sessions = await trainingSessionModel.find({
      user_id: req.params.userId,
    });

    const totalHours = sessions.reduce(
      (sum, s) => sum + (s.hours_completed || 0),
      0
    );

    const uniqueCenters = new Set(sessions.map((s) => s.center_id.toString()))
      .size;

    res.status(200).json({
      success: true,
      data: {
        user: {
          user_id: user._id,
          full_name: user.full_name,
          photo_url: user.photo_url,
        },
        statistics: {
          total_courses_enrolled: assignments.length,
          courses_completed: assignments.filter((a) => a.status === "completed")
            .length,
          courses_in_progress: assignments.filter((a) => a.status === "active")
            .length,
          total_training_hours: totalHours,
          total_sessions: sessions.length,
          unique_centers_visited: uniqueCenters,
          average_session_duration: (
            totalHours / (sessions.length || 1)
          ).toFixed(2),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard",
      error: error.message,
    });
  }
});

// ---------- SERVER START ----------
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
