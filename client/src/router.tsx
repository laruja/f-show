import { Switch, Route } from "react-router-dom";
import Home from './pages/home';
import Detail from './pages/detail';
import Compare from './pages/compare';

const Routes = () => {
  return (
    <Switch>
      {/*hook之后 推荐使用子组件方式 https://reactrouter.com/web/api/Route/route-render-methods*/}
      <Route exact path="/"><Home /></Route>
      <Route exact path="/detail/:code/:isnew"><Detail /></Route>
      <Route exact path="/compare/:code/:hasnew"><Compare /></Route>
    </Switch>
  )
};
export default Routes;