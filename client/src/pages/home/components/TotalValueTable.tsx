import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useState, useEffect, Key } from 'react';
import { Select, Row, Col, DatePicker, Space } from 'antd';
import SelectConfirmButton from '../../../components/Button';
import moment from 'moment';
import { gql, useQuery } from '@apollo/client';
import { FundValue, FundTableValue } from '../../../models/fund';

const { Option } = Select;

const dateFormat = 'YYYY-MM-DD';
// server--schema对应
export const GET_FUND_VALUES = gql`
  query DaliyValue($type: String!) {
    fundsDaliyValue(type: $type) {
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

const TotalValueTable = () => {
  const disday = (() => {
    //计算今天是这周第几天 周一到周五：1-7
    const weekOfday = moment().format('E');
    switch (weekOfday) {
      case '1':
        return moment().subtract(3, 'days');
      case '7':
        return moment().subtract(2, 'days');
      default:// 2 3 4 5 6
        return moment().subtract(1, 'days');
    }
  })();

  const [typeValue, setTypeValue] = useState('6020-6010');
  const [dateValue, setDateValue] = useState(disday.format('YYYY-MM-DD'));

  const { loading, error, data, refetch } = useQuery(GET_FUND_VALUES, {
    variables: { type: typeValue, date: dateValue }
  });
  const [searchResult, setSearchResult] = useState<FundTableValue[]>([]);

  useEffect(() => {
    setSearchResult(() => {
      const res = data && data.fundsDaliyValue && data.fundsDaliyValue.filter((v: FundValue) => v.shareNetValue !== undefined).map((v: FundValue) => {
        return {
          _id: v._id,
          code: v.code,
          shortName: v.shortName,
          valuationDate: v.valuationDate,
          shareNetValue: v.shareNetValue || '-',
          totalNetValue: v.totalNetValue || '-',
          type: v.type.name,
          gainPer: v.gainPer || '-',
          yearSevenDayYieldRate: v.yearSevenDayYieldRate || '-',
          yearSevenDayYieldRatePercent: v.yearSevenDayYieldRatePercent || '-',
        }
      });
      // console.log('🦆searchResult ', res);
      return res
    });
  }, [data]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<FundTableValue[]>([]);

  const FundTable = () => {
    const columeType1 = ['6020-6010', '6020-6040', '6020-6030', '6020-6050', '6020-6060']
    const columns1: ColumnsType<FundTableValue> = [
      {
        key: 'valuationDate',
        title: '日期',
        dataIndex: 'valuationDate',
        width: 100,
      },
      {
        key: 'code',
        title: '代码',
        dataIndex: 'code',
        width: 100,
      },
      {
        key: 'type',
        title: '类型',
        dataIndex: 'type',
        width: 100,
      },
      {
        key: 'shortName',
        title: '基金名称',
        dataIndex: 'shortName',
        width: 150,
      },
      {
        key: 'shareNetValue',
        title: '单位净值',
        dataIndex: 'shareNetValue',
        width: 100,
        defaultSortOrder: 'descend',
        sorter: (a, b) => Number(a.shareNetValue) - Number(b.shareNetValue),
      },
      {
        key: 'totalNetValue',
        title: '累计净值',
        dataIndex: 'totalNetValue',
        width: 100,
      }
    ];
    const columns2: ColumnsType<FundTableValue> = [
      {
        key: 'valuationDate',
        title: '日期',
        dataIndex: 'valuationDate',
        width: 100,
      },
      {
        key: 'code',
        title: '代码',
        dataIndex: 'code',
        width: 100,
      },
      {
        key: 'type',
        title: '类型',
        dataIndex: 'type',
        width: 100,
      },
      {
        key: 'shortName',
        title: '基金名称',
        dataIndex: 'shortName',
        width: 150,
      },
      {
        key: 'gainPer',
        title: '每万份基金已实现收益',
        dataIndex: 'gainPer',
        width: 100,
        defaultSortOrder: 'descend',
        sorter: (a, b) => Number(a.gainPer) - Number(b.gainPer),
      },
      {
        key: 'yearSevenDayYieldRatePercent',
        title: '7日年化收益率',
        dataIndex: 'yearSevenDayYieldRatePercent',
        width: 100,
        defaultSortOrder: 'descend',
        sorter: (a, b) => Number(a.yearSevenDayYieldRatePercent?.split('%')[0]) - Number(b.yearSevenDayYieldRatePercent?.split('%')[0]),
      },
      {
        key: 'shareNetValue',
        title: '单位净值',
        dataIndex: 'shareNetValue',
        width: 100,
        defaultSortOrder: 'descend',
        sorter: (a, b) => Number(a.shareNetValue) - Number(b.shareNetValue),
      },
      {
        key: 'totalNetValue',
        title: '累计净值',
        dataIndex: 'totalNetValue',
        width: 100,
      },
    ];
    if (loading) {
      return (<h1>loading...</h1>);
    }
    if (error) {
      return (<h1>error...</h1>);
    }
    const onSelectChange = (selectedRowKeys: Key[], selected: FundTableValue[]) => {
      // console.log('当前选中所有列表: ', selected);
      if (selected.length > 3) {
        alert('仅支持3条对比');
        return;
      }
      setSelectedRows(selected);
      setSelectedRowKeys(selectedRowKeys);
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
      hideSelectAll: true,
      checkStrictly: true
    };

    return (
      <>
        <SelectConfirmButton
          selectedRows={selectedRows.map(v => {
            return { code: v.code, name: v.shortName }
          })} />
        <Table<FundTableValue>
          rowSelection={rowSelection}
          rowKey={searchResult => searchResult._id}
          columns={columeType1.includes(typeValue) ? columns1 : columns2}
          dataSource={searchResult}
        />
      </>
    );
  }
  return (
    <>
      <Row   >
        <Col flex={2}>
          <Select defaultValue='6020-6010' style={{ width: 200 }}
            onChange={
              (value) => {
                setTypeValue(value);
                refetch({ type: value, date: dateValue });
              }
            }>
            <Option value="6020-6010">股票型</Option>
            <Option value="6020-6040">混合型</Option>
            <Option value="6020-6030">债券型</Option>
            <Option value="6020-6050">QDII型</Option>
            <Option value="6020-6020">货币型</Option>
            <Option value="6020-6060">短期理财债券型</Option>
          </Select>
        </Col>
        <Col flex={0} style={{ float: 'right' }}>
          <Space direction="vertical" size={12}>
            <DatePicker defaultValue={disday} format={dateFormat} disabled
              onChange={
                (date, dateString) => {
                  setDateValue(dateString);
                  refetch({ type: typeValue, date: dateValue });
                }
              } />
          </Space>
        </Col>
      </Row>
      <FundTable />
    </>
  );
}


export default TotalValueTable;
