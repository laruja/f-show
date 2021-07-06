import {
  Chart,
  Geom,
  Tooltip,
} from 'bizcharts';
import { CyrjgData } from '../../../models/fund';

interface CYRJGProps {
  data: CyrjgData[]
}
const Position = (props: CYRJGProps) => {
  // console.log('Position CYRJG   ', props)
  return (

    <Chart height={400} padding="auto" data={props.data} autoFit
      onClick={(e: any) => {
        //   debugger
        // console.log('chart click: ',e)
      }}>
      <Tooltip>
        {
          (date, items, ...args) => {
            // console.log('tooltip :', date, items, args)
            const type = items?.length ? items[0].data.type : '';
            const tooltipItems = props.data.filter(item => {
              return item.date === date && item.type === type
            })
            return <div>
              <h5 style={{ marginBottom: -8 }}><b>{date}</b></h5>
              <ul>
                {
                  tooltipItems.map((t, i) => {
                    return <li key={i} style={{ margin: 8 }}>
                      {/* <span className='g2-tooltip-marker' style={{ backgroundColor: legendMap[t.code].style.fill }} /> */}
                      <span className='g2-tooltip-marker' />
                      {t.code} {t.value}
                    </li>
                  })
                }
              </ul>
            </div>
          }
        }

      </Tooltip>
      <Geom
        type="interval"
        position="date*value"
        color="type"
        style={{
          stroke: '#fff',
          lineWidth: 1,
        }}
        adjust={[
          {
            type: 'dodge',
            dodgeBy: 'code', // 按照 type 字段进行分组
            marginRatio: 0, // 分组中各个柱子之间不留空隙
          },
          {
            type: 'stack',
          },
        ]}
      >
      </Geom>
    </Chart>
  );
}
export default Position;
