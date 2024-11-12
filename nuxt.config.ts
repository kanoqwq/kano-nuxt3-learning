// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: {enabled: false},
    modules: ['@ant-design-vue/nuxt', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', '@nuxt/icon'],
    antd: {
        // Options
    },
    vite: {
        //去除掉console和debugger（生产环境）
        esbuild: {
            drop: process.env.NODE_ENV == "production" ? ['console', 'debugger'] : []
        },
        ssr: {
            //作为外部模块，不打包在一起
            noExternal: ['ant-design-vue'],
        },
        build: {
            minify: 'esbuild',
            chunkSizeWarningLimit: 500,
            cssCodeSplit: true,

        }
    },

    build: {
        //生产环境下Joi bug解决
        transpile: ['@hapi','@sideway'],
    },
    runtimeConfig: {
        // 使用 useRuntimeConfig 可以获取这些数据
        //敏感数据
        bucket: process.env["BUCKET_NAME"],
        region: process.env["BUCKET_REGION"],
        secretId: process.env["SECRET_ID"],
        secretKey: process.env["SECRET_KEY"],
        nodeEnv: process.env["NODE_ENV"],
        mysqlHost: process.env["MYSQL_HOST"],
        mysqlUser: process.env["MYSQL_USER"],
        mysqlPassword: process.env["MYSQL_PASSWORD"],
        mysqlPort: process.env["MYSQL_PORT"],
        mysqlDatabase: process.env["MYSQL_DATABASE"],

        public: {
            //公开数据
            api: ''
        }
    }
})