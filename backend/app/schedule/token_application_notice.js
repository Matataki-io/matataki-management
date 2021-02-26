'use strict';

const Subscription = require('egg').Subscription;

// 任务领取奖励 定时执行转账
class TokenApplication extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '5m',
      type: 'worker',
      // disable: true,
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    this.ctx.service.robot.tokenApplication();
  }
}

module.exports = TokenApplication;
