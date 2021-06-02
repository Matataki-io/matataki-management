


## 子站管理相关API

### 读取

#### 读取子站用户列表 19011

- GET /api/indie/users
- Authorization：必须
- url参数：pageSize：每页的分页数，可选；pageIndex：该分页数下的页码（第几页），可选；

- 正常状态码：200
- 返回数据data：
```json
{
    "code": 0,
    "message": "成功",
    "data": {
        "list": [
            {
                "id_g": 2,
                "uid_g": 1390,
                "article_repo": "matataki-save",
                "username": "xiaotiandada",
                "platform_u": "github",
                "nickname": "USER-XUi6HOSOxV",
                "last_login_time": "2021-06-02T05:05:13.000Z",
                "account": "xiaotiandada",
                "platform_ua": "github"
            },
            {
                "id_g": 5,
                "uid_g": 1396,
                "article_repo": "matataki-posts",
                "username": "525582606@qq.com",
                "platform_u": "email",
                "nickname": "LemonNekoTest",
                "last_login_time": "2021-05-25T08:18:02.000Z",
                "account": "LemonNekoGH",
                "platform_ua": "github"
            }
        ],
        "count": 13 // 总共用户数
    }
}
```
#### 读取用户下文章列表 19012

### 写入

#### 写入用户的子站设置（我方设置） 19021

- POST /api/indie/setting
- Authorization：必须
- body参数：uid：用户id，必须；repo：设置子站指向的repo名称，可选；siteStatus：站点状态，可选；

- 正常状态码：200
- 返回数据data：
```json
{
    "code": 0,
    "message": "成功",
    "data": {
        "useableRows": 1, // 参数是否有效，这个可以忽略
        "changedRows": 0 // 实际修改的设置数，这个可以忽略
    }
}
```