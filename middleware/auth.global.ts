export default defineNuxtRouteMiddleware((to, from) => {
    console.log('路由中间件正在工作：', to)
})