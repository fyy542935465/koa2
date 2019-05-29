const DB = require('../../module/db')
const util = require('../../util')
const objectId = require('mongodb').ObjectId

module.exports = {
    async getAdmin(ctx, next){
        let params = ctx.query || ctx.request.query
        if (!params.userId) {
            return ctx.body = util.json(0, {
                msg: '参数userId不能为空'
            })
        } else {
            let data = await DB.find('users', { userId: params.userId })
            ctx.body = util.json(1, {
                isAdmin:data[0].isAdmin,
                superAdmin:data[0].superAdmin || 0
            })
        }
    },
    async getUserList(ctx,next){
        let data = await DB.find('users', {})
        ctx.body = util.json(1,data)
    },
    async delAccount(ctx,next){
        let params = ctx.body || ctx.request.body
        if(!params.accountId){
            ctx.body = util.json(0,{
                msg:'删除的账户ID不能为空'
            })
            return
        }
        let res = DB.remove('users',{userId:params.accountId})
        ctx.body = util.json(1)
    }
}