const addWorkshop = require('./addWorkshop');
const getWorkshops = require('./getWorkshops');
const getWorkshop = require('./getWorkshop');
const editWorkshop = require('./editWorkshop');
const deleteWorkshop = require('./deleteWorkshop');
const registerWorkshop = require('./registerWorkshop');
const addGalleryPhoto = require('./addGalleryPhoto');

exports.handler = async (event, context) => {
  const action = event.path.split('/').pop();

  switch (action) {
    case 'addWorkshop': return addWorkshop.handler(event, context);
    case 'getWorkshops': return getWorkshops.handler(event, context);
    case 'getWorkshop': return getWorkshop.handler(event, context);
    case 'editWorkshop': return editWorkshop.handler(event, context);
    case 'deleteWorkshop': return deleteWorkshop.handler(event, context);
    case 'registerWorkshop': return registerWorkshop.handler(event, context);
    case 'addGalleryPhoto': return addGalleryPhoto.handler(event, context);
    default:
      return { statusCode: 404, body: JSON.stringify({ error: 'Function action not found in Workshop' }) };
  }
};
