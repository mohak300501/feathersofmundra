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

    // 1. Total photos
    const totalPhotos = await db.collection('photos').countDocuments();

    // 2. Total bird species
    const totalBirds = await db.collection('birds').countDocuments();

    // 3. Leaderboard for Photo Count
    const photoLeaders = await db.collection('photos').aggregate([
      {
        $group: {
          _id: '$uploadedBy',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'uid',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.username',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    // 4. Leaderboard for Bird Species Uploaded
    const birdLeaders = await db.collection('birds').aggregate([
      {
        $group: {
          _id: '$addedBy',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'uid',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.username',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalPhotos,
        totalBirds,
        topPhotographers: photoLeaders,
        topContributors: birdLeaders
      }),
    };

  } catch (error) {
    console.error('Error fetching public stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message, stack: error.stack }),
    };
  }
};