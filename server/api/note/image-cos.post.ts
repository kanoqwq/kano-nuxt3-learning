/**
 * 1.判断用户是否登录
 * 2. 上传头像(腾讯云存储)
 * 传入参数方式：body formData
 * 参数：-
 */

import {defineEventHandler, setResponseStatus} from "h3";
import {getLoginUid, responseJSON} from "~/utils/helper";
import {createCOSBucket, uploadFileFromBuffer} from "~/utils/helper/cos-bucket";

export default defineEventHandler(async (event) => {

    //判断用户是否登录
    let uid = getLoginUid(event)
    if (uid === -1) {
        setResponseStatus(event, 401)
        return responseJSON(1, '请先登录')
    }

    //获取数据
    const body = await readMultipartFormData(event);

    if (body) {
        if (!(body[0].type as string).includes('image/')) {
            return responseJSON(1, '上传的不是图片')
        }
        //图片名称
        const fileName = Date.now() + '-' + body[0].filename
        //图片数据
        let buffer = body[0].data

        //配置bucket和cos实例
        const config = useRuntimeConfig()
        const bucket = createCOSBucket({
            secretId: config.secretId,
            secretKey: config.secretKey
        })
        const bucketInfo = {
            bucket: config.bucket,
            region: config.region
        }
        try {
            //上传文件到cos
            const res: any = await uploadFileFromBuffer(bucket, {
                fileName,
                stream: buffer,
                fileSize: buffer.length,
                ...bucketInfo
            })
            if (res.code == 0 && res.data) {
                const avatarUrl = `https://${res.data.Location}`
                return responseJSON(0, `上传图片成功`, {fileName, imgUrl: avatarUrl})
            }
        } catch (err: any) {
            return responseJSON(1, '上传到COS云端失败', {}, err)
        }
    } else {
        return responseJSON(1, '没有选择图片', {})
    }
})