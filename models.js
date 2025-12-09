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

const userMachineSessionSchema = new Schema(
  {
    session_id: {
      type: String,
    },
    session_time: {
      type: Number,
    },
  },
  { _id: false }
);

const userMachineUsageSchema = new Schema(
  {
    vocational_center_name: {
      type: String,
    },
    vocational_center_location: {
      type: String,
    },
    serial_no: {
      type: Number,
    },
    time_work_done: {
      type: Number,
      default: 0,
    },
    sessions: [userMachineSessionSchema],
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    firstname: { type: String },
    lastname: { type: String, default: "" },
    role: { type: String, default: "trainee" },
    email: { type: String, unique: true },
    password: { type: String },
    verified: { type: Boolean, default: false },
    FCM_TOKEN: { type: String, default: null },
    machine_usage_details: [userMachineUsageSchema],
  },
  { timestamps: true }
);


export const userModel = mongoose.model("users", userSchema);
