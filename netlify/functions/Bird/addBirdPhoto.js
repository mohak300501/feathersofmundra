const { connectToDatabase } = require('../General/db');
const { ObjectId } = require('mongodb');
const google = require('googleapis');
const https = require('https');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const requestData = JSON.parse(event.body);
    const { fileData, fileName, contentType, birdId, userId, location, dateOfCapture } = requestData;

    if (!fileData || !fileName || !contentType || !birdId || !userId || !location || !dateOfCapture) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    if (fileData.length < 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'File data appears to be corrupted or empty' }),
      };
    }

    const db = await connectToDatabase(context);

    // Get user data from MongoDB
    const userDoc = await db.collection('users').findOne({ uid: userId });
    if (!userDoc) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    // Check if bird exists
    let birdObjectId;
    try {
      birdObjectId = new ObjectId(birdId);
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid bird ID format' }),
      };
    }

    const birdDoc = await db.collection('birds').findOne({ _id: birdObjectId });
    if (!birdDoc) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Bird not found' }),
      };
    }

    const { google: googleApi } = google;
    const auth = new googleApi.auth.GoogleAuth({
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const fileBuffer = Buffer.from(fileData, 'base64');
    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      supportsAllDrives: true,
    };

    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();

    const sessionResponse = await new Promise((resolve, reject) => {
      const sessionOptions = {
        hostname: 'www.googleapis.com',
        path: '/upload/drive/v3/files?uploadType=resumable&fields=id,webViewLink&supportsAllDrives=true',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': contentType,
          'X-Upload-Content-Length': fileBuffer.length.toString()
        }
      };

      const sessionReq = https.request(sessionOptions, (res) => {
        if (res.statusCode === 200) {
          resolve(res.headers.location);
        } else {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => reject(new Error(`Session creation failed: ${res.statusCode} - ${data}`)));
        }
      });
      sessionReq.on('error', reject);
      sessionReq.write(JSON.stringify(fileMetadata));
      sessionReq.end();
    });

    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadUrl = new URL(sessionResponse);
      const uploadOptions = {
        hostname: uploadUrl.hostname,
        path: uploadUrl.pathname + uploadUrl.search,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString()
        }
      };

      const uploadReq = https.request(uploadOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ data: JSON.parse(data) });
          } else {
            reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
          }
        });
      });
      uploadReq.on('error', reject);
      uploadReq.write(fileBuffer);
      uploadReq.end();
    });

    const fileId = uploadResponse.data.id;

    // Save to MongoDB Photos collection
    const photoResult = await db.collection('photos').insertOne({
      birdId: birdObjectId,
      fileId: fileId,
      location: location,
      dateOfCapture: new Date(dateOfCapture),
      userId: userId, // Referencing user by UID
      addedAt: new Date(),
    });

    // Update bird's photo count and potentially featured photo
    const updateQuery = { $inc: { photoCount: 1 } };
    if (!birdDoc.featuredPhoto) {
      updateQuery.$set = { featuredPhoto: fileId };
    }
    await db.collection('birds').updateOne({ _id: birdObjectId }, updateQuery);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        photoId: photoResult.insertedId.toString(),
        location: location,
        dateOfCapture: dateOfCapture,
        username: userDoc.username,
      }),
    };

  } catch (error) {
    console.error('Error uploading photo:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};