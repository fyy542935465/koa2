const ARTICLECONTROLLER = require('../../controller/').articleController
module.exports = (router) => {
    router.post('/article/save',ARTICLECONTROLLER.save)
    router.get('/article/getArticleList',ARTICLECONTROLLER.getArticleList)
    router.get('/article/:id',ARTICLECONTROLLER.getArticleInfo)
}