import { Link, useLocation } from 'react-router-dom';
import 'antd/dist/antd';
import { Row, Col, Menu } from 'antd';
import HeaderSearch from '../HeaderSearch';

const Header = () => {
  const location = useLocation();
  const defaultSelectedKey = location.pathname;

  return (
    <Row justify="center">
      <Col span={8}>
        <Menu theme="light" mode="horizontal" selectedKeys={[location.pathname]} defaultSelectedKeys={[defaultSelectedKey]} >
          <Menu.Item key="/"><Link to="/">主页</Link></Menu.Item>
          {
            location.pathname.split('/')[1] === 'detail'
            && <Menu.Item key={location.pathname}><Link to={location.pathname}>详情页</Link></Menu.Item>
          }
          {
            location.pathname.split('/')[1] === 'compare'
            && <Menu.Item key={location.pathname}><Link to={location.pathname}>对比页</Link></Menu.Item>
          }
        </Menu>
      </Col>
      <Col span={8}>
      </Col>
      <Col span={8}>
        <HeaderSearch />
      </Col>
    </Row>
  );
}
export default Header;
