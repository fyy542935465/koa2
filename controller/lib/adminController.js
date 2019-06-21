const DB = require('../../db')
const util = require('../../util')
const objectId = require('mongodb').ObjectId

module.exports = {
    async getAdmin(ctx, next) {
        let params = ctx.query || ctx.request.query
        if (!params.user_id) {
            return ctx.body = util.json(0, {
                msg: '参数user_id不能为空'
            })
        } else {
            let data = await DB.find('users', 'user_id', [params.user_id]);
            ctx.body = util.json(1, {
                is_admin: data[0].is_admin,
                super_admin: data[0].super_admin || 0
            })
        }
    },
    async delAccount(ctx, next) {
        let params = ctx.body || ctx.request.body
        if (!params.accountId) {
            ctx.body = util.json(0, {
                msg: '删除的账户ID不能为空'
            })
            return
        }
        try {
            let data = await DB.find('users', 'user_id', [params.accountId]);
            if (data.length) {
                await util.removeImg(ctx,'accountId')
                await DB.remove('users', 'user_id', [params.accountId])
                let articleList = DB.find('article','user_id',[params.accountId])
                if(articleList.length){
                    await DB.remove('article', 'user_id', [params.accountId])
                }
                ctx.body = util.json(1)
            }
        } catch (err) {
            ctx.body = util.json(0,{
                msg:err
            })
        }
    },
    async adminOprate(ctx, next) {
        let params = ctx.body || ctx.request.body
        let data = await DB.find('users', 'user_id', [params.id])
        let isAdmin = data[0].is_admin > 0 ? 0 : 1
        let res = await DB.update('users', `is_admin="${isAdmin}"`, 'user_id', [params.id])
        if (res) {
            ctx.body = util.json(1)
        }
    },
    async count(ctx,next){
        let params = ctx.body || ctx.request.body
        let update_time = util.formateNowDate(+new Date(),true)
        let user_id = params.user_id
        let data = await DB.query(`select * from counts where user_id="${user_id}" and update_time="${update_time}"`)
        if(!data.length){
            try{
                await DB.query('INSERT INTO counts (update_time,user_id) VALUES (?,?)',[update_time,user_id])
                let count = await DB.query("select count(*) as _count from counts",[])
                ctx.body = util.json(1,{
                    count:count[0]._count
                })
            }catch(err){
                console.log(err)
            }
        }else{
            let count = await DB.query("select count(*) as _count from counts",[])
            ctx.body = util.json(1,{
                count:count[0]._count
            })
        }
    },
    async getBrowsingRecords(ctx,next){
        let data = await DB.find('counts','',[])
        let obj = {};
        let res = data.reduce((cur, next) => {
            let tag = obj[next.update_time]
            if(tag){
                cur[obj[next.update_time] - 1].count +=1
            }else{
                next.count = 1
                obj[next.update_time] = cur.push(next)
            }
            return cur;
        }, [])

        let len = 15 - res.length
        if(len > 0){
            let dv = 86400000
            let date = ''
            let count = 0
            for(let i = 0; i < len; i++){
                date = util.formateNowDate(+new Date(res[0].update_time) - dv,true)
                res.unshift({
                    update_time:date,
                    count:count
                })
            }
        }
        
        let date_list = []
        let count_list = []
        res.forEach( item => {
            date_list.push(item.update_time)
            count_list.push(item.count)
        })
        ctx.body = util.json(1,{
            dateList:date_list,
            countList:count_list
        })
    }
}