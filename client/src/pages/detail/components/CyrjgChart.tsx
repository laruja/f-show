import {
  Chart,
  Tooltip,
  Interval
} from 'bizcharts';

import { CyrjgData } from '../../../models/fund';

type CYRJGProps = {
  data: CyrjgData[]
}
const Position = (props: CYRJGProps) => {
  // console.log('detail CYRJG   ', props)
  return (
    <Chart height={400} padding="auto" data={props.data} autoFit>
      <Interval
        adjust={[
          {
            type: 'dodge',
            marginRatio: 0,
          },
        ]}
        color="type"
        position="date*value"
      />
      <Tooltip shared />
    </Chart>
  );
}
export default Position;
