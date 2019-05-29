const ADMINCONTROLLER = require('../../controller').adminController
module.exports = (router) => {
    router.get('/getAdmin',ADMINCONTROLLER.getAdmin)
    router.get('/getUserList',ADMINCONTROLLER.getUserList)
    router.post('/delAccount',ADMINCONTROLLER.delAccount)
}