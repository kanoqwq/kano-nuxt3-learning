import COS from 'cos-nodejs-sdk-v5'
import {} from "#app";
// SECRETID 和 SECRETKEY 请登录 https://console.cloud.tencent.com/cam/capi 进行查看和管理

type COSBucketOptions = {
    secretId: string;
    secretKey: string;
}

export const createCOSBucket = ({secretId, secretKey}: COSBucketOptions) => new COS({
    SecretId: secretId, // 推荐使用环境变量获取；用户的 SecretId，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://cloud.tencent.com/document/product/598/37140
    SecretKey: secretKey, // 推荐使用环境变量获取；用户的 SecretKey，建议使用子账号密钥，授权遵循最小权限指引，降低使用风险。子账号密钥获取可参考https://cloud.tencent.com/document/product/598/37140
});


type UploadFileFromLocalOption = {
    fileName: string;
    filePath: string;
    bucket: string;
    region: string;
}

export const uploadFileFromLocal = (cos: COS, {filePath, fileName, bucket, region}: UploadFileFromLocalOption) => {
    return new Promise((resolve, reject) => {
        cos.uploadFile({
            Bucket: bucket, // 填入您自己的存储桶，必须字段
            Region: region,  // 存储桶所在地域，例如 ap-beijing，必须字段
            Key: fileName,  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
            FilePath: filePath,                // 必须
            SliceSize: 1024 * 1024 * 5,     // 触发分块上传的阈值，超过5MB使用分块上传，非必须
        }, function (err, data) {
            if (err) {
                reject({message: '上传失败', code: 1, error: err})
            } else {
                resolve({message: '上传成功', code: 0, data: data})
            }
        });
    })
}

type UploadFileFromBufferOption = {
    fileName: string;
    stream: Buffer;
    fileSize: number;
    bucket: string;
    region: string;
}

export const uploadFileFromBuffer = (cos: COS, {
    fileName,
    stream,
    fileSize,
    bucket,
    region
}: UploadFileFromBufferOption) => {
    return new Promise((resolve, reject) => {
        cos.putObject({
            Bucket: bucket, // 填入您自己的存储桶，必须字段
            Region: region,  // 存储桶所在地域，例如 ap-beijing，必须字段
            Key: fileName,  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
            Body: stream, // 上传文件对象，必须字段
            ContentLength: fileSize,
        }, function (err, data) {
            if (err) {
                reject({message: '上传失败', code: 1, error: err})
            } else {
                resolve({message: '上传成功', code: 0, data: data})
            }
        });
    })
}



