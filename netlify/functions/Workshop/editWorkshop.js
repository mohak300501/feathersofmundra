const { connectToDatabase } = require('../General/db');
const { ObjectId } = require('mongodb');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const requestData = JSON.parse(event.body);
    const { workshopId, title, info, datetime, location, mapPin, userId } = requestData;

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

    const updateFields = {};
    if (title) updateFields.title = title;
    if (info) updateFields.info = info;
    if (datetime) updateFields.datetime = new Date(datetime);
    if (location) updateFields.location = location;
    if (mapPin !== undefined) updateFields.mapPin = mapPin;

    const result = await db.collection('workshops').updateOne(
      { _id: new ObjectId(workshopId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Workshop not found' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error editing workshop:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};