const { connectToDatabase } = require('./db');

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
    const { uid, username, whatsapp } = JSON.parse(event.body);

    if (!uid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing uid' }),
      };
    }

    const db = await connectToDatabase(context);
    
    // Check if the username is already taken by a DIFFERENT user
    if (username) {
      const existingUser = await db.collection('users').findOne({
        username: { $regex: new RegExp(`^${username}$`, 'i') },
        uid: { $ne: uid }
      });
      
      if (existingUser) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ error: 'Username is already taken' }),
        };
      }
    }

    const updateResult = await db.collection('users').updateOne(
      { uid },
      { $set: { username, whatsapp } }
    );

    if (updateResult.matchedCount === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Profile updated successfully'
      }),
    };

  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
};
