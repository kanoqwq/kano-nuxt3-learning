import {getHeader, defineEventHandler} from "h3";
import jwt from "jsonwebtoken";
import {responseJSON} from "~/utils/helper";
import {JWT_SECRET} from "~/server/private";

/**
 * 1.获取token
 * 2.判断token，如有，处理token，验证token值
 */


//服务端中间件
export default defineEventHandler((event) => {
    let token = getHeader(event, "Authorization");
    if (token) {
        //处理token
        token = token.replace("Bearer ", "");
        try {
            //验证TOKEN
            let res: any = jwt.verify(token, JWT_SECRET);
            //传递给上下文
            event.context.auth = {uid: res.uid}
        } catch (err) {
            return responseJSON(1, 'jwt 验证失败', {}, err as Error);
        }
    }
})
