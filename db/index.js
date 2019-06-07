const mysql = require('mysql')
const env = require('../env').CURRENT
const config = require('./config')[env]


const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
})

const query = function (sql, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                resolve(err)
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })

}

const find = (table, where, param) => {
    let _sql = `SELECT * FROM ${table} WHERE ${where} = ?`
    return query(_sql, [param])
}

const update = (table, values, where, whereis) => {
    let _sql = `update ${table} SET ${values} where ${where} = ?`
    return query(_sql, [whereis])
}

const remove = (table,where,value) => {
    let _sql = `delete from ${table} where ${where} = ?`
    return query(_sql, [value])
}

module.exports = {
    query,
    find,
    update,
    remove
}