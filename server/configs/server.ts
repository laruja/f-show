const mongoDBHost =
  process.env.NODE_ENV === "docker"
    ? 'mongodb://database/test'
    : 'mongodb://localhost/testfund';
const IP = 'localhost';
export const ADDRESS =
  process.env.NODE_ENV === "docker" ?
    ''
    : `http://localhost`;
// : `http://localhost:6673/v1`;
export const PYDIR = './tasks';

export default {
  serverPort: 8082,
  IP: IP,
  databaseUrl: mongoDBHost
}
