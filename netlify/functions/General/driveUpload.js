const { google } = require('googleapis');
const https = require('https');

async function uploadFileToDrive(fileData, fileName, contentType, folderId) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const fileBuffer = Buffer.from(fileData, 'base64');
  const fileMetadata = {
    name: fileName,
    parents: [folderId],
    supportsAllDrives: true,
  };

  const authClient = await auth.getClient();
  const accessToken = await authClient.getAccessToken();

  const sessionResponse = await new Promise((resolve, reject) => {
    const sessionOptions = {
      hostname: 'www.googleapis.com',
      path: '/upload/drive/v3/files?uploadType=resumable&fields=id,webViewLink&supportsAllDrives=true',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': contentType,
        'X-Upload-Content-Length': fileBuffer.length.toString()
      }
    };

    const sessionReq = https.request(sessionOptions, (res) => {
      if (res.statusCode === 200) {
        resolve(res.headers.location);
      } else {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => reject(new Error(`Session creation failed: ${res.statusCode} - ${data}`)));
      }
    });
    sessionReq.on('error', reject);
    sessionReq.write(JSON.stringify(fileMetadata));
    sessionReq.end();
  });

  const uploadResponse = await new Promise((resolve, reject) => {
    const uploadUrl = new URL(sessionResponse);
    const uploadOptions = {
      hostname: uploadUrl.hostname,
      path: uploadUrl.pathname + uploadUrl.search,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString()
      }
    };

    const uploadReq = https.request(uploadOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data: JSON.parse(data) });
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
        }
      });
    });
    uploadReq.on('error', reject);
    uploadReq.write(fileBuffer);
    uploadReq.end();
  });

  return uploadResponse.data.id;
}

module.exports = { uploadFileToDrive };