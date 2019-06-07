const DB = require('../../db')
const util = require('../../util')
const objectId = require('mongodb').ObjectId

module.exports = {
    async save(ctx, next) {
        let params = ctx.body || ctx.request.body
        if (!params.user_id) {
            ctx.body = util.json(0, {
                msg: 'user_id不能为空'
            })
        }
        let create_time = util.formateNowDate(Date.now)
        await DB.query('insert into article (id,user_id,title,edit_content,create_time) values (?,?,?,?,?)', [util.uid(), params.user_id, params.title, params.edit_content, create_time])
        ctx.body = util.json(1)
    },
    async getArticleInfo(ctx, next) {
        let params = ctx.params || ctx.query || ctx.request.query
        if(!params.id || params.id == 'undefined'){
            ctx.body = util.json(0,{
                msg:'文章id不能为空'
            })
            return
        }
        let data = await DB.find('article','id',[params.id])
        let user_data = await DB.find('users','user_id',[data[0].user_id])
        data[0].username = user_data[0].username
        data[0].avatar = user_data[0].avatar
        ctx.body = util.json(1, data[0])
    },
    async delete(ctx, next) {
        let params = ctx.body || ctx.request.body
        let res = await DB.remove('article', 'id',[params.id])
        ctx.body = util.json(1)
    },
    async getArticleList(ctx, next) {
        let params = ctx.query || ctx.request.query
        let data = []
        let sql = `select a.username,a.avatar,b.* from users a
        inner join article b
        on a.user_id = b.user_id`
        if (!params.user_id) {
            data = await DB.query(sql,[])
        }else{
            sql += ` where b.user_id="${params.user_id}"`
            data = await DB.query(sql,[])
        }
        
        data.forEach(item => {
            delete item.edit_content
        })
        ctx.body = util.json(1, data)
    },
}