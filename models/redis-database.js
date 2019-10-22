const redis = require('redis');

const client = redis.createClient({
  host: process.env.redisIp,
  port: process.env.redisPort,
});


client.on('error', (err) => {
  console.log('error');
});


client.on('ready', (err) =>{
  console.log('ready');
});

module.exports = client;
