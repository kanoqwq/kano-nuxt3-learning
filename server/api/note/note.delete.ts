/**
 * 1. 判断用户是否登录
 * 2. 通过文章id删除文章
 * 传入参数方式：body
 * 参数：noteId
 */

import {defineEventHandler, readBody, setResponseStatus} from "h3";
import {getDB} from "~/utils/db/mysql";
import {getLoginUid, responseJSON} from "~/utils/helper";
import {noteDeleteSchema} from "~/schema/server/note";

export default defineEventHandler(async (event) => {

    //判断用户是否登录
    let uid = getLoginUid(event)
    if (uid === -1) {
        setResponseStatus(event, 401)
        return responseJSON(1, '请先登录')
    }
    const body = await readBody(event)
    try {
        await noteDeleteSchema.validateAsync(body || {})
    } catch {
        return responseJSON(1, '参数错误', {})
    }

    const connection = await getDB().getConnection()

    try {
        //删除文章
        const [res] = await connection.execute('delete from `notes` where `id`=? and `uid`=? ', [body.noteId, uid])
        if ((res as any).affectedRows <= 0) {
            return responseJSON(1, `删除文章id:${body.noteId}失败`, {}, res as any)
        }
        return responseJSON(0, `删除文章id:${body.noteId}成功`)
    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {}, error.message)
    } finally {
        //释放链接
        connection.release()
    }
})