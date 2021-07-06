import { IFundValueData } from '../type';
import DBHelper from '../utils/dbHelper';

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
const DaliyCol = mongoose.model('daliy', FundValueSchema, 'daliy');
const DaliyModel = {
  /**
* 模糊查找 降序返回
*/
  async findFuzzyByCodeOrName(codeorname: string): Promise<IFundValueData[]> {
    if (codeorname === ' ' || new RegExp("^[ ]+$").test(codeorname)) return [];
    const qry = Number.isInteger(Number(codeorname))
      ? { 'code': new RegExp(codeorname) }
      : { "shortName": new RegExp(codeorname) };
    console.log('qry', qry);
    const result = await DaliyCol.find(qry)
      .sort({ 'shareNetValue': -1, 'gainPer': -1 }) as unknown as IFundValueData[];
    console.log('findFuzzyByCodeOrName', result);
    return result;

  },
  /**
 * 模糊查找 降序返回
 */
  async findFuzzy(code: string): Promise<IFundValueData[]> {
    const reg = new RegExp(code);
    const result = await DaliyCol.find({ code: reg })
      .sort({ 'shareNetValue': -1, 'gainPer': -1 }) as unknown as IFundValueData[];
    console.log('🍎，模糊查找', result);
    return result;
  },

  /**
 * 查各类型特定日期的净值 降序返回
 * xxx/v1/funds/2021-04-23/6020-6060
 */
  async findDaliyValueByType(type: string): Promise<IFundValueData[]> {
    console.log('graphql 当日净值', type);

    // const result = await DaliyCol.find({ 'valuationDate': date + '', 'type.code': type + '' })
    const result = await DaliyCol.find({ 'type.code': type })
      .sort({ 'valuationDate': -1, 'shareNetValue': -1, 'gainPer': -1 }) as unknown as IFundValueData[];

    return result;
  }
}
export default DaliyModel;
