const util = require('../../util')
module.exports = () => {
    return async (ctx,next) => {
        let path = ctx.path
        if(path != '/api/login' && path != '/api/register'){
            let token = ctx.request.headers.authorization
            let res = await util.redis.get('token')
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