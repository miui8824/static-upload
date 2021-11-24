const { qiniuUpload } = require('./upload-qiniu');
const { ossUpload } = require('./aliupload');
const { uploadProject } = require('./upload');

class StaticUpload {
  constructor({ serveConfig, QiniuConfig, aliConfig }) {
    this.SeverConfig = serveConfig;
    this.QiniuConfig = QiniuConfig;
    this.aliConfig = aliConfig;
  }

  async qiniuUpload() {
    const res = await qiniuUpload(this.QiniuConfig);
    if (res === 200) {
      this.SeverConfig && uploadProject(this.SeverConfig);
    }
  }

  async aliUpload() {
    const res = await ossUpload(this.aliConfig);
    if (res && res.length !== 0) {
      this.SeverConfig && uploadProject(this.SeverConfig);
    }
  }
  async yunServerUpload(){
    console.log(this.SeverConfig,26)
    if(!this.SeverConfig){
      console.log('请配置云服务器相关信息')
      return
    }
    uploadProject(this.SeverConfig)
  }

  startUpload() {
    // this.aliUpload()
    // this.qiniuUpload()
  }
}
module.exports = {
  staticUpload: StaticUpload,
};
