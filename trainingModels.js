import mongoose from "mongoose";

const Schema = mongoose.Schema;

// ============ AUTHENTICATION & USERS ============
const trainingUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["trainee", "trainer", "admin"],
      default: "trainee",
    },
    photo_url: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const trainingUserModel = mongoose.model(
  "TrainingUser",
  trainingUserSchema
);

// ============ TRAINING CENTERS ============
const trainingCenterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    contact_number: {
      type: String,
      required: true,
    },
    contact_email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    machine_count: {
      type: Number,
      default: 0,
    },
    specializations: [String],
  },
  { timestamps: true }
);

export const trainingCenterModel = mongoose.model(
  "TrainingCenter",
  trainingCenterSchema
);

// ============ MACHINES ============
const machineSpecificationsSchema = new Schema(
  {
    max_speed: String,
    power: String,
    capacity: String,
    weight: String,
  },
  { _id: false }
);

const maintenanceHistorySchema = new Schema(
  {
    date: Date,
    type: String,
    performed_by: String,
    notes: String,
  },
  { _id: false }
);

const trainingMachineSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      required: true,
    },
    model_number: {
      type: String,
    },
    manufacturer: {
      type: String,
    },
    year: {
      type: Number,
    },
    center_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingCenter",
      required: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "standby", "maintenance", "offline"],
      default: "active",
    },
    qr_code: {
      type: String,
      unique: true,
      sparse: true,
    },
    model_3d_url: {
      type: String,
      default: null,
    },
    specifications: machineSpecificationsSchema,
    maintenance_history: [maintenanceHistorySchema],
    last_maintenance: {
      type: Date,
      default: null,
    },
    next_maintenance: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const trainingMachineModel = mongoose.model(
  "TrainingMachine",
  trainingMachineSchema
);

// ============ COURSE MODULES ============
const courseModuleSchema = new Schema(
  {
    module_name: {
      type: String,
      required: true,
      trim: true,
    },
    machine_type: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["CNC", "Pumps", "Welding", "Conveyor"],
    },
    description: {
      type: String,
      default: "",
    },
    total_hours_required: {
      type: Number,
      required: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    prerequisites: [String],
    syllabus: [String],
    certification_name: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    icon_name: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const courseModuleModel = mongoose.model(
  "CourseModule",
  courseModuleSchema
);

// ============ COURSE-CENTER MAPPING ============
const courseCenterSchema = new Schema(
  {
    module_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseModule",
      required: true,
    },
    center_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingCenter",
      required: true,
    },
  },
  { timestamps: true }
);

courseCenterSchema.index({ module_id: 1, center_id: 1 }, { unique: true });

export const courseCenterModel = mongoose.model(
  "CourseCenterMapping",
  courseCenterSchema
);

// ============ USER TRAINING ASSIGNMENTS ============
const userTrainingAssignmentSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingUser",
      required: true,
    },
    module_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseModule",
      required: true,
    },
    assigned_date: {
      type: Date,
      default: Date.now,
    },
    expiry_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "expired", "cancelled"],
      default: "active",
    },
    assigned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingUser",
      default: null,
    },
    completed_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const userTrainingAssignmentModel = mongoose.model(
  "UserTrainingAssignment",
  userTrainingAssignmentSchema
);

// ============ ASSIGNMENT-CENTER ACCESS ============
const assignmentCenterAccessSchema = new Schema(
  {
    assignment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserTrainingAssignment",
      required: true,
    },
    center_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingCenter",
      required: true,
    },
  },
  { timestamps: true }
);

assignmentCenterAccessSchema.index(
  { assignment_id: 1, center_id: 1 },
  { unique: true }
);

export const assignmentCenterAccessModel = mongoose.model(
  "AssignmentCenterAccess",
  assignmentCenterAccessSchema
);

// ============ TRAINING SESSIONS ============
const trainingSessionSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingUser",
      required: true,
    },
    assignment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserTrainingAssignment",
      required: true,
    },
    center_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingCenter",
      required: true,
    },
    machine_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingMachine",
      required: true,
    },
    check_in_time: {
      type: Date,
      required: true,
    },
    check_out_time: {
      type: Date,
      default: null,
    },
    hours_completed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "approved", "rejected"],
      default: "in-progress",
    },
    notes: {
      type: String,
      default: "",
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingUser",
      default: null,
    },
    approved_at: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  { timestamps: true }
);

export const trainingSessionModel = mongoose.model(
  "TrainingSession",
  trainingSessionSchema
);

// ============ CERTIFICATES ============
const certificateSchema = new Schema(
  {
    assignment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserTrainingAssignment",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainingUser",
      required: true,
    },
    certificate_number: {
      type: String,
      required: true,
      unique: true,
    },
    certificate_url: {
      type: String,
      default: null,
    },
    issued_date: {
      type: Date,
      required: true,
    },
    expiry_date: {
      type: Date,
      default: null,
    },
    verification_code: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export const certificateModel = mongoose.model(
  "Certificate",
  certificateSchema
);
