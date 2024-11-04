interface FetchOptions {
    headers?: Record<string, string>;

    [key: string]: any;
}

export const useHTTPFetch = (url: string, opt: FetchOptions) => {
    //添加请求头
    const token = useCookie('token')

    return useFetch(url, {
        ...opt,
        baseURL: '',
        onRequest({request, options}) {
            // 设置请求头
            options.headers = {
                ...options.headers,
                ...(token ? {Authorization: `Bearer ${token}`} : {})
            }
            console.log(request)
        },
        onRequestError({request, options, error}) {
            //
            console.error(error);
        },
        onResponse({request, response, options}) {
            // 处理响应数据
            // localStorage.setItem('token', response._data.token)
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

