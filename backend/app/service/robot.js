'use strict';
const Service = require('egg').Service;
const _ = require('lodash');
const axios = require('axios').default;

class RobotService extends Service {
  async pushToDingTalk({ text }) {
    try {
      const access_token = this.config.DingTalkRobot.managementPlatform;
      if (!access_token) {
        this.logger.error("You don't have such a dingtalk bot in config.");
      }
      const data = {
        msgtype: 'text',
        text: {
          content: text,
        },
      };
      await axios.post(this.config.DingTalkRobot.url, data, {
        headers: { 'Content-Type': 'application/json' },
        params: { access_token },
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  // token 申请提醒
  async tokenApplication() {
    const { ctx, app } = this;

    try {
      // 获取所有正在申请的token
      const sqlQueue = 'SELECT * FROM minetokens_application WHERE `status` = 2;';
      const [ resultQueue ] = await ctx.model.query(sqlQueue);
      this.logger.info('resultQueue', resultQueue);

      // 生成队列
      const queue = [];
      resultQueue.forEach(i => {
        queue.push(`tokenApplication:${i.id}-${i.uid}`);
      });
      this.logger.info('queue', queue);

      // 从Redis获取信息
      let count = 0;
      for (let i = 0; i < queue.length; i++) {
        const res = await app.redis.get(queue[i]);
        this.logger.info('res', res);
        if (_.isEmpty(res)) {
          count++;
          // 12h
          await app.redis.set(queue[i], Date.now(), 'EX', 43200);
        } else {
          //
        }
      }
      if (count > 0) {
        const title = `【发币审核】提醒：目前有${resultQueue.length}条未处理 (测试网)`;
        const { management, portal } = this.config.website;
        const rows = resultQueue.map(application => `- ${application.name} (${application.symbol}) [申请人主页](${portal}/user/${application.uid})`);
        let text = [ ...rows, `- 点击 👉  [进入管理后台](${management}/#/minetoken/list) 或者复制链接`, `${management}/#/minetoken/list` ].join('\n');
        // text += `\n [进入管理后台](${management}/#/minetoken/list) \n`;
        const btns = [
          {
            title: '进入管理后台 ↗️',
            actionURL: `${management}/#/minetoken/list`,
          },
        ];
        await this.pushActionCardToDingTalk({ title, text, btns });
        // this.logger.info(text);
      }
    } catch (e) {
      this.logger.error('error', e);
    }
  }

  async pushActionCardToDingTalk({ title, text = '', btns = [] }) {
    try {
      const access_token = this.config.DingTalkRobot.managementPlatform;
      if (!access_token) {
        this.logger.error("You don't have such a dingtalk bot in config.");
      }
      const data = {
        msgtype: 'actionCard',
        actionCard: {
          title,
          text: `# ${title}
${text}`,
          hideAvatar: '0',
          btnOrientation: '0',
          btns,
        },
      };
      const res = await axios.post(this.config.DingTalkRobot.url, data, {
        headers: { 'Content-Type': 'application/json' },
        params: { access_token },
      });
      this.logger.info('res', res);
    } catch (e) {
      this.logger.error(e);
    }
  }
}

module.exports = RobotService;
