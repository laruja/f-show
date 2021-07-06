import './index.css';
import { useState, useEffect, useMemo } from 'react';
import { Layout, Row, Col, Divider, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useParams } from "react-router-dom";
import { gql, useQuery } from '@apollo/client';

import { ADDRESS } from '../../configs/client';
import { Dossier, Manager, CYRJG, ZCPZ, CyrjgData, ZcpzData, FundValue } from '../../models/fund';


import CompareDrawer from './components/CompareDrawer';
import CyrjgChart from './components/CyrjgChart';
import ZcpzChart from './components/ZcpzChart';
import ManagerTimeLine from '../../components/Timeline';
import NetValueChart from '../../components/Charts/NetValueChart';

const { Title } = Typography;

type FundsValue = {
  _id: string;
  valuationDate: string;
  code: string;
  value: number;
}

type CompareDetail = {
  _id: string,
  code: string,
  basic: Dossier,
  cyrjg: CYRJG[],
  managers: Manager[],
  zcpz: ZCPZ[]
}

//  server中schema对应的名字 名字不对报错400
export const GET_FUNDS_VALUES = gql`
  query FundsValues($codes: String!) {
    fundsValues(codes: $codes) {
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

type RouteParams = {
  code: string
}

const Compares = () => {
  // 强制最多同时对比三个
  const { code } = useParams<RouteParams>();
  const codes = JSON.parse(code);
  const [codelist, setCodelist] = useState<string[]>(codes);
  const [compareList, setCompareList] = useState<CompareDetail[]>([]);
  const [fundsValue, setFundsValue] = useState<FundsValue[]>([]);
  const [cyrjgData, setCyrjgData] = useState<CyrjgData[]>([]);
  const [zcpzData, setZcpzData] = useState<ZcpzData[]>([]);

  useEffect(() => {
    const fetchComparelist = async () => {
      const result: CompareDetail[] = await (await fetch(`${ADDRESS}/fundsdetail/${code}`)).json();
      setCompareList(result);
      // console.log('🎹  compareList ', result);
      const cyrjg = formatCyrjgData(result);
      setCyrjgData(cyrjg);
      setZcpzData(formatZcpzData(result));
    };
    fetchComparelist();
  }, [code]);
  const formatCyrjgData = (clist: CompareDetail[]) => {
    let chartData: CyrjgData[] = [];
    clist.forEach(v => {
      v.cyrjg.forEach(v1 => {
        for (const [key, value] of Object.entries(v1)) {
          // 个人持有比例 92.25%
          if (key === '公告日期') continue;
          chartData.push({
            type: key,
            value: Number(value.split('%')[0]),
            date: v1.公告日期,
            code: v.code
          })
        }
      })
    })
    return chartData
  }
  const formatZcpzData = (clist: CompareDetail[]) => {
    let chartData: CyrjgData[] = [];
    clist.forEach(v => {
      v.zcpz.forEach(v1 => {
        for (const [key, value] of Object.entries(v1)) {
          // 个人持有比例 92.25%
          if (key === '报告期') continue;
          chartData.push({
            type: key,
            value: Number(value.split('%')[0]),
            date: v1.报告期,
            code: v.code
          })
        }
      })
    })
    return chartData
  }
  const [fundType, setFundType] = useState('');
  const { data: valueData, loading: valueLoading, error: valueError, } = useQuery(
    GET_FUNDS_VALUES,
    {
      variables: { codes: JSON.stringify(codelist) },
    });

  useMemo(() => {

    setFundType(() => {
      // console.log('comparePane ', valueData)
      return valueData && valueData.fundsValues.length > 0 && valueData.fundsValues[0] && valueData.fundsValues[0].type.code;
    });
    setFundsValue(() => {
      const val: FundsValue[] = [];
      if (valueData && valueData.fundsValues.length > 0) {
        let j = 0;
        for (let i = 0; i < codelist.length; i++) {
          const v: FundValue = valueData.fundsValues[j];
          if (codelist[i] === v.code) {
            val.push({
              _id: v._id,
              valuationDate: v.valuationDate,
              code: v.code,
              value: Number(v.shareNetValue) || Number(v.gainPer) || Number(v.yearSevenDayYieldRate)
            });
          } else {
            i--;
          }
          j++;
        }
      }
      // console.log(val);
      return val;
    });
  }, [codelist, valueData]);
  const ValueChart = () => {
    if (valueLoading) {
      return (
        <>
          <h3>loading......</h3>
        </>
      );
    }
    if (valueError) {
      return (
        <>
          <h2>error......</h2>
        </>
      );
    }
    return (<Row align="middle">
      <Col span={2}><Title level={5}>收益走势</Title></Col>
      <Col span={22} >
        <NetValueChart data={valueData.fundsValues} type={fundType} code={JSON.stringify(codelist)} />
      </Col>
    </Row>)
  };

  return (
    <Layout.Content className="fund-layout">
      <CompareDrawer />
      <div>
        <Row className="fund-fixed-title" justify="center" >
          {/* col取值范围1～24 */}
          <Col span={2}></Col>
          {
            compareList && compareList.length > 0 && compareList.map((v, i) => (
              <Col key={v.basic['基金代码']} span={7} >
                <Title level={5}>{v.basic.基金简称}({v.basic['基金代码']})
                  <CloseOutlined className="close" onClick={() => {
                    console.error('🎹删除', v, i);
                    console.error('🎹删除', fundsValue);
                    if (codelist.length === 1) {
                      alert('再点就没啦');
                      return;
                    }
                    setCompareList(compareList.filter((v, j) => j !== i));
                    setCodelist(codelist.filter((v, j) => j !== i));
                    setFundsValue(fundsValue.filter((v, j) => j !== i));
                  }} />
                </Title>
              </Col>
            ))
          }
        </Row>

        {/* <div className="fund-layout-background fund-margin-top compare" > */}
        <Divider orientation="center">收益走势</Divider>
        <div className="fund-layout-background  fund-margin-top compare" >
          < ValueChart />
        </div>

        {/* 基本信息 */}
        <Divider orientation="center">基本信息</Divider>
        <div className="fund-layout-background compare">
          <Row justify="center" >
            <Col span={2}><Title level={5}>成立时间</Title></Col>
            {
              compareList && compareList.length > 0 && compareList.map((v) => {
                return (
                  <Col span={7} key={v.basic['基金代码']}>{v.basic['成立日期/规模']}</Col>
                )
              })
            }
          </Row>
          <Row justify="center" >
            <Col span={2}><Title level={5}>单位净值</Title></Col>
            {/* <ValueCol /> */}
            {
              fundsValue && fundsValue.length > 0 && fundsValue.map((v: FundsValue) => {
                return (
                  <Col span={7} key={v._id}>{`${v.value}(${v.valuationDate})`}</Col>
                )
              })
            }
          </Row>
          <Row justify="center">
            <Col span={2}><Title level={5}>最新规模</Title></Col>
            {
              compareList && compareList.length > 0 && compareList.map((v) => {
                return (
                  <Col span={7} key={v.basic['基金代码']}>{v.basic.份额规模}</Col>
                )
              })
            }
          </Row>
          <Row justify="center">
            <Col span={2}><Title level={5}>基金类型</Title></Col>
            {
              compareList && compareList.length > 0 && compareList.map((v) => {
                return (
                  <Col span={7} key={v.basic['基金代码']}>{v.basic.基金类型}</Col>
                )
              })
            }
          </Row>
          <Row justify="center">
            <Col span={2}><Title level={5}>资产规模</Title></Col>
            {
              compareList && compareList.length > 0 && compareList.map((v) => {
                return (
                  <Col span={7} key={v.basic['基金代码']}>{v.basic.资产规模.split('）')[0] + ')'}</Col>
                )
              })
            }
          </Row>
        </div>
        {/* 基金经理 */}
        <Divider orientation="center">基金经理</Divider>
        <div className="fund-layout-background compare">
          <Row justify="center">
            <Col span={1}><Title level={5}>现任</Title></Col>
            {
              compareList && compareList.length > 0 && compareList.map((v) => {
                return (
                  <Col span={7} key={v.basic['基金代码']}>基金经理：{v.basic.基金经理人}</Col>
                )
              })
            }
          </Row>
          <Row justify="center">
            <Col span={1}><Title level={5}>历任</Title></Col>
            {
              compareList && compareList.length > 0 && compareList.map((v: CompareDetail) => {
                return (
                  <Col span={7} key={v._id}><ManagerTimeLine data={v.managers} /></Col>
                )
              })
            }
          </Row>
        </div>

        {/*  投资组合*/}
        <Divider orientation="center">投资组合</Divider>

        <div className="fund-layout-background compare">
          <Row align="middle">
            <Col span={2}><Title level={5}>资产配置 </Title></Col>
            <ZcpzChart data={zcpzData} />
          </Row>
        </div>
        {/* 持有人结构 */}
        <Divider orientation="center">持有人结构</Divider>
        <div className="fund-layout-background compare">
          <Row align="middle">
            <Col span={2}><Title level={5}>投资者结构</Title></Col>
            <CyrjgChart data={cyrjgData} />
          </Row>
        </div>
      </div>

    </Layout.Content>
  );
};

export default Compares;
