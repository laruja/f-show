import { IClick } from '../type';
import DBHelper from '../utils/dbHelper';

const mongoose = DBHelper.connect();

const clickSchema = new mongoose.Schema({
  code: String,
  shortName: String,
  clicktime: Number
});
const ClickCol = mongoose.model('click', clickSchema, 'click');
const ClickModel = {
  /**
   * 增加点击次数，没有则新增
   * @param code 
   * @param name 
   * @returns 
   */
  async addNew(code: string, name: string) {
    //condition update 一一对应
    const conditions = { code: code, name: name };
    const update = {
      code: code,
      name: name,
      $inc: { clicktime: 1 }
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true, strict: false };
    const result = await ClickCol.findOneAndUpdate(conditions, update, options);
    console.log(result);
    return result;
  },
  /**
   * 查找新增加点击的code
   * @param code 
   * @returns 增加的code
   */
  async getNewClick(code: string): Promise<Array<string>> {
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
    console.log('🍎qry getNewClick   ', qry)
    const result = await ClickCol.find(qry) as unknown as IClick[];
    // code
    const dbcode = result.map((v: { code: string }) => v.code);
    console.log('dbcode   ', dbcode)

    // 找出新的代码
    const newcode = codeparam.concat(dbcode).filter(v => codeparam.includes(v) && !dbcode.includes(v));
    console.log(' newcode  ', newcode)


    return newcode
  },

}
export default ClickModel;
