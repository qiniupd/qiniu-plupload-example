七牛Plupload上传Demo

======================


一个基于 [七牛云存储](http://www.qiniu.com/) 及[Plupload](http://plupload.com/) 开发的上传Demo。
示例网站：[七牛Plupload上传Demo](http://plupload-demo.u.qiniudn.com/)

##依赖

1、Plupload 2.0.0 

2、jQuery 1.9.1

## 安装和运行程序

1. 获取源代码：
    `git clone git@github.com:qiniudemo/qiniu-plupload-example.git`

2. 编辑 `qiniu.js` 文件，修改其中字段 `multipart_params.token` 为自己的uploadToken值(Line 61)。uploadToken可以通过访问[http://qtestbucket.qiniudn.com/demo/index.html) 获取生成。

3. 用任何的服务端语言启动网站，选择上传的文件后即可自动向对应的七牛空间上传文件。

## 说明

1. 本示例仅为了简单演示如何使用Plupload上传文件至七牛，并未引入服务端程序，所以在前端初始化了token值。实际生产环境中，token参数的构建应由服务端完成。

2. 如果您想了解更多七牛的上传策略，建议您仔细阅读七牛的官方文档
- [七牛官方文档-资源上传](http://docs.qiniu.com/api/v6/put.html#uploadToken)
