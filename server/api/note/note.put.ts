/**
 * 1.判断用户是否登录
 * 2. 修改文章
 * 传入参数方式：body
 * 参数： noteId
 *     title
 *     content_md
 *     state
 */

import {defineEventHandler, readBody, setResponseStatus} from "h3";
import {getDB} from "~/utils/db/mysql";

import {genTitle, getLoginUid, responseJSON} from "~/utils/helper";
import {notePutSchema} from "../../../schema/server/note";

export default defineEventHandler(async (event) => {

    //判断用户是否登录
    let uid = getLoginUid(event)
    if (uid === -1) {
        setResponseStatus(event, 401)
        return responseJSON(1, '请先登录')
    }

    //获取数据
    const body = await readBody(event);
    //joi校验数据
    try {
        //传入undefined不会导致失败，所以不要传undefined进去
        await notePutSchema.validateAsync(body || {})
    } catch (error) {
        return responseJSON(1, '参数错误')
    }

    const connection = await getDB().getConnection()

    try {
        //修改文章
        const [res] = await connection.execute('update `notes` SET `title`=?,`content_md`=?,`state`=? where `id`=? and `uid`=?', [
            body.title,
            body.content_md,
            body.state,
            body.noteId,
            uid
        ])
        if ((res as any).affectedRows <= 0) {
            return responseJSON(1, `修改文章失败`)
        }
        return responseJSON(0, `修改文章成功`)
    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {body}, error.message)
    } finally {
        //释放链接
        connection.release()
    }
})