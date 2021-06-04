


## 子站管理相关API

### 读取

#### 读取子站用户列表 19011

- GET /api/indie/users
- Authorization：必须
- url参数：pageSize：每页的分页数，可选；pageIndex：该分页数下的页码（第几页），可选；uid：指定用户的uid，可选；

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
#### 读取用户文件以供编辑 19012

- GET /api/indie/file
- Authorization：必须
- url参数：uid: 用户id, 必须; path: 文件相对路径, 必须; branch: 文件所在分支, 可选 默认为source;
  ※ 备注1：path路径来自repo根目录下的相对路径，开头没有斜杠。如根目录下package.json，填入路径即为package.json，
  文件夹中文章，如source/_posts/2021/05/Gh20210501.md。
  ※ 备注2：url中path参数应该做一个url encode，生成形如source%2F_posts%2F2021%2F05%2FGh20210501.md的值，防止产生误判。
  ※ 备注3：保存hash作为后面请求的参数
  ※ 备注4：hash非敏感数据，可公开。其依文件内容而定。可见https://stackoverflow.com/questions/20207594/how-to-find-a-github-file-s-sha-blob

- 正常状态码：200
- 返回数据data：
```json
{
    "code": 0,
    "message": "成功",
    "data": {
        "content": "content-0123",
        "hash": "356a192b7913b04c54574d18c28d46e6395428ab"
    }
}
```

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

#### 编辑或创建用户的子站文件 19022

- POST /api/indie/file
- Authorization：必须
- url参数：uid: 用户id, 必须; path: 文件相对路径, 必须; branch: 文件所在分支, 可选 默认为source;
- body参数：content: 文章内容, 必须; originHash: 文件相对路径, 可选;
  ※ 备注1：path路径来自repo根目录下的相对路径，开头没有斜杠。如根目录下package.json，填入路径即为package.json，
  文件夹中文章，如source/_posts/2021/05/Gh20210501.md。
  ※ 备注2：url中path参数应该做一个url encode，生成形如source%2F_posts%2F2021%2F05%2FGh20210501.md的值，防止产生误判。

  ※ 备注3：content文本内容必须，但是可以为空字符串，编辑后文章内容会为空。
  ※ 备注4：originHash可选，有则为编辑文章所用，无则为创建文章所用

- 正常状态码：200
- 返回数据data：
```json
{
    "code": 0,
    "message": "成功"
}
```