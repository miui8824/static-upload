const { qiniuUpload } = require('./upload-qiniu');
const { ossUpload } = require('./aliupload');
const { uploadProject } = require('./upload');

class StaticUpload {
  constructor({ serveConfig, QiniuConfig, aliConfig }) {
    this.SeversConfig = serveConfig;
    this.QiniuConfig = QiniuConfig;
    this.aliConfig = aliConfig;
  }

  async qiniuUpload() {
    const res = await qiniuUpload(this.QiniuConfig);
    if (res === 200) {
      this.serveConfig && uploadProject(this.SeversConfig);
    }
  }

  async aliUpload() {
    const res = await ossUpload(this.aliConfig);
    if (res && res.length !== 0) {
      this.serveConfig && uploadProject(this.SeversConfig);
    }
  }
  async yunServerUpload(){
    if(this.serveConfig){
      console.log('请配置云服务器相关信息')
      return
    }
    uploadProject(this.serveConfig)
  }

  startUpload() {
    // this.aliUpload()
    // this.qiniuUpload()
  }
}
module.exports = {
  staticUpload: StaticUpload,
};
