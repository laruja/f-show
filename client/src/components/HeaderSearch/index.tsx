import './index.css';

import { useState, useMemo, useRef } from 'react';
import { Modal, Button, Select, Spin } from 'antd';
import { SelectProps } from 'antd/es/select';
import SelectConfirmButton from '../Button';

import debounce from 'lodash/debounce';

import { ADDRESS } from '../../configs/client';
import { FundType } from '../../models/fund';

type Fund = {
  id: string
  code: string
  name: string
  type: {
    code: string
    name: string
  }
}


export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}

function DebounceSelect<
  ValueType extends { key?: string; label: React.ReactNode; value: string | number; type: FundType } = any
>({ fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<ValueType[]>([]);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then(newOptions => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        console.log('newOptions', newOptions);
        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select<ValueType>
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
    />
  );
}

// Usage of DebounceSelect
type SelectValue = {
  label: string;
  value: string;
}

const fetchFundList = async (code: string): Promise<Fund[]> => {
  console.log('🍎，模糊查找 code  ', typeof code, code);
  if (code === ' ' || new RegExp("^[ ]+$").test(code)) return [];
  // 模糊查找
  const resp: Response = await fetch(`${ADDRESS}/searchFund/${code}`);
  const list = await resp.json();
  console.log('🍎，模糊查找 ', list)

  return list.map(
    (v: { _id: string, code: string[], shortName: string[], type: [{ code: string, name: string }] }) => ({
      key: v._id,
      label: `${v.code} ${v.shortName}`,
      value: v.code,
      type: v.type
    })
  );
}

const FundSearch = () => {
  const [select, setSelect] = useState<SelectValue[]>([]);
  const [visible, setVisible] = useState(false);
  const showModal = () => {
    setVisible(true);
  };
  const handleCancel = () => {
    setVisible(false);
  };
  return (
    <>
      <Button className="search" onClick={showModal}>
        <span style={{ float: 'left' }}>搜一搜</span> 🔍
      </Button>
      <Modal
        visible={visible}
        title=" "
        onCancel={handleCancel}
        footer={
          <SelectConfirmButton
            onConfirmClick={handleCancel}
            selectedRows={select.map(v => {
              return { code: v.value, name: v.label.split(' ')[1] }
            })} />
        }
      >
        <DebounceSelect
          mode="multiple"
          value={select}
          placeholder="选择基金"
          fetchOptions={fetchFundList}
          onChange={newValue => {
            console.log(newValue);
            if (newValue.length > 3) {
              alert('不要超过3条');
              return;
            }
            setSelect(newValue);
          }}
          style={{ width: '100%' }}
        />
      </Modal>
    </>
  );
};
export default FundSearch;