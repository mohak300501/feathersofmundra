const { connectToDatabase } = require('../General/db');
const { ObjectId } = require('mongodb');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const requestData = JSON.parse(event.body);
    const { workshopId, userId } = requestData;

    if (!workshopId || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const db = await connectToDatabase(context);

    // Verify user is strictly admin
    const user = await db.collection('users').findOne({ uid: userId });
    if (!user || !user.isAdmin) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin privileges required' }),
      };
    }

    const result = await db.collection('workshops').deleteOne({ _id: new ObjectId(workshopId) });

    if (result.deletedCount === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Workshop not found' }),
      };
    }
    
    // Also delete associated gallery photos from the DB. 
    // We won't delete from Drive here, but we can clean up the db references.
    await db.collection('gallery').deleteMany({ workshopId });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error deleting workshop:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};