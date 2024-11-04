/**
 * 1 获取数据
 * 2 校验数据
 * 3 加密密码
 * 4 判断账户是否注册
 * 5 未注册创建账号
 */
import {defineEventHandler, readBody} from "h3";
import Joi from "joi";
import {getDB} from "~/utils/db/mysql";

import md5 from 'md5'
import {responseJSON} from "~/utils/helper";
import {userRegisterSchema} from "~/schema/user";

export default defineEventHandler(async (event) => {
    //获取数据
    const body = await readBody(event);

    //校验数据（使用Joi）
    try {
        const value = await userRegisterSchema.validateAsync(body)
    } catch (error) {
        return responseJSON(1, '参数错误')
    }

    let password = md5(md5(body.password + SALT)) //md5加密

    const connection = await getDB().getConnection()

    try {
        //查询数据库
        const [phoneList] = await connection.execute("select * from `users` where `phone` =?", [body.phone])
        if ((phoneList as Array<any>).length > 0) {
            return responseJSON(1, '账号已注册')
        }
        //创建账号
        const [affect] = await connection.execute("insert into `users` (`phone`,`nickname`,`password`) values (?,?,?)", [body.phone, body.nickname, password])
        if ((affect as any).affectedRows > 0) {
            return responseJSON(0, '注册成功')

        }
    } catch (error) {
        return responseJSON(1, '服务器错误')
    } finally {
        //释放链接
        connection.release()
    }
})