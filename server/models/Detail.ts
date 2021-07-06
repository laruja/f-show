import DBHelper from '../utils/dbHelper';
import { PYDIR } from '../configs/server';
import { execPython } from '../utils';
import { IFundDetail } from '../type';

const mongoose = DBHelper.connect();
const DetailSchema = new mongoose.Schema({
  _id: String,
  code: String,
});
// 映射到mongodb的collection不区分大小写 需要指定第三个参数！否则第一个参数需要是表的单数形式
const DetailCol = mongoose.model('fund', DetailSchema, 'fund');
const DetailModel = {
  /**
   * 增加基金详情
   * @param code 
   * @returns 增加的code
   */
  async addNew(code: string): Promise<string[]> {
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
    // 仅返回_id 和 code
    const result = await DetailCol.find(qry, { 'code': 1 }) as unknown as IFundDetail[];
    // code
    const dbcode = result.map((v: { code: string }) => v.code);
    // 找出新的代码
    const newcode = codeparam.concat(dbcode)
      .filter((v: string) => codeparam.includes(v) && !dbcode.includes(v));
    (newcode.length > 0) && await execPython(`python3 ${PYDIR}/fund2db_basic1code.py  ${newcode}`);
    console.log('FundDetail addNew newcode: ', newcode);
    return newcode;
  },
  /**
   * 查找多个详情
   * @param codeparam 
   * @returns 
   */
  async find(codeparam: string): Promise<IFundDetail[]> {
    const code = Array.isArray(JSON.parse(codeparam))
      ? JSON.parse(codeparam)
      : [JSON.parse(codeparam) + ''];
    const qry = {
      $or: code.map((v: string) => {
        return {
          'code': v
        }
      })
    };

    const result = await DetailCol.find(qry) as unknown as IFundDetail[];
    return result;
  },
}
export default DetailModel;
