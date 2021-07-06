import * as Koa from 'koa';
import Router from '@koa/router';
import DaliyModel from '../models/Dalily';
import DetailModel from '../models/Detail';
import HistoryModel from '../models/History';
import ClickModel from '../models/Click';

// http://localhost:8082/v1/
const router = new Router({
  prefix: '/v1',
});
router.get('/', async (ctx) => {
  ctx.body = '🏠';
});
/**
 * 详情需要设置缓存，缓存失效时间为1个月
 * 按code查基金详情
 */
router.get('/fundsdetail/:code', async (ctx) => {
  const result = await DetailModel.find(ctx.params.code);
  ctx.body = result;
});
/**
 * isnew 简化版
 * 新增基金详情 返回代码
 */
router.get('/addDetails/:code', async (ctx) => {
  const result = await DetailModel.addNew(ctx.params.code);
  ctx.body = result;
});
/**
 * 新增基金历史净值 返回代码
 */
 router.get('/addValues/:code', async (ctx) => {
  const result = await HistoryModel.addMany(ctx.params.code);
  ctx.body = result;
});
/* *
 * 新增加点击的code
 */
router.get('/newclickcode/:codes', async (ctx) => {
  console.log('🍎newclickcode   ', ctx.params);
  const result = await ClickModel.getNewClick(ctx.params.codes);
  ctx.body = result;
});
/**
 * 模糊查找
 */
router.get('/searchFund/:codeorname', async (ctx) => {
  const result = await DaliyModel.findFuzzyByCodeOrName(ctx.params.codeorname);
  ctx.body = result;
});

export default {
  init(app: Koa): void {
    app.use(router.routes()).use(router.allowedMethods());
  }
};