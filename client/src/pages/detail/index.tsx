import { Layout, Divider, Typography } from 'antd';
import { useParams } from "react-router-dom";
import { ADDRESS } from '../../configs/client';
import { FundDetail, FundDetailData, CYRJG, CyrjgData } from '../../models/fund';

import MarketPane from './components/MarketPane';
import PositionPane from './components/PositionPane';
import DossierPane from './components/DossierPane';
import CyrjgChart from './components/CyrjgChart';
import { useEffect, useState } from 'react';

const { Title } = Typography;

type RouteParams = {
  code: string
  isnew: string
}
const Detail = () => {
  const { code } = useParams<RouteParams>();//json.stringfy
  const [data, setData] = useState<FundDetailData | null>(null);

  useEffect(() => {
    const fetchComparelist = async () => {
      const formatCyrjgData = (cyrjg: CYRJG[]) => {
        let chartData: CyrjgData[] = [];
        cyrjg.forEach(v1 => {
          for (const [key, value] of Object.entries(v1)) {
            // 个人持有比例 92.25%
            // console.log(`${key}: ${value}`);
            if (key === '公告日期') continue;
            const data = {
              type: key,
              value: Number(value.split('%')[0]),
              date: v1.公告日期,
              code: code
            }
            chartData.push(data)
          }
        })
        return chartData
      }
      const result: FundDetail[] = await (await fetch(`${ADDRESS}/fundsdetail/${code}`)).json();
      setData(() => {
        return {
          _id: result[0]._id,
          code: result[0].code,
          basic: result[0].basic,
          cyrjg: formatCyrjgData(result[0].cyrjg),
          managers: result[0].managers,
          zcpz: result[0].zcpz
        }
      });
      // console.log('🎹  FundDetail ', result);
    };
    fetchComparelist();
  }, [code]);

  return (
    <Layout.Content className="fund-layout" >
      <Title className="fund-fixed-title" level={3}>{`${data?.basic['基金简称']}(${data?.basic['基金代码']})`}</Title>
      <div className="fund-layout-background fund-margin-top" >
        <Divider orientation="center"><Title level={3}>行情</Title></Divider>
        <MarketPane code={code} />
      </div>
      <div className="fund-layout-background" >
        <Divider orientation="center"><Title level={3}>持仓</Title></Divider>
        {
          data?.basic
            ? <PositionPane zcpz={data?.zcpz} />
            : <>loading...</>
        }
      </div>
      <div className="fund-layout-background">
        <Divider orientation="center"><Title level={3}>规模</Title></Divider>
        {
          data?.basic
            ? <CyrjgChart data={data?.cyrjg} />
            : <>loading...</>
        }
      </div>

      <div className="fund-layout-background" >
        <Divider orientation="center"><Title level={3}>档案</Title></Divider>
        {
          data?.basic
            ? <DossierPane data={data?.basic} manager={data?.managers} />
            : <>loading...</>
        }
      </div>

    </Layout.Content>
  );
}
export default Detail;
