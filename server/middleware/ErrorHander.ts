import * as Koa from 'koa';
import { Logger } from 'log4js';

const ErrorHander = {
  init(app: Koa, logger: Logger): void {
    // 捕获内部错误
    app.use(async (ctx: Koa.Context, next: Function) => {
      try {
        await next();
      } catch (e) {
        console.log(50000000, e)
        logger.error(e);
        logger.error(JSON.stringify(e));
        ctx.status = 500;
        // ctx.body = '内部错误';
        ctx.body = e;
      }
    });
    // 捕获 404 错误
    app.use(async (ctx: Koa.Context, next: Function) => {
      await next();
      if (ctx.status === 404 && ctx.url !== '/404.html') {
        // ctx.redirect('/404.html');
        ctx.body = status;

      }
    });
  }
};

export default ErrorHander;