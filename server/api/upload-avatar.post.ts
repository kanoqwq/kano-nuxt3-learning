/**
 * 1.判断用户是否登录
 * 2. 上传头像
 * 传入参数方式：body formdata
 * 参数：-
 */

import {defineEventHandler, setResponseStatus} from "h3";
import {Connection} from "~/utils/db/mysql";
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
        const fileName = Date.now() + '-' + (body[0].filename?.replaceAll(' ',''))
        //图片路径
        const filePath = path.join(`./public/avatars/`, fileName)
        //图片数据
        let buffer = body[0].data
        if (!fs.existsSync(path.join(`./public/avatars/`))) {
            fs.mkdirSync(path.join(`./public/avatars//`))
        }
        //不需要sync，以免卡线程
        fs.writeFile(filePath, buffer, (error: any) => {
            if (error) {
                console.log('保存图片失败！ 错误：', error.message)
            }
        })

        const avatarUrl = `/avatars/${fileName}`

        const connection = await Connection.getConnection()
        try {
            //插入users
            const [res] = await connection.execute('update `users` set `avatar` =? where `id`=?', [
                avatarUrl,
                uid
            ])
            if ((res as any).affectedRows <= 0) {
                return responseJSON(1, `上传头像失败`)
            }

            return responseJSON(0, `上传头像成功`, {fileName, avatar: avatarUrl})
        } catch (error: any) {
            setResponseStatus(event, 500)
            return responseJSON(1, '服务器错误', {body}, error.message)
        } finally {
            //释放链接
            connection.release()
        }
    } else {
        return responseJSON(1, '没有选择图片', {})
    }
})