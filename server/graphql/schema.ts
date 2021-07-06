import { gql } from 'apollo-server';
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query{
    # 搜索基金
    search(code:String!):[FundValue]
    # 基金历史净值
    fundsValues(codes:String!):[FundValue]
    # 每日净值
    fundsDaliyValue(type:String!):[FundValue]
  }
  type Mutation {
    updateClick(code: String!, name: String!): Click
    addHistories(codes:String!):[FundValue]
  }

  type Click {
    _id:ID
    # 基金代码 唯一
    code:String
    name:String
    clicktime:String
  }

  type FundValue{
    _id: ID!
    createDate:String
    zcNetValue:String
    # 日期
    valuationDate: String
    # 基本类型
    type:FundType
    idStr:String
    shortName: String
    code: String
    # 单位净值
    shareNetValue: String
    totalNetValue: String
    gainPer: String
    yearSevenDayYieldRate: String
    yearSevenDayYieldRatePercent: String
  }
 
  type FundType{
    code:String  
    name:String
  }
`;
export default typeDefs;