'use strict';

// 错误码统一编码，提示信息多语言
module.exports = () => {
  return {
    success: { code: 0, message: '成功' },
    failure: { code: -1, message: '失败' },
    loginFailed: { code: -1, message: '登录失败' },
    regFailedUsername: { code: 114514, message: '注册失败，有重复的用户名' },
    botSendMsgFailed: { code: -1, message: '机器人发送消息失败' },
    updateFailed: { code: -2, message: '更新失败' },
    ipfsCatchFailed: { code: -3, message: 'IPFS获取失败' },
    paramsError: { code: -4, message: '参数错误' },
    innerError: { code: -5, message: '内部错误' },
    dataError: { code: -6, message: '数据错误' },
    dataCriticalError: { code: -7, message: '数据重要错误' },
    userNotExist: { code: -8, message: '用户不存在' },
    requestError: { code: -9, message: '请求错误' },
    networkError: { code: -10, message: '网络错误' },
  };
};
