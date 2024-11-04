import type {EventHandlerRequest, H3Event} from "h3";

export const responseJSON = (code: number, msg: string, data: {} = {}, error?: Error) => {
    let response = {code: code, message: msg, error, data: data}
    console.log('API RESPONSE :', response)
    return response
}


export const getLoginUid = (event: H3Event<EventHandlerRequest>) => {
    return event.context.auth ? event.context.auth : 0
}