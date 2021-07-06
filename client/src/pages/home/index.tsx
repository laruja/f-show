import { Suspense } from 'react';
import 'antd/dist/antd.css';
import { Layout } from 'antd';
import TotalValueTable from './components/TotalValueTable';

const App = () => {
  return (
    <Layout.Content className="fund-layout" >
      <div id="container"></div>
      <div className="fund-layout-background">
        <Suspense fallback={null}>
          <TotalValueTable />
        </Suspense>
      </div>
    </Layout.Content>
  );
}

export default App;
