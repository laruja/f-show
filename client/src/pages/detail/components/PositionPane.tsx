import { Col, Row } from 'antd';
import {
  Chart,
  Tooltip,
  PieChart,
  Line,
} from "bizcharts";

import { ZCPZ } from '../../../models/fund';

type PositionProps = {
  zcpz: ZCPZ[]
}

const PositionPane = (props: PositionProps) => {
  // console.log('PositionPane ', props);
  const dataInit = props.zcpz
    .map((v, i) => {
      return [
        { 报告期: v.报告期, name: '债券占净比', value: Number(v.债券占净比.replace('%', '')) },
        { 报告期: v.报告期, name: '现金占净比', value: Number(v.现金占净比.replace('%', '')) },
        { 报告期: v.报告期, name: '股票占净比', value: Number(v.股票占净比.replace('%', '')) },
        { 报告期: v.报告期, name: '净资产（亿元）', value: Number(v['净资产（亿元）']) },
      ]
    });
  const data = dataInit.flat();
  const scale = {
    value: {
      type: "log",
      base: 10,
    },
  };
  return (
    <Row>
      <Col span={24}>
        <Chart scale={scale} padding={[30, 20, 60, 40]} autoFit height={320} data={data.filter(v => v.name === '净资产（亿元）')} interactions={['element-active']}>
          <Line shape="smooth" position="报告期*value" color="name" />
          <Tooltip shared showCrosshairs visible={true}>
            {(title, items: any) => {
              // items 是个数组，即被触发tooltip的数据。
              // console.log(title, items);
              const datapie = data.filter(v => v.报告期 === title && v.name !== '净资产（亿元）');
              return (
                <PieChart
                  height={200}
                  width={360}
                  data={datapie}
                  title={{
                    visible: true,
                    text: `${items[0].data.value}亿元/${title}`,
                    // text: '饼图-外部图形标签(outer label)',
                  }}
                  description={{
                    visible: false,
                    text: '当把饼图label的类型设置为outer时，标签在切片外部拉线显示。设置offset控制标签的偏移值。',
                  }}
                  radius={0.8}
                  angleField='value'
                  colorField='name'
                  label={{
                    visible: true,
                    type: 'outer',
                    offset: 20,
                  }}
                />
              )
            }}
          </Tooltip>
        </Chart>
      </Col>
    </Row>
  );
}
export default PositionPane;
