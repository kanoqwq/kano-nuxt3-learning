/**
 * 1. 获取全部文章
 * 传入参数方式：params
 * 参数：pageSize,pageNum
 */

import {defineEventHandler, getQuery, setResponseStatus} from "h3";
import {getDB} from "~/utils/db/mysql";
import {responseJSON} from "~/utils/helper";
import {notePagParamsSchema} from "~/schema/note";

export default defineEventHandler(async (event) => {

    //分页
    let query = await getQuery(event)
    try {
        query = await notePagParamsSchema.validateAsync(query)
    } catch (error:any){
        return responseJSON(1, '分页参数错误', {},error)
    }

    const connection = await getDB().getConnection()

    try {
        const offset = (Number((query.pageNum as any)) - 1) * Number((query.pageSize as any))
        //BUG:mysql2 使用limit需要传入string类型的数字
        const [list] = await connection.execute('select * from `notes` limit ? offset ?', [
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