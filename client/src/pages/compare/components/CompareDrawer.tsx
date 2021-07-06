import { useState } from 'react';
import { Divider, Drawer } from 'antd';
import './index.css';

const CompareDrawer = () => {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const scrollToBasic = () => {
    const top = 600 + 10;
    console.log(top);
    window.scrollTo({
      left: 0,
      top: top,
      behavior: 'smooth'
    })
  };
  const scrollToManager = () => {
    const top = 600 + 10 + 25 + 232;
    console.log(top);
    window.scrollTo({
      left: 0,
      top: top,
      behavior: 'smooth'
    })
  };
  const scrollToPossessor = () => {
    const top = 600 + 10 + 25 + 232;
    console.log(top);
    window.scrollTo({
      left: 0,
      top: top,
      behavior: 'smooth'
    })
  };
  const scrollToPossess = () => {
    const top = 600 + 10 + 25 + 232;
    console.log(top);
    window.scrollTo({
      left: 0,
      top: top,
      behavior: 'smooth'
    })
  };
  return (
    <>
      <div className="compare-drawer-btn" onClick={showDrawer}>
        目录
      </div>
      <Drawer
        title="对比目录"
        placement="left"
        closable={true}
        onClose={onClose}
        visible={visible}
      >
        <p onClick={() => window.scrollTo({ left: 0, top: 0, behavior: 'smooth' })}>收益走势图</p>
        <Divider ></Divider>

        <p onClick={scrollToBasic}>基本信息</p>
        <Divider ></Divider>

        <p onClick={scrollToManager}>基金经理</p>
        <Divider ></Divider>

        <p onClick={scrollToPossessor}>持有人结构</p>
        <Divider ></Divider>

        <p onClick={scrollToPossess}>投资组合</p>
        <Divider ></Divider>

      </Drawer>
    </>
  );
};
export default CompareDrawer;