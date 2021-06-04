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

  async userList(page = 1, pagesize = 10, uid = null) {
    // ?
    let sqlCode = '';
    if (uid) {
      sqlCode = `SELECT COUNT(1) AS count FROM github;
      SELECT github.id AS id_g, github.uid AS uid_g, github.article_repo,
      users.username, users.platform AS platform_u, users.nickname, users.last_login_time,
      user_accounts.account, user_accounts.platform AS platform_ua
      FROM github
      LEFT JOIN users ON users.id = github.uid
      LEFT JOIN user_accounts ON user_accounts.uid = users.id AND user_accounts.platform = 'github'
      WHERE github.uid = :uid
      ORDER BY github.id DESC
      LIMIT :start, :end;`
    } else {
      sqlCode = `SELECT COUNT(1) AS count FROM github;
      SELECT github.id AS id_g, github.uid AS uid_g, github.article_repo,
      users.username, users.platform AS platform_u, users.nickname, users.last_login_time,
      user_accounts.account, user_accounts.platform AS platform_ua
      FROM github
      LEFT JOIN users ON users.id = github.uid
      LEFT JOIN user_accounts ON user_accounts.uid = users.id AND user_accounts.platform = 'github'
      ORDER BY github.id DESC
      LIMIT :start, :end;`
    }
    const userInfo = await this.ctx.model.query(
      sqlCode,
      {
        raw: true,
        replacements: {
          start: (page - 1) * pagesize,
          end: pagesize,
          uid: uid
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


  async readRepoFile(uid, path, branch = 'source') {
    this.logger.info("IndieService:: readRepoFile loaded, ", uid, path, branch);
    // 在controller中以已经验证参数的可靠性，因此service中不再赘验

    const userInfo = await this.app.model.query(
      `SELECT github.uid AS uid_g, github.access_token, github.article_repo,
      users.username, users.platform AS platform_u,
      user_accounts.account, user_accounts.uid AS uid_ua, user_accounts.platform AS platform_ua
      FROM github
      LEFT JOIN users ON users.id = github.uid
      LEFT JOIN user_accounts ON user_accounts.uid = users.id AND user_accounts.platform = 'github'
      WHERE github.uid = :uid;`, 
      {
        raw: true,
        replacements: {
          uid: uid
        },
      });

    if (userInfo.length === 0) {
      this.logger.info('IndieService:: readRepoFile user info not exist, ', uid);
      return {
        code: 1,
        data: null
      };
    }

    const accessToken = userInfo[0][0].access_token;
    const articleRepo = userInfo[0][0].article_repo;
    const userGithubId = userInfo[0][0].account;

    if (!accessToken) {
      this.logger.info('IndieService:: readRepoFile user info(some keys) not exist, ', uid);
      return {
        code: 2,
        data: null
      };
    }

    if (!userGithubId || !articleRepo) {
      this.logger.info('IndieService:: readRepoFile user info(some keys) not exist, ', uid);
      return {
        code: 3,
        data: null
      };
    }

   // judge http status code!
   let readContent = null;
   try {
     readContent = await axios({
       method: 'GET',
       url: `https://api.github.com/repos/${userGithubId}/${articleRepo}/contents/${path}?ref=${branch}`,
       headers: {
         Authorization: 'token ' + accessToken,
         // 'User-Agent':'test.matataki.io' ,
         accept: 'application/vnd.github.v3+json',
       },
     })
    } catch (err) {
      this.logger.error('IndieService:: readRepoFile error', err);
      return {
        code: 4,
        data: null
      };
    }

    const buffer = new Buffer.from(readContent.data.content, 'base64');
    const configYml = buffer.toString();

    return {
        code: 0,
        data: {
          content: configYml,
          hash: readContent.data.sha
        }
      }

  }

  async writeRepoFile(uid, path, content, originHash, branch) {
    this.logger.info("IndieService:: writeRepoFile loaded, ", uid, path, content, originHash, branch);

    const userInfo = await this.app.model.query(
      `SELECT github.uid AS uid_g, github.access_token, github.article_repo,
      users.username, users.platform AS platform_u,
      user_accounts.account, user_accounts.uid AS uid_ua, user_accounts.platform AS platform_ua
      FROM github
      LEFT JOIN users ON users.id = github.uid
      LEFT JOIN user_accounts ON user_accounts.uid = users.id AND user_accounts.platform = 'github'
      WHERE github.uid = :uid;`,
      {
        raw: true,
        replacements: {
          uid: uid
        },
      });

    if (userInfo.length === 0) {
      this.logger.info('IndieService:: writeRepoFile user info not exist, ', uid);
      return {
        code: 1,
        data: null
      };
    }

    const accessToken = userInfo[0][0].access_token;
    const articleRepo = userInfo[0][0].article_repo;
    const userGithubId = userInfo[0][0].account;

    if (!userGithubId || !articleRepo || !accessToken) {
      this.logger.info('IndieService:: writeRepoFile user info(some keys) not exist, ', uid);
      return {
        code: 2,
        data: null
      };
    }

    let buffer2 = new Buffer.from(content);
    const encodedContent = buffer2.toString('Base64');

    let updateConfig = null;
    let request_data = {
      message: 'set config b',
      content: encodedContent,
      branch: branch
    }
    if (originHash) {
      request_data.sha = originHash;
    }
    try {
        updateConfig = await axios({
        method: 'PUT',
        url: `https://api.github.com/repos/${userGithubId}/${articleRepo}/contents/${path}`,
        headers: {
          Authorization: 'token ' + accessToken,
          // 'User-Agent': 'test.matataki.io',
          accept: 'application/vnd.github.v3+json',
        },
        data: request_data
      });
    } catch (err) {
      this.logger.error('IndieService:: writeRepoFile github upload error', err);
      return {
        code: 3,
        data: null
      };
    }

    // if (!(updateConfig.status === 200) || !(updateConfig.statusText === 'OK')) {
    //   this.logger.info('IndieService:: writeRepoFile incorrect status code, failed');
    //   // ctx.body = ctx.msg.failure;
    //   return {
    //     code: 4,
    //     data: null
    //   };
    // }

    this.logger.info('IndieService:: writeRepoFile end', uid);
    return {
      code: 0,
      data: null
    };

  }
}

module.exports = IndieService;