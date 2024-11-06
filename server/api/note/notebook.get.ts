/**
 * 1. 判断用户是否登录
 * 2. 获取文集
 * 传入参数方式:
 * 参数：
 */

import {defineEventHandler, readBody, setResponseStatus} from "h3";
import {getDB} from "~/utils/db/mysql";
import {getLoginUid, responseJSON} from "~/utils/helper";

export default defineEventHandler(async (event) => {

    //判断用户是否登录
    let uid = getLoginUid(event)
    if (uid === -1) {
        setResponseStatus(event, 401)
        return responseJSON(1, '请先登录')
    }

    const connection = await getDB().getConnection()

    try {
        const [list] = await connection.execute('select * from `notebooks` where uid =?', [uid])
        return responseJSON(0, `获取文集成功`, list)
    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {}, error.message)
    } finally {
        //释放链接
        connection.release()
    }
})