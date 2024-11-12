/**
 * 1. 获取全部文章
 * 传入参数方式：params
 * 参数：noteId
 */

import {defineEventHandler, getQuery, setResponseStatus} from "h3";
import {Connection} from "~/utils/db/mysql";
import {responseJSON} from "~/utils/helper";
import {notePagParamsSchema, noteParamsSchema} from "../../schema/server/note";

export default defineEventHandler(async (event) => {

    //分页
    let query = await getQuery(event)
    try {
        query = await noteParamsSchema.validateAsync(query)
    } catch (error: any) {
        return responseJSON(1, '参数错误', {}, error)
    }

    const connection = await Connection.getConnection()

    try {
        const [list] = await connection.execute('SELECT n.*,u.avatar,u.nickname FROM notes n JOIN users u ON n.uid = u.id WHERE n.id=?', [
            query.noteId,
        ])
        return responseJSON(0, `获取文章成功`, {...(list as any)[0]})
    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {}, error.message)
    } finally {
        //释放链接
        connection.end()
    }
})