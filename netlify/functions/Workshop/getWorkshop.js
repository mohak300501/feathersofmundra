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
    const { workshopCode } = event.queryStringParameters || {};

    if (!workshopCode) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing workshopCode parameter' }),
      };
    }

    const db = await connectToDatabase(context);

    const workshop = await db.collection('workshops').findOne({ workshopCode });

    if (!workshop) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Workshop not found' }),
      };
    }

    // Fetch gallery photos for this workshop and lookup username
    const gallery = await db.collection('gallery')
      .aggregate([
        { $match: { workshopId: workshop._id.toString() } },
        { $sort: { addedAt: -1 } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'uid',
            as: 'user'
          }
        },
        {
          $addFields: {
            username: { $arrayElemAt: ['$user.username', 0] }
          }
        },
        {
          $project: {
            user: 0 // exclude the full user array
          }
        }
      ])
      .toArray();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ workshop, gallery }),
    };
  } catch (error) {
    console.error('Error fetching workshop:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};