'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const passport = app.middleware.passport();
  const { router, controller } = app;

  router.get('/', controller.home.index);
  // 账号管理
  router.resources('account', '/api/account', passport, controller.account);
  // 用户管理
  router.resources('user', '/api/user', passport, controller.user);
  // 搜索用户
  router.get('/api/search/user', passport, controller.user.search);
  // 信息推送
  router.post('/api/message/telegram/md', passport, controller.telegrambot.sendMessageMarkdown);
  router.post('/api/message/telegram/html', passport, controller.telegrambot.sendMessageHtml);
  router.post('/api/boardcast/telegram/md', passport, controller.telegrambot.boardcastMessageMarkdown);
  router.post('/api/boardcast/telegram/html', passport, controller.telegrambot.boardcastMessageHtml);
  router.get('/api/getAllTelegramBindedUser', passport, controller.telegrambot.getAllTelegramBindedUser);
  // 文章管理
  router.resources('posts', '/api/post', passport, controller.posts);
  // ipfs
  router.get('/api/ipfs/:hash', passport, controller.posts.ipfs);
  // 登录test
  router.post('/api/login', controller.login.login);
  // 添加管理员
  router.post('/api/admin/addUser', passport, controller.admin.addUser);
  router.patch('/api/admin/edit', passport, controller.admin.edit);
  router.get('/api/admin', passport, controller.admin.list);
  router.get('/api/admin/me', passport, controller.admin.getMe);
  // 公告
  router.get('/api/announcement', passport, controller.announcement.index);
  router.post('/api/announcement', passport, controller.announcement.post);
  // 定向公告
  router.post('/api/announcement/targeted', passport, controller.announcement.targetedPost);
  router.delete('/api/announcement/:id', passport, controller.announcement.delete);

  // Logging
  router.get('/api/logs', passport, controller.logging.index);

  // fan票申请管理
  router.get('/api/minetoken_application', passport, controller.minetokenApplication.list);
  router.post('/api/minetoken_application', passport, controller.minetokenApplication.modify);
  // 同意申请
  router.post('/api/minetoken_application_agree', passport, controller.minetokenApplication.agree);
  router.get('/api/minetoken_application_survey', passport, controller.minetokenApplication.surveyList);
  router.get('/api/minetoken_application_survey/:id', passport, controller.minetokenApplication.surveyListId);

  // 获取所有账号信息
  router.get('/api/userAccounts', passport, controller.user.userAccounts);
  // 更新邮箱密码
  router.put('/api/userAccountsUpdatePass', passport, controller.user.userAccountsUpdatePass);
  // 添加邮箱绑定账号
  router.post('/api/userAccountsBindEmail', passport, controller.user.userAccountsBindEmail);


  router.post('/api/test', passport, controller.test.test);

  // 读取子站用户列表19011
  router.get('/api/indie/users', passport, controller.indie.index2);
  // 读取子站repo的某个文件19012
  router.get('/api/indie/file', passport, controller.indie.readRepoFile);
  // 写入用户的子站设置（我方设置）19021
  router.post('/api/indie/setting', passport, controller.indie.setIndie);
  // 写入/创建子站repo的某个文件19022
  router.post('/api/indie/file', passport, controller.indie.writeRepoFile);
};
