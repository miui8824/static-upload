const co = require('co');
const clc = require('cli-color');
const OSS = require('ali-oss');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const assert = require('assert');
const debug = require('debug')('alioss-upload');

const ossUpload = async (opts = {}) => {
	const baseDir = path.join(process.cwd(), opts.originPath);
	assert(opts.region, `region is required in ${opts}`);
	assert(opts.accessKeyId, `accessKeyId is required in ${opts}`);
	assert(opts.accessKeySecret, `accessKeySecret is required in ${opts}`);
	assert(opts.bucket, `bucket is required in ${opts}`);
	assert(opts.bucketPath, `bucketPath is required in ${opts}`);
	const client = new OSS({
		region: opts.region,
		accessKeyId: opts.accessKeyId,
		accessKeySecret: opts.accessKeySecret,
		bucket: opts.bucket,
	});

	let uploadFiles;

	function bouncer (arr) {
		// 请把你的代码写在这里
		return arr.filter((item) => !!item);
	}

	if (fs.statSync(baseDir).isFile()) {
		uploadFiles = [baseDir];
	} else {
		const newfilterFiles = opts.filterFiles || [];
		if (!Array.isArray(newfilterFiles)) {
			console.log(`filterFiles is not a Array  please edit config filterFiles:[${opts.filterFiles}]`);
			return;
		}
		const ignore = bouncer([`${opts.Filterdirectory}`, ...newfilterFiles]);
		const filearr = globby.sync(['**/*.*'], {
			cwd: baseDir,
			ignore: ignore
		}).map((p) => {
			return p;
		});
		uploadFiles = filearr;
	}
	debug('uploadFiles => %j', uploadFiles);
	// 刷新缓存
	async function refreshCache (fileUrl) {
		try {
			// 修改文件的元信息
			await client.putMeta(fileUrl, {
				'refresh': 'true'
			});
			console.log('刷新缓存成功');
		} catch (error) {
			console.error('刷新缓存失败', error);
		}
	}

	let result = await co(function* () {
		const successFiles = [];
		for (const filename of uploadFiles) {
			const start = Date.now();
			const filePath = path.join(baseDir, filename);
			const stream = fs.createReadStream(filePath);
			const size = fs.statSync(filePath).size;
			const bucketPath = opts.bucketPath + '/' + filename;
			try {
				const result = yield client.putStream(bucketPath, stream, {
					contentLength: size,
					headers: {
						'Cache-Control': `max-age=${opts.maxage || 3600}`,
						Expires: opts.maxage || 3600,
					}
				});
				successFiles.push({
					name: result.name,
					url: result.url,
				});
				console.log(`${filename} was uploaded successfully, take ${Date.now() - start}ms`);
				if (opts.isrefreshCache) {
					// console.log(result,83)
					refreshCache(result.name)
				}
			} catch (e) {
				console.log(clc.red(`${filename} upload fail, message: ${e.message}`));
			}
		}
		console.log(clc.green(
			`all files finished upload, total: ${uploadFiles.length}, success: ${successFiles.length}, fail: ${uploadFiles.length - successFiles.length}`
		));
		return successFiles;
	}).catch((e) => {
		console.log(clc.red(`oh, some error happend, message: ${e.message}`));
	});
	return {
		result,
		client
	}
};
module.exports = {
	ossUpload,
};