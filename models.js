import mongoose from 'mongoose'
const Schema = mongoose.Schema;
import connect from './db.js';

const alertSchema = new Schema({
  alertType:{
    type : String,
    enum : ["Normal" , "Vibration Issue" ,"Overheating", "Pressure Drop" , "Electrical Fault"],
    default : 'Normal'
  } ,
  machineName: String,
  machine_defect_url: String,
  machine_desc: String,
  machine_location: { 
    type : String
   },
  machine_under_maintainance: Boolean,
  machine_maintainance_status: {
    type : String,
    enum : ["Pending" ,"Progress"  ,"Resolved"]
  }
});


const alertModel = mongoose.model("Alert" ,alertSchema)
export default alertModel;

const data = {
    alertType : "Normal",
    machineName : 'CNC',
    machine_defect_url : "https://github.com/anshshr",
    machine_desc : "desc",
    machine_location: "home",
    machine_under_maintainance : false,
    machine_maintainance_status : "Pending"
}

// // save the document using the mongoose model
// alertModel.create(data).then((doc) => {
//   console.log('Inserted:', doc);
// }).catch((err) => {
//   console.error('Insert error:', err);
// });