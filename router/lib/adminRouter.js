const ADMINCONTROLLER = require('../../controller').adminController
module.exports = (router) => {
    router.get('/getAdmin',ADMINCONTROLLER.getAdmin)
    router.post('/delAccount',ADMINCONTROLLER.delAccount)
    router.post('/adminOprate',ADMINCONTROLLER.adminOprate)
}