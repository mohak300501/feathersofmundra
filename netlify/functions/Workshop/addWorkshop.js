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
    const { title, info, datetime, location, mapPin, fileData, fileName, contentType, userId } = requestData;

    if (!title || !info || !datetime || !location || !fileData || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const db = await connectToDatabase(context);
    
    const user = await db.collection('users').findOne({ uid: userId });
    if (!user || !user.isAdmin) {
       return {
         statusCode: 403,
         headers,
         body: JSON.stringify({ error: 'Admin privileges required' })
       }
    }

    const folderId = process.env.GOOGLE_DRIVE_GALLERY_ID;
    if (!folderId) {
      throw new Error('GOOGLE_DRIVE_GALLERY_ID is not defined');
    }

    const fileId = await uploadFileToDrive(fileData, fileName, contentType, folderId);

    const d = new Date(datetime);
    const code = `w_${String(d.getDate()).padStart(2, '0')}${String(d.getMonth()+1).padStart(2, '0')}${String(d.getFullYear()).slice(-2)}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;

    const workshopResult = await db.collection('workshops').insertOne({
      workshopCode: code,
      title,
      info,
      datetime: new Date(datetime),
      location,
      mapPin: mapPin || '',
      participantCount: 0,
      featuredPhoto: fileId,
      addedBy: userId,
      addedAt: new Date()
    });

    await db.collection('gallery').insertOne({
      workshopId: workshopResult.insertedId.toString(),
      fileId,
      experience: "Workshop Poster",
      userId,
      addedAt: new Date()
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, workshopCode: code }),
    };
  } catch (error) {
    console.error('Error adding workshop:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};