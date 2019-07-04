const ioredis = require('ioredis')

const config = {
    port:6379,
    host:'127.0.0.1',
    password:'fyy123456',
    db:0
}

const Redies = new ioredis(config)

module.exports = Redies