/**
 * 1.判断用户是否登录
 * 2. 上传图片
 * 传入参数方式：body formdata
 * 参数：-
 */

import {defineEventHandler, setResponseStatus} from "h3";
import path from 'node:path'
import fs from 'node:fs'
import {getLoginUid, responseJSON} from "~/utils/helper";

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
        const fileName = Date.now() + '-' + (body[0].filename?.replaceAll(' ', ''))
        //图片路径
        const filePath = path.join(`./public/uploads/${(new Date()).getFullYear()}/`, fileName)
        //图片数据
        let buffer = body[0].data
        if (!fs.existsSync(path.join(`./public/uploads/${(new Date()).getFullYear()}/`))) {
            fs.mkdirSync(path.join(`./public/uploads/${(new Date()).getFullYear()}/`))
        }
        //不需要sync，以免卡线程
        fs.writeFile(filePath, buffer, (error: any) => {
            if (error) {
                console.log('保存图片失败！ 错误：', error.message)
            }
        })
        const avatarUrl = `/uploads/${(new Date()).getFullYear()}/${fileName}`
        return responseJSON(0, `上传图片成功`, {fileName, imgUrl: avatarUrl})
    } else {
        return responseJSON(1, '没有选择图片', {})
    }
})