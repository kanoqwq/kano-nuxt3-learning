import type {EventHandlerRequest, H3Event} from "h3";

export const responseJSON = (code: number, msg: string, data: {} = {}, error?: Error) => {
    let response = {code: code, message: msg, error, data: data}
    console.log('API RESPONSE :', response)
    return response
}


export const getLoginUid = (event: H3Event<EventHandlerRequest>) => {
    return event.context.auth ? event.context.auth.uid ? event.context.auth.uid : -1 : -1
}

//获取当前时间
export const genTitle = () => {
    const curDate = new Date();
    let year = curDate.getFullYear();
    //-2指从倒数第二位开始获取，这样就不会在前面多一个0了
    let month = ('0' + (curDate.getMonth() + 1)).slice(-2);
    let day = ('0' + curDate.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}