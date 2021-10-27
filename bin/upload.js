const { Client } = require('ssh2')
const path = require('path')
const conn = new Client()
const uploadProject = uploadconfig => {
  const {
    ip,
    port,
    username,
    password,
    locationUrl,
    serverUrl,
    isGzip
  } = uploadconfig
  const vaiteValue = [
    { key: 'ip', value: ip },
    { key: 'port', value: port },
    { key: 'username', value: username },
    { key: 'password', value: password },
    { key: 'locationUrl', value: locationUrl },
    { key: 'serverUrl', value: serverUrl }
  ]
  for (let i = 0; i < vaiteValue.length; i++) {
    const item = vaiteValue[i]
    if (!item.value) {
      console.log(item.key + '不能为空')
      return
    }
  }
  conn
    .on('ready', () => {
      conn.sftp((_err, sftp) => {
        sftp.fastPut(
          path.join(process.cwd(), locationUrl), // 本地 assets.tar.gz 文件路径
          serverUrl,
          (err, result) => {
            console.log(err, 20)
            if (!err) {
              console.log('servers upload success')
              isGzip ? deployProject(conn) : conn.end()
            }

            // iszip&&deployProject(conn)
            // conn.end();
            // TODO: deploy
          }
        )
      })
    })
    .connect({
      host: ip, // 服务器 host
      port, // 服务器 port
      username, // 服务器用户名
      password // 服务器密码
    })
}
// 利用 shell 方法部署项目
function deployProject () {
  conn.shell((_err, stream) => {
    stream
      .end(
        `
          cd /www/wwwroot/egg-typescript
          npm run stop
          cd /www/wwwroot
          rm -rf egg-typescript
          mv /www/wwwroot/build2.tar.gz /www/wwwroot/egg-typescript/build2.tar.gz
          cd /www/wwwroot/egg-typescript
          tar zxvf build2.tar.gz
          rm -rf build2.tar.gz
          npm start
          exit
        `
      )
      .on('data', data => {
        // 输出部署时的信息
        console.log('data: ', data.toString())
      })
      .on('close', () => {
        console.log('shell close')
        conn.end()
      })
  })
}
module.exports = {
  uploadProject
}
