const express = require('express');
const AWS = require('aws-sdk');

const app = express();
app.use(express.json());

const port = process.env.PORT || 4000;

const s3 = new AWS.S3({
  endpoint,
  accessKeyId,
  secretAccessKey,
  region,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  sslEnabled: true,
  credentials: new AWS.Credentials(accessKeyId, secretAccessKey),
});

app.get('/presign', async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ error: 'Missing key parameter' });

    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Expires: 600
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    res.json({ url });

  } catch (error) {
    console.error("Presign error:", error);
    res.status(500).json({ error: 'Failed to generate presigned URL', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Presigner running on port ${port}`);
});