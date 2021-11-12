static-upload  静态资源上传服务 目前支持阿里云oss 七牛云 以及自己本身服务器

使用方法

```javascript
npm i static-upload --save
```

引入依赖

```javascript
const {staticUpload} = require('static-upload')
```

参数说明

**QiniuConfig** 七牛上传配置

| 字段名            | 描述                                           |
| ----------------- | :--------------------------------------------- |
| *accessKey*       | 七牛accessKey                                  |
| *secretKey*       | 七牛secretKey                                  |
| *originPath*      | 需要上传的目录                                 |
| *filterFiles*     | 需要过滤的文件名集合 默认:[],如:['index.html'] |
| *zone*            | 七牛空间地域                                   |
| *bucket*          | 七牛*bucket*                                   |
| *debugFlag*       | 是否开启debug                                  |
| *Filterdirectory* | 需要过滤的文件夹                               |

**aliConfig ** 阿里oss上传配置

| 字段名            | 描述                                           |
| ----------------- | ---------------------------------------------- |
| *region*          | oss *region*                                   |
| *bucket*          | oss *bucket*                                   |
| *bucketPath*      | 需要上传的oss指定目录                          |
| *originPath*      | 本地需要上传的目录                             |
| *filterFiles*     | 需要过滤的文件名集合 默认:[],如:['index.html'] |
| *accessKeyId*     | oss *accessKeyId*                              |
| *accessKeySecret* | oss *accessKeySecret*                          |
| *Filterdirectory* | 需要过滤的文件夹                               |

serveConfig 云服务器上传配置

| 字段名        | 描述                     |
| ------------- | ------------------------ |
| ip            | 服务器ip                 |
| port          | 服务器端口               |
| *username*    | 服务器用户名(一般为root) |
| *password*    | 服务器登录用户名         |
| *locationUrl* | 本地需要上传文件的url    |
| *serverUrl*   | 上传文件的服务器路径     |
| *isGzip*      | 是否是压缩包             |

使用方法

```javascript
const uploadServe= new staticUpload({
  QiniuConfig:{
    //七牛配置
  },
  aliConfig:{
    // 阿里oss配置
  },
  serveConfig:{
    //自身服务器配置
  }
})
//上传到七牛
uploadServe.qiniuUpload()
//上传到阿里
uploadServe.aliUpload()
```

七牛或者阿里云oss 上传完毕后会调用云服务器上传 如不需要云服务器上传 

serveConfig不配置即可