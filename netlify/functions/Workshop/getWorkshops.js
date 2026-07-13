const { connectToDatabase } = require('../General/db');

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

    // Fetch all workshops, sorted by newest first
    const workshops = await db.collection('workshops')
      .find({})
      .sort({ datetime: -1 })
      .toArray();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(workshops),
    };
  } catch (error) {
    console.error('Error fetching workshops:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};