import { Descriptions, Tooltip } from 'antd';
import ManagerTimeLine from '../../../components/Timeline';
import { Manager,Dossier } from '../../../models/fund';

type DossierProps= {
  data:Dossier
  manager:Manager[]
}

const FilesPane = (props: DossierProps) => {
  // console.log('DossierProps ',props)
  const text = <span>从业5年193天，从业年均回报+29.43% ，年化回报26.61%，最大回撤25.62%，在任基金4只</span>;
  return (
    <>
      <Descriptions title="概况">
        <Descriptions.Item label="基金类型">{props.data.基金类型}</Descriptions.Item>
        <Descriptions.Item label="成立日期/规模">{props.data['成立日期/规模']}</Descriptions.Item>
        <Descriptions.Item label="基金经理">
          <Tooltip placement="topRight" title={text}>
            {props.data.基金经理人}
          </Tooltip>
        </Descriptions.Item>
        <Descriptions.Item label="基金公司">{props.data.基金管理人}</Descriptions.Item>
        <Descriptions.Item label="托管人">{props.data.基金托管人}</Descriptions.Item>
        <Descriptions.Item label="资产规模">{props.data.资产规模.split('）')[0]+'）'}</Descriptions.Item>

      </Descriptions>
      <Descriptions title="历任基金经理">
      </Descriptions>
      <ManagerTimeLine data = {props.manager}/>
    </>
  );
};

export default FilesPane;