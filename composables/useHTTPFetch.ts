import {error} from "vscode-jsonrpc/lib/common/is";
import md5 from "md5";

interface FetchOptions {
    headers?: Record<string, string>;

    [key: string]: any;
}

export const useHTTPFetch = (url: string, opt: FetchOptions, auth = false) => {
    //添加请求头
    const accessToken = useCookie('accessToken')
    return useFetch(url, {
        key: md5(url + opt),
        //不需要watch
        watch: false,
        //不要深层响应式
        deep: false,
        ...opt,
        baseURL: 'http://localhost:3000',
        onRequest({request, options}) {
            // 设置请求头
            options.headers = {
                ...options.headers,
                ...(accessToken && accessToken.value ? {Authorization: `Bearer ${accessToken.value}`} : {})
            }
        },
        onRequestError({request, options, error}) {
            //
            console.error(error);
        },
        onResponse({request, response, options}) {
            // 处理响应数据
            // localStorage.setItem('token', response._data.token)
            if (!response._data || response._data.code !== 0) {
                //错误
                message.error(response._data.message)
            }
        },
        onResponseError({request, response, options}) {
            // 处理响应错误
        }
    })
}


//定义接口
export const userInfoFetch = (opt: FetchOptions) => {
    return useHTTPFetch('/api/user', opt)
}

//注册
export const registerFetch = (opt: FetchOptions) => {
    return useHTTPFetch('/api/auth/register', opt)
}

//注册
export const loginFetch = (opt: FetchOptions) => {
    return useHTTPFetch('/api/auth/login', opt)
}