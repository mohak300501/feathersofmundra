const { connectToDatabase } = require('./db');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const db = await connectToDatabase(context);
    
    // Fetch all birds and order by commonName (or familyName depending on UI)
    const birds = await db.collection('birds').find().sort({ familyName: 1, commonName: 1 }).toArray();

    // Map _id to id for frontend compatibility
    const formattedBirds = birds.map(bird => ({
      ...bird,
      id: bird._id.toString(),
      _id: undefined
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        birds: formattedBirds
      }),
    };

  } catch (error) {
    console.error('Error fetching birds:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message, stack: error.stack }),
    };
  }
};
