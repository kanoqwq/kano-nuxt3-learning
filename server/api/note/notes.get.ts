/**
 * 1. 判断用户是否登录
 * 2. 获取当前用户指定文集下所有的文章
 * 传入参数方式：get params
 * 参数：notebookId，pageSize？，pageNum？
 */

import {defineEventHandler, getQuery, setResponseStatus} from "h3";
import {getDB} from "~/utils/db/mysql";
import {getLoginUid, responseJSON} from "~/utils/helper";
import {noteWithNotebookIdPagParamsSchema} from "~/schema/note";

export default defineEventHandler(async (event) => {

    //判断用户是否登录
    let uid = getLoginUid(event)
    if (uid === -1) {
        setResponseStatus(event, 401)
        return responseJSON(1, '请先登录')
    }

    //分页
    let params = await getQuery(event)
    try {
        params = await noteWithNotebookIdPagParamsSchema.validateAsync(params)
    } catch (e: any) {
        return responseJSON(1, '传入参数错误', {}, e)
    }


    const connection = await getDB().getConnection()

    try {
        //查询文章和文集的关联表
        //先从文集关联表中查询到所有的note_id
        const [note_id_list] = await connection.execute('select `note_id` from `notebook_notes` where `notebook_id`=?', [
            params.notebookId,
        ])

        //查询不到
        if ((note_id_list as Array<any>).length <= 0) {
            return responseJSON(0, `获取文章成功`, {
                pageNum: params.pageNum,
                total: 0,
                list: []
            })
        }

        const noteIdList = (note_id_list as Array<any>).map(({note_id}) => note_id)

        const offset = (Number((params.pageNum as any)) - 1) * Number((params.pageSize as any))
        //BUG:mysql2 使用limit需要传入string类型的数字

        //BUG：in语句的括号内没法传入数组
        let strGen = noteIdList.map(() => '?').join()
        const sqlQuery = 'select * from `notes` where `uid`=? and `id` in (' + strGen + ') limit ? offset ?'
        const [list] = await connection.execute(sqlQuery, [
            uid,
            ...noteIdList,
            (params.pageSize as any).toString(),
            offset.toString()
        ])

        console.log(strGen,noteIdList)
        return responseJSON(0, `获取文章成功`, {
            pageNum: params.pageNum,
            total: (list as Array<any>).length,
            list: list
        })

    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {}, error.message)
    } finally {
        //释放链接
        connection.release()
    }
})