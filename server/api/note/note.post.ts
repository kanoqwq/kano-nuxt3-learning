/**
 * 1.判断用户是否登录
 * 2. 创建文章
 * 传入参数方式：body
 * 参数：notebookId
 */

import {defineEventHandler, readBody, setResponseStatus} from "h3";
import {Connection} from "~/utils/db/mysql";

import {genTitle, getLoginUid, responseJSON} from "~/utils/helper";
import {noteAddSchema} from "../../../schema/server/note";

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
        await noteAddSchema.validateAsync(body || {})
    } catch (error) {
        return responseJSON(1, '参数错误')
    }

    const connection = await Connection.getConnection()

    try {
        //先查询一下有没有该文集id，校验文集合法性
        const [res0] = await connection.execute('select * from `notebooks` where id=?', [body.notebookId])
        if ((res0 as Array<any>).length <= 0) {
            return responseJSON(1, `没有找到该文集`)
        }

        //创建文章
        const [res] = await connection.execute('insert into `notes` (`title`,`content_md`,`state`,`uid`) value (?,?,?,?)', [
            genTitle(), '', 1, uid
        ])
        if ((res as any).affectedRows <= 0) {
            return responseJSON(1, `创建文章失败`)
        }
        //关联文集表
        const [res1] = await connection.execute('insert into `notebook_notes` (`notebook_id`,`note_id`) value (?,?)', [
            body.notebookId, (res as any).insertId
        ])
        if ((res1 as any).affectedRows <= 0) {
            return responseJSON(1, `关联文集失败`)
        }
        return responseJSON(0, `创建文章成功`, {uid})
    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {body}, error.message)
    } finally {
        //释放链接
        connection.end()
    }
})