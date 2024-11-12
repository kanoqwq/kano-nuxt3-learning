/**

 */

import {defineEventHandler, readBody, setResponseStatus} from "h3";
import {Connection} from "~/utils/db/mysql";
import {responseJSON, getLoginUid} from "~/utils/helper";
import {userInfoPutSchema} from "~/schema/server/note";

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
        await userInfoPutSchema.validateAsync(body || {})
    } catch (error) {
        return responseJSON(1, '参数错误')
    }

    const connection = await Connection.getConnection()

    try {
        const [res] = await connection.execute("update `users` set `nickname`=? where `id`=?", [body.nickname, uid])
        if ((res as any).affectedRows > 0) {
            return responseJSON(0, 'ok')
        } else {
            return responseJSON(1, '失败')
        }
    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {}, error.message)
    } finally {
        //释放链接
        connection.end()
    }
})