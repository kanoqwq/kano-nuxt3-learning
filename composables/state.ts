//服务器会预处理,setup函数中直接使用，无需import
export const useUserInfo = () => useState('userInfo', () => {
    const userInfo = useCookie('userInfo');
    return userInfo.value ? userInfo.value : null;
})