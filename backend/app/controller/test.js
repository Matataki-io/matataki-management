'use strict';

const Controller = require('egg').Controller;
class TestController extends Controller {
  async test() {
    const { ctx } = this;
    await ctx.service.robot.tokenApplication();
    ctx.body = ctx.msg.success;
  }
}
module.exports = TestController;
