/* eslint-disable no-bitwise */
'use strict';
const Service = require('egg').Service;
const SHA256 = require('crypto-js/sha256');
const moment = require('moment');

class UserService extends Service {
  async list(offset, limit, searchParams = null) {
    const { ctx } = this;
    const result = {};

    // searchParams = {
    //   username: { [this.app.Sequelize.Op.like]: '%aaron%' },
    // };

    if (ctx.helper.isNull(searchParams)) {
      result.count = await ctx.model.Users.count();
      result.rows = await ctx.model.Users.findAll({ order: [[ 'id', 'DESC' ]], offset, limit });
    } else {
      for (const propName in searchParams) {
        if (searchParams[propName] === null || searchParams[propName] === '') {
          // 去掉value为空的字段
          delete searchParams[propName];
        } else if ([ 'username', 'nickname' ].indexOf(propName) >= 0) {
          // username、nickname 改为like
          searchParams[propName] = { [this.app.Sequelize.Op.like]: `%${searchParams[propName]}%` };
        } else if (propName === 'isMint') {
          delete searchParams[propName];
          searchParams.status = this.app.Sequelize.where(this.app.Sequelize.literal('status & 2'), 2);
        }
      }

      result.count = await ctx.model.Users.count({ where: searchParams });
      result.rows = await ctx.model.Users.findAll({
        where: searchParams,
        order: [[ 'id', 'DESC' ]],
        offset,
        limit,
      });
    }
    return result;
  }
  // 设置种子用户 001
  async setSeedPermission(id, permission = true) {
    const { ctx } = this;
    const user = await ctx.model.Users.find({ where: { id } });
    let status;
    if (permission) {
      status = user.status | parseInt('001', 2);
    } else {
      status = user.status & parseInt('110', 2);
    }
    const result = await ctx.model.Users.update({ status }, { where: { id } });
    return result;
  }
  // 设置发币用户 010
  async setMintPermission(id, permission = true) {
    const { ctx } = this;
    const user = await ctx.model.Users.find({ where: { id } });
    let status;
    if (permission) {
      status = user.status | parseInt('010', 2);
    } else {
      status = user.status & parseInt('101', 2);
    }
    const result = await ctx.model.Users.update({ status }, { where: { id } });
    return result;
  }
  // 设置交易权限 100
  async setExchangePermission(id, permission = true) {
    const { ctx } = this;
    const user = await ctx.model.Users.find({ where: { id } });
    let status;
    if (permission) {
      status = user.status | parseInt('100', 2);
    } else {
      status = user.status & parseInt('011', 2);
    }
    const result = await ctx.model.Users.update({ status }, { where: { id } });
    return result;
  }

  async update(id, updates) {
    const result = await this.ctx.model.Users.update(updates, { where: { id } });
    return result;
  }

  async search(pageSize, pageIndex, word) {
    const { ctx } = this;
    const sql = `
      SELECT
        id, username, email, nickname, avatar, introduction
      FROM
        users
      WHERE
        id = :word
        OR username LIKE CONCAT('%',:word,'%')
        OR nickname LIKE CONCAT('%',:word,'%')
      LIMIT
        :offset, :limit;

      SELECT
        count(1) as count
      FROM
        users
      WHERE
        id = :word
        OR username LIKE CONCAT('%',:word,'%')
        OR nickname LIKE CONCAT('%',:word,'%');
    `;
    const result = await ctx.model.query(sql, {
      raw: true,
      replacements: {
        word,
        offset: (pageIndex - 1) * pageSize,
        limit: pageSize,
      },
    });
    return {
      list: result[0][0],
      count: result[0][1][0].count,
    };
  }

  async userAccounts({ uid }) {
    this.logger.info('userAccounts', Date.now());
    const { ctx } = this;
    try {
      const sql = 'SELECT uid, account, platform, is_main FROM user_accounts WHERE uid = :uid;';
      const [ result ] = await ctx.model.query(sql, {
        raw: true,
        replacements: {
          uid,
        },
      });

      this.logger.info('result', result);

      return {
        code: 0,
        data: result,
      };
    } catch (e) {
      this.logger.info('e', e.toString());
      return {
        code: -1,
        message: e.toString(),
      };
    }
  }
  async userAccountsUpdatePass({ uid, password, key }) {
    this.logger.info('userAccountsUpdatePass', Date.now());
    const { ctx } = this;
    const transaction = await this.ctx.model.transaction();
    try {

      if (key !== this.config.securityCode) {
        throw new Error('安全码错误');
      }

      if (!password) {
        throw new Error('not password');
      }
      // 密码校验
      const checkPass = (newPass, oldPass) => {
        if (newPass === oldPass) {
          throw new Error('新密码与旧密码不能相同');
        }
      };
      // sha256 pass
      const pass = SHA256(password).toString();

      // 更新 user_accounts sql
      const sqlUserAccounts = 'SELECT * FROM user_accounts WHERE uid = :uid AND platform = \'email\';';
      const [ resultUserAccounts ] = await ctx.model.query(sqlUserAccounts, {
        raw: true,
        replacements: {
          uid,
        },
      });
      this.logger.info('resultUserAccounts', resultUserAccounts);

      if (resultUserAccounts.length > 0) {
        checkPass(resultUserAccounts[0].password_hash, pass);

        const [ resultUpdatePass ] = await ctx.model.UserAccounts.update({
          password_hash: pass,
        }, {
          where: {
            uid,
            platform: 'email',
          },
          transaction,
        });
        this.logger.info('resultUpdatePass', resultUpdatePass);

        if (resultUpdatePass === 1) {
          //
        } else {
          throw new Error('user_accounts update error');
        }
      }

      // 更新 users sql
      const sqlUsers = 'SELECT * FROM users WHERE id = :uid AND platform = \'email\';';
      const [ resultUsers ] = await ctx.model.query(sqlUsers, {
        raw: true,
        replacements: {
          uid,
        },
      });
      this.logger.info('resultUsers', resultUsers);

      if (resultUsers.length > 0) {
        checkPass(resultUsers[0].password_hash, pass);

        const [ resultUpdatePass ] = await ctx.model.Users.update({
          password_hash: pass,
        }, {
          where: {
            id: uid,
            platform: 'email',
          },
          transaction,
        });
        this.logger.info('resultUpdatePass', resultUpdatePass);

        if (resultUpdatePass === 1) {
          //
        } else {
          throw new Error('users update error');
        }
      }

      await transaction.commit();

      return {
        code: 0,
      };
    } catch (e) {
      this.logger.error('e', e.toString());
      await transaction.rollback();
      return {
        code: -1,
        message: e.toString(),
      };
    }
  }

  async userAccountsBindEmail({ uid, email, password, key }) {
    this.logger.info('userAccountsBindEmail', Date.now(), uid, email, password);

    const { ctx } = this;
    const transaction = await ctx.model.transaction();

    try {

      if (key !== this.config.securityCode) {
        throw new Error('安全码错误');
      }

      // 验证邮箱是否使用过
      const sqlUserAccounts = 'SELECT * FROM users WHERE email = :email OR username = :email OR nickname = :email;';
      const [ resultUserAccounts ] = await ctx.model.query(sqlUserAccounts, {
        raw: true,
        replacements: {
          email,
        },
      });

      console.log('resultUserAccounts', resultUserAccounts);

      if (resultUserAccounts.length > 0) {
        throw new Error('该邮箱已被占用 - users - email/username/nickname');
      }

      const sqlUsers = 'SELECT * FROM user_accounts WHERE account = :email;';
      const [ resultUsers ] = await ctx.model.query(sqlUsers, {
        raw: true,
        replacements: {
          email,
        },
      });

      console.log('resultUsers', resultUsers);

      if (resultUsers.length > 0) {
        throw new Error('该邮箱已被占用 - user_accounts - account');
      }

      // 插入新账号
      // sha256 pass
      const pass = SHA256(password).toString();
      const time = moment().utc().format('YYYY-MM-DD HH:mm:ss');

      const sqlCreate = `INSERT INTO \`user_accounts\` (\`uid\`,\`account\`,\`password_hash\`,\`platform\`,\`is_main\`,\`created_at\`,\`status\`)
      VALUES (:uid,:account,:password_hash,'email',0,:time,1);`;

      const [ resultCreate ] = await ctx.model.query(sqlCreate, {
        raw: true,
        replacements: {
          uid,
          account: email,
          password_hash: pass,
          time,
        },
      }, {
        transaction,
      });
      this.logger.info('resultCreate', resultCreate);

      if (resultCreate) {
        //
      } else {
        throw new Error('user_accounts create error');
      }

      await transaction.commit();

      return {
        code: 0,
      };
    } catch (e) {
      this.logger.error('e', e.toString());
      await transaction.rollback();
      return {
        code: -1,
        message: e.toString(),
      };
    }

  }
}

module.exports = UserService;
