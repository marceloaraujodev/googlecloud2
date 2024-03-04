const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const Multer = require("multer");
const src = path.join(__dirname, "views"); // *
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

app.use(express.static(src))

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // No larger than 5mb, change as you need
  },
});

let projectId = process.env.PROJECTID; // Get this from Google Cloud
let keyFilename = process.env.KEYFILENAME; // Get this from Google Cloud -> Credentials -> Service Accounts
const storage = new Storage({
  projectId,
  keyFilename,
});
const bucket = storage.bucket(process.env.BUCKET_NAME); // Get this from Google Cloud -> Storage

// console.log('names', process.env.PROJECTID, process.env.KEYFILENAME, process.env.BUCKET_NAME)

// Gets all files in the defined bucket
app.get("/", async (req, res) => {
  res.sendFile(__dirname + '/index.html')
});
// Streams file upload to Google Storage
app.post("/upload", multer.single("imgfile"), (req, res) => {
  console.log("Made it /upload");
  try {
    if (req.file) {
      console.log("File found, trying to upload...");
      const blob = bucket.file(req.file.originalname);
      const blobStream = blob.createWriteStream();

      blobStream.on("finish", () => {
        res.status(200).send("Success");
        console.log("Success");
      });
      blobStream.end(req.file.buffer);
    } else throw "error with img";
  } catch (error) {
    res.status(500).send(error);
  }
});

// // Get the main index html file
// app.get("/", (req, res) => {
//   res.sendFile(src + "/index.html");
// });

// Start the server on port 8080 or as defined
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});