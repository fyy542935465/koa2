const USERCONTROLLER = require('../../controller/').userController
module.exports = (router) => {
    router.post('/register',USERCONTROLLER.register)
    router.get('/getUserInfo',USERCONTROLLER.getUserInfo)
    router.post('/login',USERCONTROLLER.login)
    router.post('/uploadImg',USERCONTROLLER.uploadImg)
}