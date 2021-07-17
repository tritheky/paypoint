const config = require('config.json');
const jwt = require('jsonwebtoken');
const userModel = require('../dto/users.model');
const helper = require('helpers/helper');
const errorHandler = require('helpers/error-handler');

module.exports = {
  token,
  refreshToken,
  signout,
};
const guest = 'guest';

async function token({ phone, password, clientId }) {
  if (!clientId) throw 'clientId is not null';
  const user = await userModel.findOne({ phone: phone }).select('+password');
  if (user) {
    if (!(await helper.comparePassword(password, user.password))) {
      throw 'Mật khẩu không đúng.';
    }
    return genToken(user, clientId);
  } else {
    return genToken(null, clientId);
  }
}

async function refreshToken({ refresh }) {
  var user = jwt.verify(refresh, config.jwt_refresh_secret);
  const redisKey = `${user.clientId}_${user.phone}`;
  let redisValue = await cache.getAsync(redisKey);
  if (redisValue) {
    const redisParse = JSON.parse(redisValue);
    if (refresh != redisParse.refresh) throw 'Invalid Token';
    var userObj = {
      id: user.userId,
      phone: user.phone,
      email: user.email,
      fullname: user.fullname,
      admin: user.admin,
    };
    if (user.phone === guest) userObj = null;
    return genToken(userObj, user.clientId);
  }
}

async function signout(token) {
  var user = jwt.verify(token, config.jwt_secret);
  const redisKey = `${user.clientId}_${user.phone}`;
  let redisValue = await cache.getAsync(redisKey);
  if (!redisValue) throw 'Invalid Token';
  const clearCount = await cache.clear(redisKey);
  console.log(clearCount);
  return clearCount ? 'true' : 'false';
}

async function genToken(user, clientId) {
  const userGenToken = {
    userId: user?.id,
    phone: user ? user.phone : guest,
    email: user?.email,
    fullname: user?.fullname,
    admin: user ? user.admin : 3,
    clientId: clientId,
  };

  const token = jwt.sign(userGenToken, config.jwt_secret, {
    expiresIn: config.jwt_exp,
  });

  const refresh = jwt.sign(userGenToken, config.jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_exp,
  });

  const result = {
    token,
    expires_in: config.jwt_exp,
    refresh,
    refresh_expires_in: config.jwt_refresh_exp,
  };
  const redisKey = `${userGenToken.clientId}_${userGenToken.phone}`;
  let cacheResponse = await cache.setAsync(redisKey, JSON.stringify(result));
  if (cacheResponse) {
    await cache.expireAsync(refresh, config.jwt_refresh_exp / 1000);
  }
  return result;
}
