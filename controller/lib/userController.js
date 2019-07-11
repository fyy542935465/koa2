const DB = require('../../db')
const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')
const util = require('../../util')

module.exports = {
    async register(ctx, next) {
        let params = ctx.body || ctx.request.body;
        try{
            let data = await DB.find('users','username',[params.username]);
            if (data.length) {
                ctx.body = util.json(0, {
                    msg: '用户名' + params.username + '已存在'
                })
            } else {
                let hash = bcrypt.hashSync(params.password, 10)
                params.token = util.token(params.username)
                params.user_id = util.uid()
                params.update_time = util.formateNowDate()
                params.is_admin = 0
                let arr = [params.username,hash,params.token,params.user_id,params.is_admin,params.update_time]
                await DB.query('INSERT INTO users (username,password,token,user_id,is_admin,update_time) VALUES (?,?,?,?,?,?)',arr)
                let res = await DB.query('SELECT * from users WHERE username=?',[params.username])
                res = [].concat(res)
                delete res[0].password
                ctx.body = util.json(1,res[0])
            }
        }catch(err){
            ctx.body = util.json(0,'',err)
        }
        
    },
    async getUserInfo(ctx, next) {
        let params = ctx.query || ctx.request.query
        if (!params.user_id) {
            return ctx.body = util.json(0, {
                msg: '参数user_id不能为空'
            })
        } else {
            let data = await DB.find('users','user_id',[params.user_id]);
            ctx.body = util.json(1, data[0])
        }
    },
    async login(ctx, next) {
        let params = ctx.body || ctx.request.body
        let data = await DB.find('users','username',[params.username]);
        if (!data.length) {
            ctx.body = util.json(0, {
                msg: '账户不存在'
            })
        } else {
            let f = await bcrypt.compare(params.password, data[0].password)
            let pre = 'token' + Date.now()
            if (!f) {
                ctx.body = util.json(0, {
                    msg: '密码错误'
                })
            } else {
                util.redis.set(pre,data[0].token, 'EX', 1800);
                ctx.body = util.json(1, {
                    token: pre + '|' + data[0].token,
                    user_id: data[0].user_id,
                    super_admin:data[0].super_admin,
                    is_admin:data[0].is_admin
                })
            }
        }
    },
    async uploadImg(ctx, next) {
        let params = ctx.body || ctx.request.body
        if (ctx.request.files && ctx.request.files.imgFile) {
            let files = ctx.request.files.imgFile
            let stream = fs.createReadStream(files.path)
            let data = await util.streamToBuffer(stream)
            let filename = util.uid() + '-' + files.name
            let imgPath = path.resolve(__dirname, '../../../static-img/img/group1')
            let writeData = await util._writeFile(imgPath + '/' + filename, data)
            if (writeData) {
                let url = 'img/group1/' + filename;
                params.avatar = url;
            }
        }
        try{
            if (ctx.request.files && ctx.request.files.imgFile) {
                await util.removeImg(ctx,'user_id')
            }
            let sql = params.avatar? `username="${params.username}",avatar="${params.avatar}"` : `username="${params.username}"`
            await DB.update('users', sql,'user_id',[params.user_id])
            let data = await DB.find('users','username',[params.username])
            ctx.body = util.json(1, {
                username: data[0].username,
                avatar: data[0].avatar || ''
            })
        }catch(err){
            console.log(err)
            ctx.body = util.json(0, {
                msg: '更新失败,请重试'
            })
        }
    },
    async getUserList(ctx,next){
        let params = ctx.query || ctx.request.query
        params.page = params.page? params.page : 1
        params.pageSize = params.pageSize? params.pageSize : 10000
        let page = (params.page -1) * params.pageSize
        let limit = `limit ${page},${params.pageSize}`
        let list_sql = `select * from users ${limit}`
        let count_sql = `select count(*) as count from users`

        try{
            let list = await DB.query(list_sql,[])
            let count = await DB.query(count_sql,[])
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