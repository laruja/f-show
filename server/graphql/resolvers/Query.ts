import DaliyModel from '../../models/Dalily';
import HistoryModel from '../../models/History';
import { IFundValueData } from '../../type';

interface Isearch {
  codeorname: string
}
interface IType {
  type: string
}
interface Ihistory {
  codes: string
}
export default {
  // 搜索
  search: async (_: never, args: Isearch): Promise<IFundValueData[]> => {
    const result = await DaliyModel.findFuzzyByCodeOrName(args.codeorname);
    return result;
  },
  // 当日净值
  fundsDaliyValue: async (_: never, args: IType): Promise<IFundValueData[]> => {
    console.log('graphql 当日净值');
    const result = await DaliyModel.findDaliyValueByType(args.type);
    return result;
  },
  // 查历史净值
  fundsValues: async (_: never, args: Ihistory): Promise<IFundValueData[]> => {
    console.log('graphql 历史净值', args.codes);
    const result = await HistoryModel.find(args.codes);
    return result;
  },
}
