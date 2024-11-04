//服务器会预处理
export const useConter = () => useState('counter', () => 1)
export const userInfoCookie = () => useCookie('userInfo', {
    maxAge: 60, secure: true,
    default() {
        return {
            uid: 123,
            username: '张三'
        }
    }
})//秒
