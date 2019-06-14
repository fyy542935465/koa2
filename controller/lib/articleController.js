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
        params.page = params.page? params.page : 1
        params.pageSize = params.pageSize? params.pageSize : 10000
        let page = (params.page -1) * params.pageSize
        let list_sql_where = params.user_id? `where b.user_id="${params.user_id}"` : ''
        let count_sql_where = params.user_id? `where user_id="${params.user_id}"` : ''
        let list_sql = ` 
        select a.username,a.avatar,b.* from users a
        inner join article b
        on a.user_id = b.user_id 
        ${list_sql_where}
        limit ${page},${params.pageSize}
        `
        let count_sql = `select count(*) as count from article ${count_sql_where}`

        try{
            let list = await DB.query(list_sql,[])
            let count = await DB.query(count_sql,[])
            list.forEach(item => {
                delete item.edit_content
            })

            ctx.body = util.json(1, {
                list:list,
                total:count[0].count,
                page:parseInt(params.page),
                pageSize:parseInt(params.pageSize == 10000? count[0].count : params.pageSize)
            })
        }catch(err){
            ctx.body = util.json(0,{
                masg:err
            })
        }
    
    }
}