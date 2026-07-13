const checkUsername = require('./checkUsername');
const getEmailByUsername = require('./getEmailByUsername');
const leaderBoard = require('./leaderBoard');
const publicStats = require('./publicStats');
const syncUser = require('./syncUser');
const updateProfile = require('./updateProfile');
const servePhoto = require('./servePhoto');

exports.handler = async (event, context) => {
  const action = event.path.split('/').pop();

  switch (action) {
    case 'checkUsername': return checkUsername.handler(event, context);
    case 'getEmailByUsername': return getEmailByUsername.handler(event, context);
    case 'leaderBoard': return leaderBoard.handler(event, context);
    case 'publicStats': return publicStats.handler(event, context);
    case 'syncUser': return syncUser.handler(event, context);
    case 'updateProfile': return updateProfile.handler(event, context);
    case 'servePhoto': return servePhoto.handler(event, context);
    default:
      return { statusCode: 404, body: JSON.stringify({ error: 'Function action not found in General' }) };
  }
};
