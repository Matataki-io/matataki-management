/* eslint-disable no-bitwise */
'use strict';
const Service = require('egg').Service;
const SHA256 = require('crypto-js/sha256');
const moment = require('moment');
const axios = require('axios');

class IndieService extends Service {
  async IndieUserList(offset, limit, searchParams = null) {
    const { ctx } = this;
    const result = {};

    if (ctx.helper.isNull(searchParams)) {
      result.count = await ctx.model.Github.count();
      result.rows = await ctx.model.Github.findAll({
        order: [[ 'id', 'DESC' ]], offset, limit,
        attributes: {
          exclude: [ 'access_token' ],
        },
      });
    } else {
      for (const propName in searchParams) {
        if (searchParams[propName] === null || searchParams[propName] === '') {
          // 去掉value为空的字段
          delete searchParams[propName];
        } 
        // else if ([ 'username', 'nickname' ].indexOf(propName) >= 0) {
        //   // username、nickname 改为like
        //   searchParams[propName] = { [this.app.Sequelize.Op.like]: `%${searchParams[propName]}%` };
        // } else if (propName === 'isMint') {
        //   delete searchParams[propName];
        //   searchParams.status = this.app.Sequelize.where(this.app.Sequelize.literal('status & 2'), 2);
        // } else if (propName === 'no_captcha') {
        //   searchParams[propName] = Number(JSON.parse(searchParams[propName]));
        // }
      }

      result.count = await ctx.model.Github.count({ where: searchParams });
      result.rows = await ctx.model.Github.findAll({
        where: searchParams,
        order: [[ 'id', 'DESC' ]],
        offset,
        limit,
        attributes: {
          exclude: [ 'access_token' ],
        },
      });
    }
    return result;
  }

  async userList(page = 1, pagesize = 10) {
    // ?
    const userInfo = await this.ctx.model.query(
      `SELECT COUNT(1) AS count FROM github;
      SELECT github.id AS id_g, github.uid AS uid_g, github.article_repo,
      users.username, users.platform AS platform_u, users.nickname, users.last_login_time,
      user_accounts.account, user_accounts.platform AS platform_ua
      FROM github
      LEFT JOIN users ON users.id = github.uid
      LEFT JOIN user_accounts ON user_accounts.uid = users.id AND user_accounts.platform = 'github'
      ORDER BY github.id
      LIMIT :start, :end;`,
      {
        raw: true,
        replacements: {
          start: (page - 1) * pagesize,
          end: pagesize,
        },
      });
    return {
      code: 0,
      data: {
        list: userInfo[0][1],
        count: userInfo[0][0][0].count,
      }
    };
  }

  async setIndieConfig(uid = null, settingParams = null) {
    const ctx = this.ctx;
    this.logger.info("IndieService:: setIndieConfig loaded for ", uid, settingParams);
    if (!uid) {
      this.logger.info("IndieService:: aborted due to invalid uid");
      return {
        code: 1,
        data: null
      }
    }

    if (ctx.helper.isNull(settingParams)) {
      this.logger.info("IndieService:: settingParams nothing to change...");
      return {
        code: 0,
        data: { 
          useableRows: 0,
          changedRows: 0
        }
      }
    }

    const update_rows = {};
    const useableParams = {'repo': 'article_repo', 'siteStatus': 'site_status'};
    const options = {
      where: {
        uid
      }
    }

    for (let everySetting in settingParams) {
      if (useableParams[everySetting] !== undefined) {
        // 此处的设置可以为0，或空字符，不严查
        if ((settingParams[everySetting] !== null) && (settingParams[everySetting] !== undefined)) {
          update_rows[useableParams[everySetting]] = settingParams[everySetting];
        }
      }
    }

    if (ctx.helper.isNull(update_rows)) {
      this.logger.info("IndieService:: update_rows nothing to change...");
      return {
        code: 0,
        data: { 
          useableRows: 0,
          changedRows: 0
        }
      }
    }

    this.logger.info("IndieService:: setIndieConfig will change ", uid, update_rows);
    // console.log(options);

    let updateSettings = null;
    try {
      updateSettings = await ctx.model.Github.update(update_rows, options);
    } catch (err) {
      this.logger.error(err);
      return {
        code: 2,
        data: null
      }
    }
    this.logger.info("IndieService:: setIndieConfig changed ", uid, updateSettings);

    return {
      code: 0,
      data: { 
        useableRows: 1,
        changedRows: updateSettings[0] 
      }
    }
  }
}

module.exports = IndieService;