const ADMINCONTROLLER = require('../../controller').adminController
module.exports = (router) => {
    router.get('/api/getAdmin',ADMINCONTROLLER.getAdmin)
    router.post('/api/delAccount',ADMINCONTROLLER.delAccount)
    router.post('/api/adminOprate',ADMINCONTROLLER.adminOprate)
    router.post('/api/count',ADMINCONTROLLER.count)
    router.get('/api/getBrowsingRecords',ADMINCONTROLLER.getBrowsingRecords)
}