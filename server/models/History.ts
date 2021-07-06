import DBHelper from '../utils/dbHelper';
import { PYDIR } from '../configs/server';
import { execPython } from '../utils';
import { IFundValueData } from '../type';


const mongoose = DBHelper.connect();

// 表结构
const FundType = {
  code: String,
  name: String
}
const FundValue = {
  _id: String,
  createDate: String,
  zcNetValue: String,
  valuationDate: String,
  type: FundType,
  idStr: String,
  shortName: String,
  code: String,
  shareNetValue: String,
  totalNetValue: String,
  gainPer: String,
  yearSevenDayYieldRate: String,
  yearSevenDayYieldRatePercent: String
}
const FundValueSchema = new mongoose.Schema(FundValue);
// 映射到mongodb的collection不区分大小写 需要指定第三个参数！否则第一个参数需要是表的单数形式
const History = mongoose.model('histest', FundValueSchema, 'histest');
const HistoryModel = {
  /**
  * 查历史净值 降序返回
  * @param code 
  * @returns Promise< IFundValueData[]>
  */
  async find(code: string): Promise<IFundValueData[]> {
    const codeparam = Array.isArray(JSON.parse(code))
      ? JSON.parse(code)
      : [JSON.parse(code) + ''];
    const qry = {
      $or: codeparam.map((v: string) => {
        return {
          'code': v
        }
      })
    };
    console.log(' 历史净值 find ', qry);

    const result = await History.find(qry)
      .sort({ 'valuationDate': -1 }) as unknown as IFundValueData[];
    return result;
  },
  /**
   * 增加多只基金历史净值(最多3只)
   * 调用python爬新基金的历史净值
   * @param code 
   * @returns 返回新增的code
   */
  async addMany(code: string): Promise<string[]> {
    const codeparam = Array.isArray(JSON.parse(code))
      ? JSON.parse(code)
      : [JSON.parse(code) + ''];
    const qry = {
      $or: codeparam.map((v: string) => {
        return {
          'code': v
        }
      })  //多条件，数组
    };
    const result = await History.aggregate([
      {
        $match: qry
      },
      {
        $group: {
          _id: '$code',
          count: { $sum: 1 },
          code: { $push: '$code' }
        }
      }
    ]);
    // 数据库中的code
    const dbcodearr = result.map(v => v._id);
    // 不存在历史表中的code
    const newcode = dbcodearr.concat(codeparam)
      .filter(v => codeparam.includes(v) && !dbcodearr.includes(v));
    // console.log('🍊 newcode: ', newcode);//510580
    // console.log('历史净值🍊 execPython ');
    newcode.length > 0 && await execPython(`python3 ${PYDIR}/fund2db_history_code.py  ${newcode}`);
    return newcode;
  }

};
export default HistoryModel;
