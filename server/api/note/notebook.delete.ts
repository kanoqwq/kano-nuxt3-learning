/**
 * 1. 判断用户是否登录
 * 2. 通过文集id删除文集
 * 传入参数方式：body
 * 参数：id
 */

import {defineEventHandler, readBody, setResponseStatus} from "h3";
import {Connection} from "~/utils/db/mysql";
import {getLoginUid, responseJSON} from "~/utils/helper";
import {notebookDeleteSchema} from "../../../schema/server/notebook";

export default defineEventHandler(async (event) => {

    //判断用户是否登录
    let uid = getLoginUid(event)
    if (uid === -1) {
        setResponseStatus(event, 401)
        return responseJSON(1, '请先登录')
    }
    const body = await readBody(event)
    try {
        await notebookDeleteSchema.validateAsync(body || {})
    } catch {
        return responseJSON(1, '参数错误', {})
    }

    const connection = await Connection.getConnection()

    try {
        const [res] = await connection.execute('delete from `notebooks` where `id`=? and `uid`=? ', [body.id, uid])
        if ((res as any).affectedRows <=0) {
            return responseJSON(1, `删除文集id:${body.id}失败`, {}, res as any)
        }
        return responseJSON(0, `删除文集成功`)
    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {}, error.message)
    } finally {
        //释放链接
        connection.end()

    }
})