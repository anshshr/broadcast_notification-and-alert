import mongoose from "mongoose";

const Schema = mongoose.Schema;

// ---------------- ALERT SCHEMA ----------------
const alertSchema = new Schema(
  {
    alertType: {
      type: String,
      default: "Normal",
    },
    machineName: {
      type: String,
      required: true,
    },
    machine_defect_url: {
      type: String,
      default: null,
    },
    machine_desc: {
      type: String,
      default: "",
    },
    machine_location: {
      type: String,
      required: true,
    },
    machine_under_maintainance: {
      type: Boolean,
      default: false,
    },
    machine_maintainance_status: {
      type: String,
      enum: ["Pending", "Progress", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export const alertModel = mongoose.model("Alert", alertSchema);

// ---------------- MACHINE SCHEMA ----------------
const machineSchema = new Schema(
  {
    username:{
      type : String,
      default: "guest",
    },
    alertType: {
      type: String,
      default: "Normal",
    },
    machineName: {
      type: String,
      required: true,
    },
    machine_defect_url: {
      type: String,
      default: null,
    },
    machine_desc: {
      type: String,
      default: "",
    },
    machine_location: {
      type: String,
      required: true,
    },
    machine_under_maintainance: {
      type: Boolean,
      default: false,
    },
    machine_maintainance_status: {
      type: String,
      enum: ["Pending", "Progress", "Resolved"],
      default: "Pending",
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const machineModel = mongoose.model("MachineDetail", machineSchema);

// ---------------- USER SCHEMA ----------------
const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["trainee", "admin"],
      default: "trainee",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    FCM_TOKEN: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const userModel = mongoose.model("users", userSchema);
