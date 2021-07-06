import { useState } from 'react';
import { Chart, Tooltip, Line } from 'bizcharts';
import { Tag, Tabs } from 'antd';

import { getLast1Month, getLast3Month, getLast6Month, getLastNYear, getWeekDayBefore } from '../../api/util';
import { FundValue } from '../../models/fund';

const { TabPane } = Tabs;

// 数据
type NetValue = {
  code: string;
  date: string;
  value: number;
}

type NetvalueLineProps = {
  data: FundValue[];
  type: string;
  code: string;
}

const LineChart = ({ data, type, code }: NetvalueLineProps) => {
  // console.log('prop.type  ', type);
  const tabObj = {
    '1m': '近1月',
    '3m': '近3月',
    '6m': '近半年',
    '1y': '近1年',
    '3y': '近3年',
    'all': '成立以来',
  }

  const netvalueList: NetValue[] = data && data.map((v: FundValue, i: number) => {
    return {
      code: v.code,
      date: v.valuationDate,
      value: Number(v.shareNetValue) || Number(v.gainPer),
    }
  }).filter((v: NetValue) => v.value > 0).reverse();

  const last1m = getWeekDayBefore(getLast1Month(new Date())); //  2021/04/13
  const last1MNetvalue = netvalueList && netvalueList.filter((v: NetValue) =>
    new Date(v.date) >= new Date(last1m.getFullYear(), last1m.getMonth(), last1m.getDate())
  );

  const [netvalue, setNetvalue] = useState<NetValue[]>(last1MNetvalue);
  const NetValueChart = () => {
    const scale = {
      value: {
        type: "log",
        base: 0.1,
      },
    };
    return (
      <div>
        <Chart scale={scale} padding={[30, 0, 60, 0]} autoFit height={405} data={netvalue} interactions={['element-active']}>
          <Line shape="smooth" position="date*value" color="code" />
          <Tooltip shared showCrosshairs />
        </Chart>
      </div>

    );
  }
  const last3m = getWeekDayBefore(getLast3Month(new Date())); //  2021/02/12
  const last3MNetvalue = netvalueList && netvalueList.filter((v: NetValue) =>
    new Date(v.date) >= new Date(last3m.getFullYear(), last3m.getMonth(), last3m.getDate())
  );
  const last6m = getWeekDayBefore(getLast6Month(new Date())); //  2020/12/11
  const last6MNetvalue = netvalueList && netvalueList.filter((v: NetValue) =>
    new Date(v.date) >= new Date(last6m.getFullYear(), last6m.getMonth(), last6m.getDate())
  );

  const last1y = getWeekDayBefore(getLastNYear(new Date(), 1)); //  2020/5/13
  const last1YNetvalue = netvalueList && netvalueList.filter((v: NetValue) =>
    new Date(v.date) >= new Date(last1y.getFullYear(), last1y.getMonth(), last1y.getDate())
  );
  const last3y = getWeekDayBefore(getLastNYear(new Date(), 3)); //  2018/5/11
  const last3YNetvalue = netvalueList && netvalueList.filter((v: NetValue) =>
    new Date(v.date) >= new Date(last3y.getFullYear(), last3y.getMonth(), last3y.getDate())
  );

  function callback(key: any) {
    // console.log('近*月：', key);
    switch (key) {
      case '1m':
        setNetvalue(last1MNetvalue);
        break;
      case '3m':
        setNetvalue(last3MNetvalue);
        break;
      case '6m':
        setNetvalue(last6MNetvalue);
        break;
      case '1y':
        setNetvalue(last1YNetvalue);
        break;
      case '3y':
        setNetvalue(last3YNetvalue);
        break;
      case 'all':
        setNetvalue(netvalueList);
        break;
      default:
        setNetvalue([]);
        break;
    }
  }


  return (
    <Tabs style={{ padding: 0 }} tabPosition="top" defaultActiveKey="1m" onChange={callback} >
      {
        Object.entries(tabObj).map((v) => {
          // console.log(v);
          return (
            <TabPane tab={v[1]} key={v[0]}  >
              <Tag color="blue">{type === '6020-6020' ? '每万份收益' : '单位净值'}</Tag>
              <NetValueChart />
            </TabPane>
          )
        })
      }
    </Tabs>
  );
}

export default LineChart;
