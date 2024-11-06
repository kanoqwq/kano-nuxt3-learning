//服务器会预处理,setup函数中直接使用，无需import
export const useConter = () => useState('counter', () => 1)
export const useTokenCookie = () => useCookie('accessToken', {
    maxAge: 60 * 60 * 24 * 7,
    secure: true
})//秒
