import ClickModel from '../../models/Click';
import HistoryModel from '../../models/History';

interface IUClick {
  code: string
  name: string
}
interface IAHistory {
  code: string
}
export default {
  /**
   * 新增点击次数 ---待结合client验证
   * PUT方法用请求负载替换目标资源的所有当前表示形式。
   */
  updateClick: async (_: never, args: IUClick) => {
    const result = await ClickModel.addNew(args.code, args.name);
    return result;
  },
  addHistories: async (_: never, args: IAHistory): Promise<string[]> => {
    const result = await HistoryModel.addMany(args.code);
    return result;
  }
}