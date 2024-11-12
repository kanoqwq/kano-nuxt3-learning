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
    let hour = ('0' + curDate.getHours()).slice(-2);
    let minute = ('0' + curDate.getMinutes()).slice(-2);
    let second = ('0' + curDate.getSeconds()).slice(-2);
    return `${year}-${month}-${day}-${hour}:${minute}:${second}`;
}


export const kanoDebounce = (func: Function, delay: number) => {
    let timer: any = null
    return function () {
        if (timer) clearTimeout(timer)
        timer = setTimeout(func.apply(null, arguments), delay)
    }
}

export const parseSubTitle = (str: string) => {
    return str.replace(/!\[.*?\]\(.*?\)/g, '')         // 去除图片
        .replace(/\[.*?\]\(.*?\)/g, '')          // 去除链接
        .replace(/[#>*_`~\-+]+/g, '')            // 去除标题、列表项、粗体、斜体、代码块等符号
        .replace(/(\r\n|\n|\r)/g, ' ')           // 替换换行符为空格
        .replace(/\s+/g, ' ')                    // 多空格替换为单空格
        .trim();                                 // 去除首尾空格.substring(0,100)
}
export const parseCover = (str: string) => {
    // 正则匹配 Markdown 图片格式 `![alt text](image_url)`
    const imageMatch = str.match(/!\[.*?\]\((.*?)\)/);
    if (imageMatch) {
        return imageMatch[1];
    } else {
        return null
    }
}