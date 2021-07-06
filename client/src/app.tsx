import { Layout } from 'antd';
import Header from './components/Header';

const App: React.FC = ({ children }) => {
  return (
    <Layout>
      <Layout.Header>
        <Header />
      </Layout.Header>
      {children}
      <Layout.Footer style={{ textAlign: 'center' }}>Fund ©2021 Created by lrj</Layout.Footer>
    </Layout>
  );
}
export default App;