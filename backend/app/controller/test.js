'use strict';

const Controller = require('egg').Controller;
class TestController extends Controller {
  async test() {
    const { ctx } = this;
    // await ctx.service.robot.tokenApplication();
    // await this.ctx.service.minetokenApplication.agreeCreate();
    await this.ctx.service.minetokenApplication.agree({ uid: 1248 });

    ctx.body = ctx.msg.success;
  }
}
module.exports = TestController;
