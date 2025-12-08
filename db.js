import { mongoose } from "mongoose";

const MONGOOSEURI = "mongodb+srv://anshshr:ansh123@freelancing-platform.esbya.mongodb.net/iot_data_collection"

const connect = mongoose.connect(MONGOOSEURI).then(()=>{
    console.log("succesfully connedted to the database");
    
})

export default connect