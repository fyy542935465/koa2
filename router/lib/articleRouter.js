const ARTICLECONTROLLER = require('../../controller/').articleController
module.exports = (router) => {
    router.post('/api/article/save',ARTICLECONTROLLER.save)
    router.get('/api/article/getArticleList',ARTICLECONTROLLER.getArticleList)
    router.get('/api/article/getHotArticleList',ARTICLECONTROLLER.getHotArticleList)
    router.get('/api/article/detail/:id',ARTICLECONTROLLER.getArticleInfo)
    router.post('/api/article/delete',ARTICLECONTROLLER.delete)
    router.post('/api/article/comment/save',ARTICLECONTROLLER.saveComment)
    router.get('/api/article/comment',ARTICLECONTROLLER.comment)
    router.post('/api/article/detail/count',ARTICLECONTROLLER.count)
    router.post('/api/article/comment/praise',ARTICLECONTROLLER.praise)
    router.post('/api/article/comment/reply',ARTICLECONTROLLER.reply)
}