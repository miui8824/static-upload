const { qiniuUpload } = require('./upload-qiniu');
const { ossUpload } = require('./aliupload');
const { uploadProject } = require('./upload');
const path = require('path')
const pkgpath = path.join(process.cwd(), './package.json')
const pkg = require(pkgpath)
const pkgversion = +pkg.version.split('.').join('')

class StaticUpload {
  constructor({ serveConfig, QiniuConfig, aliConfig }) {
    this.SeverConfig = serveConfig;
    this.QiniuConfig = QiniuConfig;
    this.aliConfig = aliConfig;
  }

  async qiniuUpload () {
    const res = await qiniuUpload(this.QiniuConfig);
    if (res === 200) {
      this.SeverConfig && uploadProject(this.SeverConfig);
    }
  }

  async aliUpload () {
    const { result, client } = await ossUpload(this.aliConfig);
    if (result && result.length !== 0) {
      this.SeverConfig && uploadProject(this.SeverConfig);
    }
    return client
  }
  async yunServerUpload () {
    if (!this.SeverConfig) {
      console.log('请配置云服务器相关信息')
      return
    }
    uploadProject(this.SeverConfig)
  }
  async deleteOssfile (client, prefix) {
    if (!prefix) {
      console.log('请输入匹配前缀')
      return
    }
    let continuationToken = null
    let files = []
    do {
      const result = await client.listV2({
        'continuation-token': continuationToken,
        prefix,
        "max-keys": 1000,
      })
      continuationToken = result.nextContinuationToken
      files.push(...result.objects)
    } while (continuationToken)
    const prefixIndex = prefix.split('/').length
    const versionsobj = new Map()
    // 获取所有文件目录名
    files.map(item => {
      const names = item.name.split('/')
      const version = names[prefixIndex]
      versionsobj.set(version, version)
    })
    // 获取所有版本号
    // 需要保留的版本号
    let reservation = []
    Array.from(versionsobj.keys()).map(item => {
      const versionstr = +(item.split('.').join(''))
      if (!isNaN(versionstr) && versionstr <= pkgversion) {
        reservation.push(versionstr)
      }
    })
      //保留最新的2个版本 防止用户浏览器缓存 多保留一个版本 安全起见
    const versionlatest = reservation.sort((a, b) => b - a).slice(0, 2)
    console.log(`需要保留的版本:${versionlatest.join(',')},所有版本:${reservation.join(',')}`)
    const deleteFiles = files.filter(item => {
      const version = item.name.split('/')[prefixIndex]
      const versionumber = +(version.split('.').join(''))
      return !versionlatest.includes(versionumber)
    })

    await Promise.all(deleteFiles.map(item => client.delete(item.name)))

    console.log(`总匹配文件个数${files.length},需删除垃圾文件个数${deleteFiles.length}`)
  }
  startUpload () {
    // this.aliUpload()
    // this.qiniuUpload()
  }
}
module.exports = {
  staticUpload: StaticUpload,
};
