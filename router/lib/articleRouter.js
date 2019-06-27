const ARTICLECONTROLLER = require('../../controller/').articleController
module.exports = (router) => {
    router.post('/article/save',ARTICLECONTROLLER.save)
    router.get('/article/getArticleList',ARTICLECONTROLLER.getArticleList)
    router.get('/article/getHotArticleList',ARTICLECONTROLLER.getHotArticleList)
    router.get('/article/detail/:id',ARTICLECONTROLLER.getArticleInfo)
    router.post('/article/delete',ARTICLECONTROLLER.delete)
    router.post('/article/comment/save',ARTICLECONTROLLER.saveComment)
    router.get('/article/comment',ARTICLECONTROLLER.comment)
    router.post('/article/detail/count',ARTICLECONTROLLER.count)
}