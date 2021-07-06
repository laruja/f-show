import { useState, useEffect } from 'react';
import { Card, Col, Row, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { gql, useQuery } from '@apollo/client';
import { FundValue, FundTableValue } from '../../../models/fund';

import NetValueChart from '../../../components/Charts/NetValueChart';

const columns1: ColumnsType<FundTableValue> = [
  {
    key: 'valuationDate',
    title: '日期',
    dataIndex: 'valuationDate',
    width: 100,
  },
  {
    key: 'shareNetValue',
    title: '单位净值',
    dataIndex: 'shareNetValue',
    width: 100,
  },
  {
    key: 'totalNetValue',
    title: '累计净值',
    dataIndex: 'totalNetValue',
    width: 100,
  },
];
const columns2: ColumnsType<FundTableValue> = [
  {
    key: 'valuationDate',
    title: '日期',
    dataIndex: 'valuationDate',
    width: 100,
  },
  {
    key: 'gainPer',
    title: '每万份收益',
    dataIndex: 'gainPer',
    width: 100,
  },
  {
    key: 'yearSevenDayYieldRatePercent',
    title: '7日年化收益率',
    dataIndex: 'yearSevenDayYieldRatePercent',
    width: 100,
  },
];

type MarketProps = {
  code: string;
}

// server中schema对应的名字 名字不对报错400
export const GET_FUND_VALUES = gql`
  query FundValues($code: String!) {
    fundsValues(codes: $code) {
      _id
      createDate
      zcNetValue
      valuationDate
      idStr
      shortName
      code
      shareNetValue
      totalNetValue
      gainPer
      yearSevenDayYieldRate
      yearSevenDayYieldRatePercent
      type{
        code
        name
      }
    }
  }
`;

const MarketPane = (props: MarketProps) => {
  // const defaultActiveKey = "unit";
  // const [tabState] = useState(defaultActiveKey);
  const [fundType, setFundType] = useState('');
  const { data, loading, error, } = useQuery(
    GET_FUND_VALUES,
    {
      variables: { code: props.code },
    });
  useEffect(() => {
    setFundType(() => {
      return data && data.fundsValues.length > 0 && data.fundsValues[0] && data.fundsValues[0].type.code;
    })
  }, [data]);

  const Pane = () => {
    if (loading) {
      return (
        <h3>loading......</h3>
      );
    }
    if (error) {
      return (
        <h2>error......</h2>
      );
    }

    const netvaluData: FundTableValue[] = data.fundsValues.map((v: FundValue, i: number) => {
      return {
        _id: v._id,
        valuationDate: v.valuationDate,
        shareNetValue: Number(v.shareNetValue),
        totalNetValue: Number(v.totalNetValue),
        gainPer: Number(v.gainPer),
        yearSevenDayYieldRatePercent: v.yearSevenDayYieldRatePercent,
      }
    }).filter((v: FundTableValue) => v.shareNetValue !== 0 || v.gainPer !== 0);
    // console.log('market pane 🍎', netvaluData)

    return (
      <>
        <div style={{ padding: 30, background: '#ececec', borderRadius: '10px' }}>
          <Row justify="start" gutter={16}>
            <Col span={12} >
              <Card title={fundType === '6020-6020' ? `每万份收益(${data.fundsValues[0].valuationDate})` : `单位净值(${data.fundsValues[0].valuationDate})`} bordered={false} style={{ borderRadius: '10px', color: '#f5222d', fontSize: 28 }}>
                {fundType === '6020-6020' ? data.fundsValues[0].gainPer : data.fundsValues[0].shareNetValue}
              </Card>
            </Col>
            <Col span={12}>
              <Card title={fundType === '6020-6020' ? '7日年化收益率' : '累计净值'} bordered={false} style={{ borderRadius: '10px', color: '#f5222d', fontSize: 28 }}>
                {fundType === '6020-6020' ? data.fundsValues[0].yearSevenDayYieldRatePercent : data.fundsValues[0].totalNetValue}
              </Card>
            </Col>
            {/*  <Col span={8}>
              <Card title={`净值估算 (${today})`} bordered={false} style={{ borderRadius: '10px', color: '#389e0d', fontSize: 28 }}>
                {666}
              </Card>
            </Col> */}
          </Row>
        </div>

        <div>
          <Row >
            <Col span={16} style={{ padding: 10 }}>
              {/* <NetValueChart type={tabState} code={props.code} /> */}
              <NetValueChart data={data.fundsValues} type={fundType} code={props.code} />
            </Col>
            <Col span={8}>
              <Table<FundTableValue>
                rowKey={netvaluData => netvaluData._id}
                pagination={{ position: ['bottomCenter'], pageSize: 7, size: 'small' }}
                columns={fundType === '6020-6020' ? columns2 : columns1}
                dataSource={netvaluData} />
            </Col>
          </Row>
        </div>
      </>
    );
  }

  return (
    <Pane />
  );
}
export default MarketPane;