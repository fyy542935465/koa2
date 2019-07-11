const util = require('../../util')
module.exports = () => {
    return async (ctx,next) => {
        let path = ctx.path
        if(path != '/api/login' && path != '/api/register'){
            let authorization = ctx.request.headers.authorization
            let token = authorization.split('|')[1]
            let res = await util.redis.get(authorization.split('|')[0])
            if(res == token){
                await next();
            }else{
                ctx.body = util.json(0,{
                    msg:'token invalid'
                })
            }
        }else{
            await next();
        }
    }
}