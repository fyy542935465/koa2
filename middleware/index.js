module.exports = (app) =>{
    app.use(require('./lib/redisMiddleware')())
}