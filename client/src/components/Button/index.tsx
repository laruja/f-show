import { Button } from 'antd';
import { gql, useMutation } from '@apollo/client';
import { useState, } from 'react';
import { useHistory } from "react-router-dom";
import { ADDRESS } from '../../configs/client';
import { FundType } from '../../models/fund';

export const UPDATE_CLICK = gql`
  mutation UpdateClick($code: String!, $name: String!) {
    updateClick(code: $code, name: $name) {
      code
      name
      clicktime
    }
  }
`;

type selectedRowsProps = {
  onConfirmClick?: () => void
  selectedRows: FundType[]
}
/**
 * 
 * 点击确认按钮
 * 增加click次数
 * 爬取新基金 
 */
const SelectConfirmButton = (props: selectedRowsProps) => {
  const history = useHistory();
  // console.log('confirm button history: ', history)
  const data = props.selectedRows;
  const [updateClick] = useMutation(UPDATE_CLICK);
  const [loadingxx, setLoadingxx] = useState(false);
  // 前端通过loading状态拦截
  const start = async () => {
    setLoadingxx(true);

    const params = data;
    // 多只
    const codearr = params.map(v => v.code);
    const codes = JSON.stringify(codearr);
    const res: Response = await fetch(`${ADDRESS}/newclickcode/${codes}`);
    const newfund = await res.json();

    params.forEach(v => {
      const code = v.code;
      const name = v.name;
      updateClick({ variables: { code, name } });
    });

    if (newfund.length > 0) {
      // console.log('开始抓取详情');
      await fetch(`${ADDRESS}/addDetails/${codes}`);
      // console.log('抓取净值');
      await fetch(`${ADDRESS}/addValues/${codes}`);
      setLoadingxx(false);
    } else {
      // console.warn('不需要重复抓取');
      setLoadingxx(false);
      props.onConfirmClick && props.onConfirmClick();
      params.length === 1 && history.push(`/detail/${codes}/false`);
      params.length > 1 && history.push(`/compare/${codes}/false`);
    }

  };
  const hasSelected = data.length > 0;

  return (
    <div style={{ marginBottom: 16 }}>
      <Button key="submit" type="primary" onClick={start} disabled={!hasSelected} loading={loadingxx}>
        {data.length > 1 ? '查看对比' : '查看详情'}
      </Button>
      <span style={{ marginLeft: 8 }}>
        {hasSelected ? `选中 ${data.length} 条数据。` : ''}
        {loadingxx ? '新数据，正在获取，请稍后...' : ''}
      </span>
    </div>
  );
}
export default SelectConfirmButton;
