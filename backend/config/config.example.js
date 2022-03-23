'use strict';

/** app info */
module.exports = () => {
  const config = {};
  config.onerror = {
    onerror: {
      all(err, ctx) {
        // 在此处定义针对所有响应类型的错误处理方法
        // 注意，定义了 config.all 之后，其他错误处理方法不会再生效
        ctx.body = 'error';
        ctx.status = 500;
      },
      html(err, ctx) {
        // html hander
        ctx.body = '<h3>error</h3>';
        ctx.status = 500;
      },
      json(err, ctx) {
        // json hander
        ctx.body = { message: 'error' };
        ctx.status = 500;
      },
      jsonp(err) {
        // 一般来说，不需要特殊针对 jsonp 进行错误定义，jsonp 的错误处理会自动调用 json 错误处理，并包装成 jsonp 的响应格式
      },
    },
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = '';

  // 请修改jwt密钥和失效时间
  config.login = {
    secretKey: '', // jwt密钥
    expires: 60 * 60 * 24, // 超时时间24小时
    username: '',
    password: '',
  };
  config.sequelize = {
    dialect: 'mysql',
    hostname: '',
    host: '',
    port: 3306,
    database: '',
    username: '',
    password: '',
    pool: {
      max: 3, // 连接池最大连接数量
      min: 1, // 连接池最小连接数量
      idle: 10000, // 如果一个线程超过10秒钟没有被使用过就释放该线程
    },
    dialectOptions: {
      charset: 'utf8mb4',
      multipleStatements: true,
      ssl: {
        rejectUnauthorized: false,
      },
    },
  };

  // Redis Config
  config.redis = {
    client: {
      port: 6379,
      host: '',
      password: '',
      db: 1,
    },
  };

  // Matataki Api Url
  config.matatakiServer = '';

  // IPFS Config
  config.ipfs_service = {
    site: '',
    host: '',
    port: 5001,
    protocol: 'http',
  };

  // Telegram Config
  config.telegram = {
    botToken: '',
  };


  config.matatakiApiKey = '';

  // Cache Api Config
  config.cacheAPI = {
    uri: '',
    apiToken: '',
  };

  // DingTalk Robot Config
  config.DingTalkRobot = {
    url: '',
    managementPlatform: '',
  };

  config.securityCode = '';

  return config;
};
