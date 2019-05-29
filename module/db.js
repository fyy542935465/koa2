const MongoClient = require('mongodb').MongoClient;
const current = require('../env').CURRENT;
const config = require('./config')[current];

class Db{
    constructor(){

    }

    static getInstance(){    /*单例模式*/
        if(!Db.instance){
            Db.instance = new Db()
        }
        return Db.instance;
    }

    /*
    * 连接数据库
    * */
    connect(){
        return new Promise((resolve,reject) => {
            if(!this.dbClient){  //解决数据库多次连接
                MongoClient.connect(config.dbUrl,(err,client) => {
                    if(err){
                        console.log('连接数据库失败')
                        reject(err)
                    }else{
                        console.log('连接数据库成功')
                        this.dbClient = client.db(config.dbName)
                        resolve(this.dbClient)
                    }
                })
            }else{
                resolve(this.dbClient)
            }
        })
    }
    /*
    * 查询
    * name 表明（collection name）
    * where 查询参数 object
    * */
    find(name,where){
        return new Promise((resolve,reject) => {
            this.connect().then( (db) => {
                db.collection(name).find(where).toArray( (err,docs) => {
                    if(err){
                        reject(err)
                    }else{
                        resolve(docs)
                    }
                })
            })
        })
    }
    /*
    * 新增
    * name 表明（collection name）
    * params 新增参数 object
    * */
    insert(name,params){
        return new Promise( (resolve,reject) => {
            this.connect().then( db =>{
                db.collection(name).insertOne(params,(err,res) => {
                    if(err){
                        reject(err)
                    }else{
                        resolve(res)
                    }
                })
            })
        })
    }

    /*
    * 保存
    * name 表明（collection name）
    * params 新增参数 object
    * */
    save(name,params){
        return new Promise( (resolve,reject) => {
            this.connect().then( db =>{
                db.collection(name).save(params,(err,res) => {
                    if(err){
                        reject(err)
                    }else{
                        resolve(res)
                    }
                })
            })
        })
    }

    /*
    * 更新
    * name 表明（collection name）
    * where 查询条件
    * params 新增参数 object
    * */
    update(name,where,params){
        return new Promise( (resolve,reject) => {
            this.connect().then( db =>{
                db.collection(name).updateOne(where,{$set:params},(err,res) => {
                    if(err){
                        reject(err)
                    }else{
                        resolve(res)
                    }
                })
            })
        })
    }

    /*
    * 更新多条
    * name 表明（collection name）
    * where 查询条件
    * params 新增参数 object
    * */
   updateAll(name,where,params){
    return new Promise( (resolve,reject) => {
        this.connect().then( db =>{
            db.collection(name).updateOne(where,{$set:params},(err,res) => {
                if(err){
                    reject(err)
                }else{
                    resolve(res)
                }
            })
        })
    })
}
    /*
    *删除
    *name 表明（collection name）
    * where 查询条件
    *params 新增参数 object
    * */
    remove(name,where){
        return new Promise( (resolve,reject) => {
            this.connect().then( db =>{
                db.collection(name).deleteOne(where,(err,res) => {
                    if(err){
                        reject(err)
                    }else{
                        resolve(res)
                    }
                })
            })
        })
    }
    /*
    * 关闭数据库
    * */
    close(){

    }
}

module.exports = Db.getInstance();


