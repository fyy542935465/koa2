const koa  = require('koa')
const router = require('koa-router')()
const port = 3333
// const koaNunjucks = require('koa-nunjucks-2');
const render = require('koa-art-template')
const path = require('path')
// const bodyparser = require('koa-bodyparser');
const koaBody = require('koa-body');
const static = require('koa-static');
const session = require('koa-session')
const routes = require('./router')
const app = new koa();
const cors = require('koa2-cors');
const middleware = require('./middleware')
app.keys = ['some secret hurr'];
const CONFIG = {
    key: 'koa:sess',   //cookie key (default is koa:sess)
    maxAge: 86400000,  // cookie的过期时间 maxAge in ms (default is 1 days)
    overwrite: true,  //是否可以overwrite    (默认default true)
    httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
    signed: true,   //签名默认true
    rolling: false,  //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
    renew: false,  //(boolean) renew session when session is nearly expired,
};
app.use(session(CONFIG, app));

//设置静态目录
app.use(static(path.join( __dirname, './static')));

//获取post参数
// app.use(bodyparser());

//koa-body 使用配置
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 200*1024*1024  // 设置上传文件大小最大限制，默认2M
    }
}));
/*
* koa-art-template
* */
render(app,{
    root:path.join(__dirname,'views'),
    extname:'.html',
    debug: process.env.NODE_ENV !== 'production'
})

app.use(cors());

/*
* nunjucks配置
* */
// app.use(koaNunjucks({
//     ext: 'html',
//     path: path.join(__dirname, './views'),
//     nunjucksConfig: {
//         trimBlocks: true
//     }
// }));

middleware(app)

app.use( async (ctx,next) =>{
    await next();
})

router.get('/', async (ctx,next) => {
    ctx.body = 'hello world'
})

routes(router);  //路由

app.use(router.routes())
app.use(router.allowedMethods())

/*
* 监听端口  port
* */
app.listen(port,() => {
    console.log('starting at port ' + port)
});