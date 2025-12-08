import express, { json } from "express";
import alertModel from "./models.js";
import { MongoClient } from "mongodb";
import admin from "firebase-admin";
import fs from "fs";

// Load service account JSON safely
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// MongoDB URI
const MONGOOSEURI =
  "mongodb+srv://anshshr:ansh123@freelancing-platform.esbya.mongodb.net/iot_data_collection";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server started");
});

app.get("/health", (req, res) => {
  res.send("healthy");
});

//create a post request for the creating alert whenever some fault occurs
app.post("/postAlert", async (req, res) => {
  const {
    alertType,
    machineName,
    machine_defect_url,
    machine_desc,
    machine_location,
    machine_under_maintainance,
    machine_maintainance_status,
  } = req.body;

  try {
    const data = {
      alertType,
      machineName,
      machine_defect_url,
      machine_desc,
      machine_location,
      machine_under_maintainance,
      machine_maintainance_status,
    };
    await alertModel.insertOne(data);
    res.status(200).json({
      message: "Succesfully added the machine alert details",
    });
  } catch (error) {
    res.status(400),
      json({
        message: "Unable to save the machine details",
        error,
      });
  }
});

// create an endpoint for getting all the alerts
app.get("/getAlerts", async (req, res) => {
  try {
    const data = await alertModel.find();
    res.status(200).json({
      message: "Succesfully fetched the data",
      data,
    });
  } catch (error) {
    res.status(400),
      json({
        message: "Unable to save the machine details",
        error,
      });
  }
});

//endpoint for broadcasting all the notifications
app.post("/broadcast-notification", async (req, res) => {
  try {
    const client = new MongoClient(MONGOOSEURI);
    await client.connect();
    const db = client.db("iot_data_collection");
    const users = await db.collection("users").find().toArray();

    const { title, body } = req.body;

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      if (!user.FCM_TOKEN) continue;

      const message = {
        token: user.FCM_TOKEN,
        notification: { title, body },
        data: { screen: "screen", id: "123" },
        android: {
          priority: "high",
          collapseKey: `${Date.now()}-${Math.random()}`,
        },
      };

      try {
        await admin.messaging().send(message);
        successCount++;
      } catch (error) {
        console.error("FCM Error:", error.message);
        failCount++;
      }
    }

    await client.close();

    res.status(200).json({
      message: "Broadcast completed",
      sent_to: successCount,
      failed_for: failCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("server is running at the port 3000");
});
