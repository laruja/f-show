import './index.css';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import Routes from './router';
import App from './app';

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache
} from '@apollo/client';

// 默认为当前域名
// const serverDomain = '';
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: 'http://localhost:4000/graphql',
  // uri: `${serverDomain}/graphql` //http://localhost:3000/graphql
});

ReactDOM.render(
  // <React.StrictMode>
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App>
        <Routes />
      </App>
    </ApolloProvider>
  </BrowserRouter>
  // </React.StrictMode>
  ,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
