const express = require('express');
const AWS = require('aws-sdk');

const app = express();
app.use(express.json());

const port = process.env.PORT || 4000;

const region = process.env.AWS_REGION;
const bucket = process.env.S3_BUCKET;
const endpoint = process.env.S3_ENDPOINT;  // ← ESTO FALTABA

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Configurar cliente S3 para MinIO
const s3 = new AWS.S3({
  endpoint: endpoint,                     // ← USAR VARIABLE
  region: region,
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  sslEnabled: false                        // MUY IMPORTANTE CON MINIO
});

app.get('/presign', async (req, res) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ error: 'Missing key parameter' });
    }

    const params = {
      Bucket: bucket,
      Key: key,
      Expires: 600, // 10 minutos
    };

    const url = await s3.getSignedUrlPromise('getObject', params);

    res.json({ url });

  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: "Failed to generate presigned URL", detail: error.message });
  }
});

app.listen(port, () => {
  console.log(`Presigner service running on port ${port}`);
});