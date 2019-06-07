const DB = require('../../db')
const util = require('../../util')
const objectId = require('mongodb').ObjectId

module.exports = {
    async getAdmin(ctx, next){
        let params = ctx.query || ctx.request.query
        if (!params.user_id) {
            return ctx.body = util.json(0, {
                msg: '参数user_id不能为空'
            })
        } else {
            let data = await DB.find('users','user_id',[params.user_id]);
            ctx.body = util.json(1, {
                is_admin:data[0].is_admin,
                super_admin:data[0].super_admin || 0
            })
        }
    },
    async delAccount(ctx,next){
        let params = ctx.body || ctx.request.body
        if(!params.accountId){
            ctx.body = util.json(0,{
                msg:'删除的账户ID不能为空'
            })
            return
        }
        await DB.remove('users','user_id',[params.accountId])
        await DB.remove('article','user_id',[params.accountId])
        ctx.body = util.json(1)
    },
    async adminOprate(ctx,next){
        let params = ctx.body || ctx.request.body
        let data = await DB.find('users','user_id',[params.id])
        let isAdmin = data[0].is_admin > 0? 0 : 1
        let res = await DB.update('users',`is_admin="${isAdmin}"`,'user_id',[params.id])
        if(res){
            ctx.body = util.json(1)
        }
    }
}