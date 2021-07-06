/* eslint-disable no-console */
import mongoose from 'mongoose';
import config from '../configs/server';
import log4js from 'log4js';
const logger = log4js.getLogger('globallog');

let connectTimeOut: NodeJS.Timeout;

const DBHelper = {
  connectTimes: 8,
  connect(): mongoose.Mongoose {
    if (process.env.NODE_ENV !== 'test') {
      DBHelper.mongooseConnect();
    }

    const db = mongoose.connection;
    db.once('error', (err) => {
      console.error('🥭连接 mongodb 失败。');
      connectTimeOut = setInterval(() => {
        if (DBHelper.connectTimes > 0) {
          console.log(`🥭正在重连 mongodb，剩余次数 ${DBHelper.connectTimes}。`);
          DBHelper.connectTimes -= 1;
          DBHelper.mongooseConnect();
        } else {
          console.log('🥭重连 mongodb 失败。');
          logger.error(JSON.stringify(err));
          clearTimeout(connectTimeOut);
        }
      }, 8000);
    });
    db.on('open', () => {
      console.log('👏🥭连接 mongodb 成功。');
      clearTimeout(connectTimeOut);
    });
    // 单例模式
    DBHelper.connect = () => {
      return mongoose;
    };
    return mongoose;
  },
  mongooseConnect(): void {
    mongoose.connect(config.databaseUrl, {
      // 弃用警告 https://mongoosejs.com/docs/deprecations.html#-findandmodify-
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  }
};

export default DBHelper;