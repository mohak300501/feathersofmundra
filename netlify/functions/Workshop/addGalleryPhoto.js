const { connectToDatabase } = require('../General/db');
const { uploadFileToDrive } = require('../General/driveUpload');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const { workshopId, experience, fileData, fileName, contentType, userId } = requestData;

    if (!workshopId || !fileData || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const db = await connectToDatabase(context);
    
    const user = await db.collection('users').findOne({ uid: userId });
    if (!user) {
       return {
         statusCode: 403,
         headers,
         body: JSON.stringify({ error: 'User must be authenticated' })
       }
    }

    const folderId = process.env.GOOGLE_DRIVE_GALLERY_ID;
    if (!folderId) {
      throw new Error('GOOGLE_DRIVE_GALLERY_ID is not defined');
    }

    const fileId = await uploadFileToDrive(fileData, fileName, contentType, folderId);

    await db.collection('gallery').insertOne({
      workshopId,
      fileId,
      experience: experience || '',
      userId,
      addedAt: new Date()
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error adding gallery photo:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};