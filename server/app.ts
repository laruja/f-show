import Koa from 'koa';
import cors from 'koa2-cors';

import serve from 'koa-static';
import log4js from 'log4js';
import koaBody from 'koa-body';

import ErrorHander from './middleware/ErrorHander';
import controller from './controllers';
import config from './configs/server';
// import './controllers/schedule';
import initApolloServer from "./graphql";

const app = new Koa();
app.use(koaBody());
// Enable CORS for all routes
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Accept'],
  exposeHeaders: ['fund-api-cache', 'fund-api-response-time'],
}));
// 错误日志记录
log4js.configure({
  appenders: {
    globallog: {
      type: 'file',
      filename: './logs/globallog.log'
    }
  },
  categories: {
    default: {
      appenders: ['globallog'],
      level: 'debug'
    }
  }
});
const logger = log4js.getLogger('globallog');

ErrorHander.init(app, logger);
// AnalysicsHander.init(app);
// 初始化路由
controller.init(app);
// 初始化 graphql
initApolloServer(app);
// 静态资源目录
app.use(serve('client'));

// 全局异常捕获
process.on('uncaughtException', err => {
  logger.error(JSON.stringify(err));
});

// 导出给 jest 测试
module.exports = app.listen(config.serverPort, config.IP, () => {
  console.log(`👏服务器运行在 http://${config.IP}:${config.serverPort}/`);

});

