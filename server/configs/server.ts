const mongoDBHost =
  process.env.NODE_ENV === "docker"
    ? 'mongodb://database/test'
    : 'mongodb://localhost/testfund';
// mongodb://localhost:27017/testfund
const IP = 'localhost';
export const ADDRESS =
  process.env.NODE_ENV === "docker" ?
    ''
    : `http://localhost`;
// : `http://localhost:6673/v1`;
export const PYDIR =
  '/Users/lrj/Desktop/实践项目/个人实践/fund-show/av4/schedule';

export default {
  serverPort: 8082,
  IP: IP,
  databaseUrl: mongoDBHost
}
