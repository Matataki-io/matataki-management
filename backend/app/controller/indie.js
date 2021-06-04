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
    let { pageSize = 10, pageIndex = 1, uid = null } = ctx.query;
    pageSize = parseInt(pageSize);
    pageIndex = parseInt(pageIndex);
    uid = parseInt(uid);
    const result = await ctx.service.indie.userList(pageIndex, pageSize, uid);
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

  async readRepoFile() {
    const ctx = this.ctx;
    let { 
      uid = null,
      path = null,
      branch = 'source'
    } = ctx.query; 

    uid = parseInt(uid);
    if (!uid || !path || !branch) {
      this.logger.info("IndieController:: readRepoFile aborted due to invalid params");
      ctx.body = ctx.msg.paramsError;
      return;
    }

    const result = await this.service.indie.readRepoFile(uid, path, branch);

    switch (result.code) {
      case 0:
        ctx.body = ctx.msg.success;
        ctx.body.data = result.data;
        return;
      case 1:
        ctx.body = ctx.msg.userNotExist;
        return;
      case 2:
        ctx.body = ctx.msg.dataCriticalError;
        return;
      case 3:
        ctx.body = ctx.msg.dataError;
        return;
      case 4:
        ctx.body = ctx.msg.innerError;
        return;
      default:
        ctx.body = ctx.msg.failure;
    }

  }

  async writeRepoFile() {
    const ctx = this.ctx;
    let { 
      uid = null,
      path = null,
      branch = 'source'
    } = ctx.query; 
    let { 
      content = null,
      originHash = null
    } = ctx.request.body; 

    uid = parseInt(uid);
    if (!uid || !path || !branch) {
      this.logger.info("IndieController:: writeRepoFile aborted due to invalid params");
      ctx.body = ctx.msg.paramsError;
      return;
    }

    if ((content === null) || (content === undefined)) {
      this.logger.info("IndieController:: writeRepoFile aborted due to invalid params");
      ctx.body = ctx.msg.paramsError;
      return;
    }

    const result = await this.service.indie.writeRepoFile(uid, path, content, originHash, branch);

    switch (result.code) {
      case 0:
        ctx.body = ctx.msg.success;
        return;
      case 1:
        ctx.body = ctx.msg.userNotExist;
        return;
      case 2:
        ctx.body = ctx.msg.dataError;
        return;
      case 3:
        ctx.body = ctx.msg.networkError;
        return;
      default:
        ctx.body = ctx.msg.failure;
    }
  }
}

module.exports = IndieController;