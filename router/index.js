module.exports = router =>{
    require('./lib/userRouter')(router);
    require('./lib/articleRouter')(router);
    require('./lib/adminRouter')(router);
}