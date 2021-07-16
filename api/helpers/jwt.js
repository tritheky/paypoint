const expressJwt = require('express-jwt');
const config = require('config.json');

module.exports = jwt;

function jwt() {
  const { jwt_secret } = config;
  return expressJwt({ secret: jwt_secret, algorithms: ['HS256'] }).unless({
    path: ['/auth/token'],
  });
}
