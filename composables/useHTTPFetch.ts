import {error} from "vscode-jsonrpc/lib/common/is";
import md5 from "md5";

interface FetchOptions {
    headers?: Record<string, string>;

    [key: string]: any;
}


export type responseData = {
    code: number;
    message: string;
    data: Array<any>;
}


export const useHTTPFetch = (url: string, opt: FetchOptions, auth = false) => {
    //添加请求头
    const accessToken = useCookie('accessToken')
    const nuxtApp = useNuxtApp()
    return useFetch<responseData>(url, {
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
            console.error(error);
        },
        onResponse({request, response, options}) {
            // 将在 call 和 parsing body 之后调用
            // 处理响应数据
            // localStorage.setItem('token', response._data.token)
            if (!response._data || response._data.code !== 0) {
                //错误
                message.error(response._data.message)
            }

        },
        async onResponseError({request, response, options}) {
            //fetch 发生时将被调用
            // 处理响应错误
            if (response.status === 401) {
                // 这里直接navigatge并不会跳转，需要使用callWithNuxt方法
                //callWithNuxt（），当你在 middleware 中使用 await 时，这是必需的
                //但callWithNuxt方法已经在新版本的nuxt中改为更好用的runWithContext方法
                await nuxtApp.runWithContext(() => {
                    navigateTo('/sign_in', {
                        replace: true, redirectCode: 401
                    })
                })
            } else if (response.status === 500) {
                message.error(response._data.message)
            }
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
//文集接口(管理员)
export const notebookFetch = (opt: FetchOptions) => {
    return useHTTPFetch('/api/note/notebook', opt)
}
//按照分类获取文章接口(管理员)
export const notesFetch = (opt: FetchOptions) => {
    return useHTTPFetch('/api/note/notes', opt)
}

//文章接口（管理员）
export const noteFetch = (opt: FetchOptions) => {
    return useHTTPFetch('/api/note/note', opt)
}
//图片上传接口(管理员)
export const imageFetch = (opt: FetchOptions) => {
    return useHTTPFetch('/api/note/image', opt)
}
//图片上传接口-cos(管理员)
export const imageCosFetch = (opt: FetchOptions) => {
    return useHTTPFetch('/api/note/image-cos', opt)
}