const co = require('co')
const clc = require('cli-color')
const OSS = require('ali-oss')
const fs = require('fs')
const path = require('path')
const globby = require('globby')
const assert = require('assert')
const debug = require('debug')('alioss-upload')

const ossUpload = (opts = {}) => {
  const baseDir = path.join(process.cwd(), opts.originPath)
  assert(opts.region, `region is required in ${opts}`)
  assert(opts.accessKeyId, `accessKeyId is required in ${opts}`)
  assert(opts.accessKeySecret, `accessKeySecret is required in ${opts}`)
  assert(opts.bucket, `bucket is required in ${opts}`)
  assert(opts.bucketPath, `bucketPath is required in ${opts}`)
  const client = new OSS({
    region: opts.region,
    accessKeyId: opts.accessKeyId,
    accessKeySecret: opts.accessKeySecret,
    bucket: opts.bucket
  })

  let uploadFiles

  if (fs.statSync(baseDir).isFile()) {
    uploadFiles = [baseDir]
  } else {
    const filearr = globby
      .sync(['**/*.js', '**/*.css', '**/*.html', '**/*.text'], { cwd: baseDir })
      .map(p => {
        return p
      })
    if (filearr.includes(opts.filterFile)) {
      const filterFileIndex = filearr.indexOf(opts.filterFile)
      filearr.splice(filterFileIndex, 1)
    }
    uploadFiles = filearr
  }
  debug('uploadFiles => %j', uploadFiles)

  return co(function * () {
    const successFiles = []
    for (const filename of uploadFiles) {
      const start = Date.now()
      const filePath = path.join(baseDir, filename)
      const stream = fs.createReadStream(filePath)
      const size = fs.statSync(filePath).size
      const bucketPath = opts.bucketPath + '/' + filename
      try {
        const result = yield client.putStream(bucketPath, stream, {
          contentLength: size
        })
        successFiles.push({
          name: result.name,
          url: result.url
        })
        console.log(
          `${filename} was uploaded successfully, take ${Date.now() - start}ms`
        )
      } catch (e) {
        console.log(clc.red(`${filename} upload fail, message: ${e.message}`))
      }
    }
    console.log(
      clc.green(
        `all files finished upload, total: ${uploadFiles.length}, success: ${
          successFiles.length
        }, fail: ${uploadFiles.length - successFiles.length}`
      )
    )
    return successFiles
  }).catch(e => {
    console.log(clc.red(`oh, some error happend, message: ${e.message}`))
  })
}
module.exports = {
  ossUpload
}
