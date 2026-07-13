const { connectToDatabase } = require('../General/db');
const { uploadFileToDrive } = require('../General/driveUpload');
const { ObjectId } = require('mongodb');

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
    const { workshopId, members, fileData, fileName, contentType, userId } = requestData;

    if (!workshopId || !members || !fileData || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const membersCount = parseInt(members, 10);

    const db = await connectToDatabase(context);
    
    const user = await db.collection('users').findOne({ uid: userId });
    if (!user) {
       return {
         statusCode: 403,
         headers,
         body: JSON.stringify({ error: 'User must be authenticated' })
       }
    }

    // Atomically increment participantCount if it's less than 25 (with the requested members)
    // Wait, simpler way: check the workshop, if participants + members > 25, fail.
    const workshop = await db.collection('workshops').findOne({ _id: new ObjectId(workshopId) });
    if (!workshop) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Workshop not found' }) };
    }

    if (workshop.participantCount + membersCount > 25) {
       return { statusCode: 400, headers, body: JSON.stringify({ error: 'Not enough available slots in this workshop' }) };
    }

    const updateResult = await db.collection('workshops').updateOne(
      { _id: new ObjectId(workshopId), participantCount: { $lte: 25 - membersCount } },
      { $inc: { participantCount: membersCount } }
    );

    if (updateResult.modifiedCount === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Failed to reserve slots. Workshop might be full.' }) };
    }

    const folderId = process.env.GOOGLE_DRIVE_PAYMENTS_ID;
    if (!folderId) {
      // Revert participant count
      await db.collection('workshops').updateOne({ _id: new ObjectId(workshopId) }, { $inc: { participantCount: -membersCount } });
      throw new Error('GOOGLE_DRIVE_PAYMENTS_ID is not defined');
    }

    let fileId;
    try {
      fileId = await uploadFileToDrive(fileData, fileName, contentType, folderId);
    } catch (err) {
      // Revert participant count
      await db.collection('workshops').updateOne({ _id: new ObjectId(workshopId) }, { $inc: { participantCount: -membersCount } });
      throw err;
    }

    await db.collection('payments').insertOne({
      workshopId,
      userId,
      members: membersCount,
      fileId,
      addedAt: new Date()
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error registering for workshop:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};