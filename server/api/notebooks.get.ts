/**
 * 1. 判断用户是否登录
 * 2. 获取文集(所有用户)
 * 传入参数方式：
 * 参数：
 */

import {defineEventHandler, readBody, setResponseStatus} from "h3";
import {getDB} from "~/utils/db/mysql";
import {responseJSON} from "~/utils/helper";

export default defineEventHandler(async (event) => {
    const connection = await getDB().getConnection()

    try {
        const [list] = await connection.query('select * from `notebooks`')
        return responseJSON(0, `ok`, list)
    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {}, error.message)
    } finally {
        //释放链接
        connection.release()
    }
})