const DB = require('../../module/db')
const util = require('../../util')
const objectId = require('mongodb').ObjectId

module.exports = {
    async save(ctx,next){
        let params = ctx.body || ctx.request.body
        if(!params.userId){
            ctx.body = util.json(0,{
                msg:'userId不能为空'
            })
        }
        let res = await DB.find('users',{userId:params.userId})
        params.author = res[0].username
        params.updateTime = util.formateNowDate(Date.now)
        let data = await DB.insert('article',params)
        ctx.body = util.json(1,data.ops[0])
    },
    async getArticleInfo(ctx,next){
        let params = ctx.params || ctx.query || ctx.request.query
        let data = await DB.find('article',{_id:objectId(params.id)})
        ctx.body = util.json(1,data[0])
    },
    async delete(ctx,next){
        let params = ctx.body || ctx.request.body
        let res = await DB.remove('article',{_id:objectId(params.id)})
        ctx.body = util.json(1)
    },
    async getArticleList(ctx,next){
        let params = ctx.query || ctx.request.query
        if(!params.userId){
            params = {}
        }
        let data = await DB.find('article',params)
        data.forEach( item => {
            delete item.editContent
        })
        ctx.body = util.json(1,data)
    },
}