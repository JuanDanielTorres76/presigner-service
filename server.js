import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  S3Client,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY
  },
  forcePathStyle: true
});

app.post("/presign", async (req, res) => {
  try {
    const { bucket, key, expiresIn } = req.body;

    if (!bucket || !key) {
      return res.status(400).json({
        error: "bucket and key are required"
      });
    }

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: expiresIn || 3600 // 1 hour
    });

    return res.json({
      url: signedUrl,
      expiresIn: expiresIn || 3600
    });

  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return res.status(500).json({
      error: "Failed to generate presigned URL",
      details: error.message
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "Presigner service is running"
  });
});

app.listen(4000, () => {
  console.log("Presigner service running on port 4000");
});