import { Timeline } from 'antd';
import { Manager } from '../../models/fund';

type ManagerProps = {
  data: Manager[]
}

const ManagerTimeline = (props: ManagerProps) => {
  return (
    <Timeline mode="alternate" reverse={false}>
      {
        props.data && props.data.map((v, i) => {
          return (
            <Timeline.Item key={v.基金经理 + v.任职期间} color={Number(v.任职回报.split('%')[0]) > 0 ? 'red' : 'green'}>
              <p>{v.起始期}～{v.起始期}（{v.任职期间}）</p>
              <p>{v.基金经理}</p>
              <p>{v.任职回报}</p>
            </Timeline.Item>
          )
        })
      }
    </Timeline>
  );
}
export default ManagerTimeline;
