/**
 * 1 获取客户端传来的手机号
 * 2.数据校验
 * 3.查询数据库，查询不到返回错误
 * 4.密码正确创建token和token有效期，返回给客户端
 */

import {defineEventHandler, readBody, setResponseStatus} from "h3";
import {Connection} from "~/utils/db/mysql";
import {responseJSON,getLoginUid} from "~/utils/helper";

export default defineEventHandler(async (event) => {

    //判断用户是否登录
    let uid = getLoginUid(event)
    if (uid === -1) {
        setResponseStatus(event, 401)
        return responseJSON(1, '请先登录')
    }

    const connection = await Connection.getConnection()

    try {
            const [res] = await connection.execute("select * from `users` where `id`=?",[uid])
            if ((res as any).length > 0) {
                console.log(res)
                return responseJSON(0, 'ok',{
                    ...(res as any)[0],
                    password:'',
                    phone:''
                })
            } else {
                return responseJSON(1, '没有此用户')
            }
    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {}, error.message)
    } finally {
        //释放链接
        connection.end()
    }
})