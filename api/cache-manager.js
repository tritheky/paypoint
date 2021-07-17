const redis = require('redis');
const { promisify } = require('util');
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
const password = process.env.REDIS_PASS || null;
if (password && password != 'null') {
  redisClient.auth(password, (err, res) => {
    if (res) console.log('Redis connected Ok');
  });
}
try {
  redisClient.getAsync = promisify(redisClient.get).bind(redisClient);
  redisClient.setAsync = promisify(redisClient.set).bind(redisClient);
  redisClient.expireAsync = promisify(redisClient.expire).bind(redisClient);
  redisClient.lpushAsync = promisify(redisClient.lpush).bind(redisClient);
  redisClient.lrangeAsync = promisify(redisClient.lrange).bind(redisClient);
  redisClient.llenAsync = promisify(redisClient.llen).bind(redisClient);
  redisClient.lremAsync = promisify(redisClient.lrem).bind(redisClient);
  redisClient.lsetAsync = promisify(redisClient.lset).bind(redisClient);
  redisClient.hmsetAsync = promisify(redisClient.hmset).bind(redisClient);
  redisClient.hmgetAsync = promisify(redisClient.hmget).bind(redisClient);
  redisClient.clear = promisify(redisClient.del).bind(redisClient);
} catch (e) {
  console.log('redis error', e);
}

redisClient.on('connected', function () {
  console.log('Redis is connected');
});
redisClient.on('error', function (err) {
  console.log('Redis error.', err);
});

global.cache = redisClient;
module.exports = redisClient;
