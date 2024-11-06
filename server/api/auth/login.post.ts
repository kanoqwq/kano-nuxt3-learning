/**
 * 1 获取客户端传来的手机号
 * 2.数据校验
 * 3.查询数据库，查询不到返回错误
 * 4.密码正确创建token和token有效期，返回给客户端
 */

import {defineEventHandler, readBody, setResponseStatus} from "h3";
import {getDB} from "~/utils/db/mysql";
import {SALT,JWT_SECRET} from '~/server/private'
import md5 from 'md5'
import {ca} from "cronstrue/dist/i18n/locales/ca";
import {responseJSON} from "~/utils/helper";
import {userLoginSchema} from "~/schema/user";
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    //获取数据
    const body = await readBody(event);


    try {
        const value = await userLoginSchema.validateAsync(body || {})
    } catch (error) {
        return responseJSON(1, '参数错误')
    }

    let password = md5(md5(body.password + SALT)) //md5加密

    const connection = await getDB().getConnection()

    try {
        //查询数据库
        const [phoneList] = await connection.execute("select * from `users` where `phone` =?", [body.phone])
        if ((phoneList as Array<any>).length > 0) {
            //继续查找密码
            //创建账号
            const [passwd] = await connection.execute("select * from `users` where `password` =?", [password])
            if ((passwd as any).length > 0) {
                //生成TOKEN JWT
                //密钥
                let token = jwt.sign({uid: (passwd as any)[0].id, phone: body.phone}, JWT_SECRET, {
                    expiresIn: '2 days',
                    algorithm: 'HS256'
                })
                console.log(token)

                return responseJSON(0, '登录成功',{
                    accessToken: token,
                    userInfo:{...(passwd as any)[0],password:""}
                })
            } else {
                return responseJSON(0, '密码错误')
            }
        } else {
            return responseJSON(1, '手机号不存在')
        }
    } catch (error: any) {
        setResponseStatus(event, 500)
        return responseJSON(1, '服务器错误', {}, error.message)
    } finally {
        //释放链接
        connection.release()
    }
})