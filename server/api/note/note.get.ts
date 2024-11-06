/**
 * 1. 判断用户是否登录
 * 2. 获取文章(分页)
 * 传入参数方式：get query
 * 参数：noteId
 *     title
 *     content_md
 *     state
 */

import {defineEventHandler, getQuery, setResponseStatus} from "h3";
import {getDB} from "~/utils/db/mysql";
import {getLoginUid, responseJSON} from "~/utils/helper";
import {notePagParamsSchema} from "~/schema/note";

export default defineEventHandler(async (event) => {

    //判断用户是否登录
    let uid = getLoginUid(event)
    if (uid === -1) {
        setResponseStatus(event, 401)
        return responseJSON(1, '请先登录')
    }

    //分页
    let query = await getQuery(event)
    try {
        query = await notePagParamsSchema.validateAsync(query)
    } catch {
        return responseJSON(1, '分页参数错误', {})
    }


    const connection = await getDB().getConnection()

    try {
        const offset = (Number((query.pageNum as any)) - 1) * Number((query.pageSize as any))
        //BUG:mysql2 使用limit需要传入string类型的数字
        const [list] = await connection.execute('select * from `notes` where `uid`=? limit ? offset ?', [
            uid,
            (query.pageSize as any).toString(),
            offset.toString()
        ])
        return responseJSON(0, `获取文章成功`, {pageNum: query.pageNum, total: (list as Array<any>).length, list: list})
    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {}, error.message)
    } finally {
        //释放链接
        connection.release()
    }
})