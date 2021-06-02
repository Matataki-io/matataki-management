'use strict';

const Controller = require('egg').Controller;

class IndieController extends Controller {
  // 列表，GET
  async index() {
    const { ctx } = this;
    let { pageSize = 10, pageIndex = 1, ...searchParams } = ctx.query;
    pageSize = parseInt(pageSize);
    pageIndex = parseInt(pageIndex);
    const result = await ctx.service.indie.IndieUserList((pageIndex - 1) * pageSize, pageSize, searchParams);
    ctx.body = {
      ...ctx.msg.success,
      data: result,
    };
  }

  async index2() {
    const ctx = this.ctx;
    let { pageSize = 10, pageIndex = 1 } = ctx.query;
    pageSize = parseInt(pageSize);
    pageIndex = parseInt(pageIndex);
    const result = await ctx.service.indie.userList(pageIndex, pageSize);
    switch (result.code) {
      case 0:
        ctx.body = ctx.msg.success;
        ctx.body.data = result.data;
        return;
      default:
        ctx.body = ctx.msg.failure;
    }

  }

  async setIndie() {
    const ctx = this.ctx;
    let { uid = null, ...settingParams } = ctx.request.body;
    uid = parseInt(uid);
    const result = await ctx.service.indie.setIndieConfig(uid, settingParams);
    switch (result.code) {
      case 0:
        ctx.body = ctx.msg.success;
        ctx.body.data = result.data;
        return;
      case 1:
        ctx.body = ctx.msg.paramsError;
        ctx.body.data = 'iu1';
        return;
      case 2:
        ctx.body = ctx.msg.innerError;
        ctx.body.data = 'iu2';
        return;
      default:
        ctx.body = ctx.msg.failure;
    }
  }
}

module.exports = IndieController;