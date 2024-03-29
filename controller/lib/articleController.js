const DB = require('../../db')
const util = require('../../util')
module.exports = {
    async save(ctx, next) {
        let params = ctx.body || ctx.request.body
        if (!params.user_id) {
            ctx.body = util.json(0, {
                msg: 'user_id不能为空'
            })
        }
        let create_time = util.formateNowDate()
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
        let _sql = `
            select a.username,a.avatar,b.* from users a
            inner join comment b
            on a.user_id = b.user_id 
            where article_id = "${params.id}"
        ` 
        data[0].username = user_data[0].username
        data[0].avatar = user_data[0].avatar
        ctx.body = util.json(1, {
            acticleInfo:data[0]
        })
    },
    async delete(ctx, next) {
        let params = ctx.body || ctx.request.body
        try{
            await DB.remove('article', 'id',[params.id])
            await DB.remove('comment','article_id',[params.id])
            await DB.remove('reply_comment','article_id',[params.id])
            ctx.body = util.json(1)
        }catch(err){
            ctx.body = util.json(1,{
                msg:err
            })
        }
        
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
        ORDER BY create_time desc
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
    
    },
    async getHotArticleList(ctx,next){
        try{
            let list = await DB.find('article','',[])
            if(list.length){
                list.sort(function compare(a,b) {
                    return b.count - a.count
                })
            }

            ctx.body = util.json(1,{
                list:list.slice(0,5)
            })

        }catch(err){
            ctx.body = util.json(0,{
                msg:err
            })
        }
        
        
    },
    async saveComment(ctx,next){
        let params = ctx.body || ctx.request.body
        let create_time = util.formateNowDate()
        let id = util.uid()
        try{
            await DB.query(`insert into comment (id,article_id,user_id,comment,create_time) values ("${id}","${params.article_id}","${params.user_id}","${params.comment}","${create_time}")`,[])
            ctx.body = util.json(1,{})
        }catch(err){
            ctx.body = util.json(0,{
                msg:err
            })
        }
    },
    async count(ctx,next){
        let params = ctx.body || ctx.request.body
        try{
            let data = await DB.find('article','id',[params.id])
            let count = data[0].count
            count += 1
            await DB.query(`update article set count="${count}" where id="${params.id}"`)
            ctx.body = util.json(1,{})
        }catch(err){
            ctx.body = util.json(0,{
                msg:err
            })
        }
    },
    async comment(ctx,next){
        let params = ctx.query || ctx.request.query
        params.page = params.page? params.page : 1
        params.pageSize = params.pageSize? params.pageSize : 10000
        let page = (params.page -1) * params.pageSize
        let _sql =
        `select a.username,a.avatar,b.* from users a
        inner join comment b
        on a.user_id = b.user_id 
        where article_id = "${params.id}"
        ORDER BY create_time desc
        limit ${page},${params.pageSize}
        `
        let data = await DB.query(_sql,[])
        let total = await DB.query(`select count(*) as count from comment where article_id="${params.id}"`,[])
        let replyList = await DB.query(`
        select a.username,a.avatar,b.* from users a
        inner join reply_comment b
        on a.user_id = b.user_id
        `,[])
        data.forEach( item => {
            let arr = [];
            replyList.forEach( i => {
                if(item.id == i.comment_id){
                    arr.push(i)
                }
            }) 
            item.reply_comment = arr
        })
        ctx.body = util.json(1,{
            list:data,
            total:total[0].count,
            page:parseInt(params.page),
            pageSize:parseInt(params.pageSize == 10000? total[0].count : params.pageSize)
        })
    },
    async praise(ctx,next){
        let params = ctx.body || ctx.request.body
        let data = await DB.find('comment','id',[params.id])
        if(data.length){
            let praiseIds = data[0].praise_ids
            let flag = true
            if(praiseIds){
                praiseIds = praiseIds.split(',')
                praiseIds.forEach( item =>{
                    if(item == params.user_id){
                        flag = false
                    }
                })
            }
            if(flag){
                praiseIds = praiseIds && praiseIds.length? praiseIds : []
                praiseIds.push(params.user_id)
                let praise = data[0].praise + 1
                await DB.update('comment',`praise="${praise}",praise_ids="${praiseIds.join(',')}"`,'id',[params.id])
                ctx.body = util.json(1,{})
            }else{
                ctx.body = util.json(0,{
                    msg:'你已经赞过啦'
                })
            }
        }
    },
    async reply(ctx,next){
        let params = ctx.body || ctx.request.body
        try{
            await DB.query(`insert into reply_comment (id,comment_id,user_id,comment,create_time,reply_id,reply_name,article_id) values ("${util.uid()}","${params.comment_id}","${params.user_id}","${params.comment}","${util.formateNowDate()}","${params.reply_id}","${params.reply_name}","${params.article_id}")`,[])
            ctx.body = util.json(1,{})
        }catch(err){
            ctx.body = util.json(0,{
                msg:err
            })
        }
    }
}