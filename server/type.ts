interface IFundType {
  code: string
  name: string
}
interface IDossier {
  '基金全称': string
  '基金简称': string
  '基金代码': string
  '基金类型': string
  '发行日期': string
  '成立日期/规模': string
  '资产规模': string
  '份额规模': string
  '基金管理人': string
  '基金托管人': string
  '基金经理人': string
  '成立来分红': string
  '管理费率': string
  '托管费率': string
  '销售服务费率': string
  '最高认购费率': string
  '最高申购费率': string
  '最高赎回费率': string
  '业绩比较基准'?: string
  '跟踪标的'?: string
}

interface IManager {
  "起始期": string
  "截止期": string
  "基金经理": string
  "任职期间": string
  "任职回报": string
}

interface ICYRJG {
  '个人持有比例': string
  '公告日期': string
  '内部持有比例': string
  '总份额（亿份）': string
  '机构持有比例': string
}
interface IZCPZ {
  "报告期": string
  "股票占净比": string
  "债券占净比": string
  "现金占净比": string
  "净资产（亿元）": string
}
interface ICyrjgData {
  type: string //'个人持有比例' | '内部持有比例' | '机构持有比例' | '总份额（亿份）'
  value: number
  date: string
  code: string
}
interface IZcpzData {
  type: string //'股票占净比' | '债券占净比' | '现金占净比' | '净资产（亿元）'
  value: number
  date: string
  code: string
}
export interface IClick {
  _id: string
  code: string
  name: string
  clicktime: number
}

export interface IFundValueData {
  _id: string
  createDate: string
  zcNetValue: string
  valuationDate: string
  type: IFundType
  idStr: string
  shortName: string
  code: string
  shareNetValue: string
  totalNetValue: string
  gainPer: string
  yearSevenDayYieldRate: string
  yearSevenDayYieldRatePercent: string
}

export interface IFundDetail {
  _id: string
  code: string
  IDossier: IDossier
  IManager: IManager
  ICYRJG: ICYRJG
  IZCPZ: IZCPZ
}
// type FundDetail:IDossier | IManager | ICYRJG | IZCPZ