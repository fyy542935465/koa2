const USERCONTROLLER = require('../../controller/').userController
module.exports = (router) => {
    router.post('/api/register',USERCONTROLLER.register)
    router.get('/api/getUserList',USERCONTROLLER.getUserList)
    router.get('/api/getUserInfo',USERCONTROLLER.getUserInfo)
    router.post('/api/login',USERCONTROLLER.login)
    router.post('/api/uploadImg',USERCONTROLLER.uploadImg)
}