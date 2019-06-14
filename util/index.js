const jwt = require("jsonwebtoken")
const fs = require('fs')
const path = require('path')
const DB = require('../db')

function greaterThanTen (digital) {
    return digital >= 10 ? digital : '0' + digital;
}
module.exports = {
    json:(status,data,err) => {
        return {
            status:status? true : false,
            data:data? data : {msg : err}
        }
    },
    token:(name) => {
        const content = {name:name}
        const secretOrPrivateKey = name
        const token = jwt.sign(content, secretOrPrivateKey, {
            expiresIn: 60  // 24小时过期
        })
        return token
    },
    streamToBuffer:stream => {
        return new Promise((resolve, reject) => {
            let buffers = [];
            stream.on('error', reject);
            stream.on('data', (data) => buffers.push(data))
            stream.on('end', () => resolve(Buffer.concat(buffers)))
        });
    },
    uid:() => {
        let guid = "";
        for (let i = 1; i <= 24; i++){
            let n = Math.floor(Math.random()*16.0).toString(16);
            guid +=   n;

            if((i==8)||(i==12)||(i==16)||(i==20))
                guid += "";
        }
        return guid
    },
    _writeFile:(path,data)=>{
        return new Promise((resolve,reject) => {
            fs.writeFile(path,data,err => {
                if(err){
                    reject(err)
                }else{
                    resolve(true)
                }
            })
        })
    },
    formateNowDate(){
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            return year + '-' + greaterThanTen(month) + '-' + greaterThanTen(day) + ' '
                + greaterThanTen(hours) + ':' + greaterThanTen(minutes) + ':' + greaterThanTen(seconds);
    },
    async removeImg(ctx,id){
        let params = ctx.body || ctx.request.body
        let data = await DB.find('users','user_id',params[id])
        if(data[0].avatar){
            let imgPath = path.resolve(__dirname, '../../static-img/' + data[0].avatar)
            if(data.length){
                await fs.unlinkSync(imgPath)
            }
        }
    }
}