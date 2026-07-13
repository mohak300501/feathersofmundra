const fs = require('fs');
const path = require('path');

const dirs = ['Bird', 'Workshop'];
const basePath = '/media/mohak/My_Drive/PROJECTS/feathersofmundra/netlify/functions';

dirs.forEach(dir => {
  const dirPath = path.join(basePath, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix any incorrect variations of require db, commonCode, driveUpload
    content = content.replace(/require\(['"]\.\/db['"]\)/g, "require('../General/db')");
    content = content.replace(/require\(['"]\.\.\/db['"]\)/g, "require('../General/db')");
    
    content = content.replace(/require\(['"]\.\/commonCode['"]\)/g, "require('../General/commonCode')");
    content = content.replace(/require\(['"]\.\.\/commonCode['"]\)/g, "require('../General/commonCode')");
    
    content = content.replace(/require\(['"]\.\/driveUpload['"]\)/g, "require('../General/driveUpload')");
    content = content.replace(/require\(['"]\.\.\/driveUpload['"]\)/g, "require('../General/driveUpload')");
    
    fs.writeFileSync(filePath, content);
  });
});

console.log('Fixed paths');
