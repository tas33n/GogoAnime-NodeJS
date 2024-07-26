const fs = require('fs');

function parseCookies(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const cookies = JSON.parse(fileContent);

  return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
}

module.exports = parseCookies;