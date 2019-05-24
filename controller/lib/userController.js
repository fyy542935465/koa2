const DB = require('../../module/db')
const bcrypt = require('bcrypt')
const fs  = require('fs')
const path = require('path')
const util = require('../../util')
const objectId = require('mongodb').ObjectId

module.exports = {
    async register(ctx,next){
        let params = ctx.body || ctx.request.body;
        let data = await DB.find('users',{username: params.username})
        if(data.length){
            ctx.body = util.json(0,{
                msg: '用户名' + params.username + '已存在'
            })
        }else{
            let hash = bcrypt.hashSync(params.password, 10)
            params.password = hash
            params.token = util.token(params.username)
            params.userId = util.uid()
            let res = await DB.insert('users',params)
            ctx.body = util.json(1,{
                token:res.ops[0].token,
                userId:res.ops[0].userId
            })
        }
    },
    async getUserInfo(ctx, next){
        let params = ctx.query || ctx.request.query
        if(!params.userId){
            return ctx.body = util.json(0,{
                msg:'参数userId不能为空'
            })
        }else{
            let data = await DB.find('users',{userId:params.userId})
            ctx.body = util.json(1,data[0])
        }
    },
    async login(ctx, next){
        let params = ctx.body || ctx.request.body
        let data = await DB.find('users',{username: params.username})
        if(!data.length){
            ctx.body = util.json(0,{
                msg: '账户不存在'
            })
        }else{
            let f = await bcrypt.compare(params.password, data[0].password)
            if (!f) {
                ctx.body = util.json(0,{
                    msg: '密码错误'
                })
            }else{
                ctx.body = util.json(1,{
                    token:data[0].token,
                    userId:data[0].userId
                })
            }
        }
    },
    async uploadImg(ctx, next){
        let params = ctx.body || ctx.request.body
        if(ctx.request.files && ctx.request.files.imgFile){
            let files  = ctx.request.files.imgFile
            let stream = fs.createReadStream(files.path)
            let data = await util.streamToBuffer(stream)
            let filename = util.uid() + '-' + files.name
            let imgPath = path.resolve(__dirname, '../../../static-img/img/group1')
            let writeData = await util._writeFile(imgPath + '/'+ filename,data)
            if(writeData){
                let url = 'img/group1/' + filename;
                params.img = url;
                let res = await DB.update('users',{userId:params.userId},params)
                let findData = await DB.find('users',{userId:params.userId})
                if(res){
                    ctx.body = util.json(1,{
                        username:findData[0].username,
                        img:findData[0].img
                    })
                }else{
                    ctx.body = util.json(0,{
                        msg:'更新失败'
                    })
                }
            }
        }
    },
    async removeImg(ctx, next){

    }
}