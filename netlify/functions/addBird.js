const { connectToDatabase } = require('./db');
const { generateUniqueCommonCode } = require('./commonCode');

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
    const { commonName, scientificName, familyName, userId } = JSON.parse(event.body);

    if (!commonName || !scientificName || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const db = await connectToDatabase();
    
    // Check if user is admin
    const userDoc = await db.collection('users').findOne({ uid: userId });
    if (!userDoc) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    if (!userDoc.isAdmin) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Admin privileges required' }),
      };
    }

    // Check if bird already exists (case-insensitive)
    const existingBird = await db.collection('birds').findOne({ 
      commonName: { $regex: new RegExp(`^${commonName}$`, 'i') } 
    });

    if (existingBird) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'Bird with this common name already exists' }),
      };
    }

    // Get all existing commonCodes to ensure uniqueness
    const allBirds = await db.collection('birds').find({}, { projection: { commonCode: 1 } }).toArray();
    const existingCodes = allBirds.map(b => b.commonCode).filter(Boolean);

    // Generate unique commonCode
    const commonCode = generateUniqueCommonCode(commonName, existingCodes);

    // Add bird to MongoDB
    const birdResult = await db.collection('birds').insertOne({
      commonName: commonName.trim(),
      scientificName: scientificName.trim(),
      familyName: familyName ? familyName.trim() : 'Uncategorized',
      commonCode: commonCode,
      photoCount: 0,
      createdAt: new Date(),
      addedBy: userId // Referencing user by UID
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        birdId: birdResult.insertedId.toString(),
        commonName,
        scientificName,
        commonCode
      }),
    };

  } catch (error) {
    console.error('Error adding bird:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};