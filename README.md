## 写在前面

> **真心建议通读一遍Nuxt.js的[API文档](https://nuxt.com.cn/docs/api/ "API文档")，能少走很多弯路！**
> **真心建议通读一遍Nuxt.js的[API文档](https://nuxt.com.cn/docs/api/ "API文档")，能少走很多弯路！**
> **真心建议通读一遍Nuxt.js的[API文档](https://nuxt.com.cn/docs/api/ "API文档")，能少走很多弯路！**
> **真心建议通读一遍Nuxt.js的[API文档](https://nuxt.com.cn/docs/api/ "API文档")，能少走很多弯路！**
> **真心建议通读一遍Nuxt.js的[API文档](https://nuxt.com.cn/docs/api/ "API文档")，能少走很多弯路！**

### 坑1：安装Nuxt3报错

RT,安装nuxt3报错，网络错误，Clash全局TUN也无效

```bash
➜  nuxt-in-action npx nuxi init nuxt3-app                               
Nuxi 3.x.x                                                                   
 ERROR  Failed to download template from registry: request to 
 https://raw.githubusercontent.com/nuxt/starter/templates/templates/v3.json failed, 
 reason: connect ECONNREFUSED 0.0.0.0:443
```

解决方案：**给 raw.githubusercontent.com 做一下手动hosts**

----

### 坑2：为AntD支持自动导入模块

本来按照网上教程应该使用 `unplugin-vue-components` 进行自动导入（~~CSDN害人不浅~~）,但经过仔细查询，发现更为官方的解法：[Ant-design-vue · Nuxt Modules](https://nuxt.com/modules/ant-design-vue)

```bash
yarn add ant-design-vue
npx nuxi@latest module add ant-design-vue
```

当然，这一步有可能会碰到网络问题，网络问题详见 **#坑1**

```javascript
//nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@ant-design-vue/nuxt'
  ],
  antd:{
    // Options
  }
})
```

**顺带附上老方法：**

```javascript
import Components from 'unplugin-vue-components/vite'
import {
    AntDesignVueResolver,
    ElementPlusResolver,
    VantResolver
} from "unplugin-vue-components/resolvers";

//在vite配置中添加AntD自动导入(unplugin-vue-components)
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: {enabled: true},
    vite: {
        plugins: [
            Components({
                resolvers: [
                    //新版本的antd不需要impotStyle了，使用了CSS-in-JS
                    AntDesignVueResolver({
                        importStyle: false
                    }),
                    ElementPlusResolver(),
                    VantResolver()
                ]
            })
        ]
    }
})
```

----

### 坑3:Pinia持久化配置问题

使用pinia持久化时Nuxt服务器报错`can not find localStorage`，是因为node服务端本身无这个属性，所以需要判断`process.client`

```javascript
// 由于localStorage只能在客户端使用，所以需要先声明: process.client
persist: process.client && {
    storage: localStorage,
}
```

经过查询，发现 `piniaPluginPersistedstate` 属性，即可解决该问题,[在 Nuxt 中使用 | Pinia Plugin Persistedstate](https://prazdevs.github.io/pinia-plugin-persistedstate/zh/frameworks/nuxt.html)

```javascript
import { defineStore } from 'pinia'

export const useStore = defineStore('xxx', {
  state: () => {
    //.....
  },
  //....
  persist: {
    storage: piniaPluginPersistedstate.cookies(),
  },
})
```

注：`.cookies()` 而不是 `.cookies`(~~脑抽忘写括号半天没找到错误~~)

**另外说一点，v4+版本的patchs已经改为pick:**[Release v4.0.0 · prazdevs/pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate/releases/tag/v4.0.0)

----

### 坑4：mysql2 WHERE IN 问题

[Cannot delete rows using WHERE IN · Issue #2364 · sidorares/node-mysql2](https://github.com/sidorares/node-mysql2/issues/2364)

mysql2中的sql语句执行方法`execute`可能是为了语句安全，默认一个问号只会匹配简单数据类型，不能把一个数组当作单一类型传入（也许）

这样会导致使用 `where in (?)` 时不能讲多个元素匹配到括号内：

```javascript
//无效
const [list] = await connection.execute('select * from `notes` where `uid`=? and `id` in (?) limit ? offset ?', [
    uid,
    noteIdList,
    (params.pageSize as any).toString(),
    offset.toString()
])
```

**临时解决方法：** 使用字符串拼接问号

```javascript
let strGen = noteIdList.map(() => '?').join()
const sqlQuery = 'select * from `notes` where `uid`=? and `id` in (' + strGen + ') limit ? offset ?'
const [list] = await connection.execute(sqlQuery, [
    uid,
    ...noteIdList,
    (params.pageSize as any).toString(),
    offset.toString()
])
```

----

### 坑5：在表单页面中使用封装好的useFetch，会造成多次网络请求

> **在register中使用@click调用一个async方法，再次输入表单框时会造成网络重复请求，即使我并没有点击注册按钮**

[数据获取 ·开始使用 Nuxt --- Data fetching · Get Started with Nuxt](https://nuxt.com/docs/getting-started/data-fetching)

[You are using useFetch WRONG! (I hope you don't) - YouTube](https://www.youtube.com/watch?v=njsGVmcWviY)

**经过查阅，发现这是useFetch的特性，他可以传入响应式变量，如果响应式变量发生改变，就会重新触发请求。会造成表单变化，自动重新发送请求的问题**

**而且useFetch即使传入了一个非响应式变量，请求返回的结果也是响应式的，这对前端直接取值来说确实很不方便**

**所以我们只需要在页面上使用 `$fetch` ，或直接传入一个非响应式变量`（JSON.parse(JSON.stringify(state))）`即可解决这个问题**

**但实际上更优雅的解决方案且如果实在需要useFetch，可以试试下面官方推荐的办法**

解决办法：

```javascript
useFetch(url, {
        key: md5(url + opt),
        //不需要监听数据变化
        watch: false
})
```

此外，还可以将immediate设为false，这样就可以使用 `execute` 和 `refresh` 进行手动请求操作和刷新了

```javascript
const {error,data,execute,refresh} = useFetch('xxxx/xx/',{
    ....
    immediate:false,
    watch:false
})
```
---
### 坑6：客户端页面中间件中使用异步函数(例如navgateTo)问题

我在编写中间件时想通过判断后端API返回的status来判断用户是否登录，于是写了一段这样的代码(前端useFetch请求server:true)：

```javascript
export const useHTTPFetch = (url: string, opt: FetchOptions, auth = false) => {
    //添加请求头
    //。。。。
    return useFetch(url, {
		//。。。。省略配置选项
        onResponse({request, response, options}) {
            // 将在 call 和 parsing body 之后调用
            // 处理响应数据
            if (!response._data || response._data.code !== 0) {
                //弹出错误Toast
                message.error(response._data.message)
            }
        },
        onResponseError({request, response, options}) {
            //fetch 发生时将被调用
            // 处理响应错误
            if (response.status === 401) {
                navigateTo('/sign_in')
            } else if (response.status === 500) {
                message.error(response._data.message)
            }
        }
    })
}
```

这时我发现，页面不会像预期的一样跳转到登录页面

**经过查阅，我发现了 `nuxtApp.callWithNuxt` 方法， 它可以调用nuxt的上下文，这样路由跳转就得以在正确的时机执行生效**

> **请尽量少使用此方法，并报告导致问题的示例，以便最终在框架层面解决。**[useNuxtApp · Nuxt Composables](https://nuxt.com.cn/docs/api/composables/use-nuxt-app#runwithcontext)

但我在官方文档中并没有查询到该方法，仔细查阅得知，该方法在新版的Nuxt3中变更为了`nuxtApp.runWithContext`(~~~学习速度跟不上版本迭代速度了属于是~~~)

对于Nuxt的上下文解释，引用Nuxtjs官方文档的原话：

> Vue.js组合式API（以及类似的Nuxt可组合函数）依赖于隐式上下文。在生命周期中，Vue将当前组件的临时实例（Nuxt的nuxtApp临时实例）设置为全局变量，并在同一时钟周期内取消设置。在服务器端渲染时，有来自不同用户和nuxtApp的多个请求在同一个全局上下文中运行。因此，Nuxt和Vue会立即取消设置此全局实例，以避免在两个用户或组件之间泄漏共享引用。
> 这意味着，组合API和Nuxt Composables仅在生命周期内和在任何异步操作之前的同一时钟周期内可用



所以实际上正确的写法是这样的：

```javascript
//... 
async onResponseError({request, response, options}) {
    const nuxtApp = useNuxtApp()
    if (response.status === 401) {
        await nuxtApp.runWithContext(() => {
            navigateTo('/sign_in')
        })
    } else if (response.status === 500) {
        message.error(response._data.message)
    }
}
//...
```

---

### 坑6：mysql2 ‘too many connection’ 错误

由于项目需要使用到数据库，于是使用 yarn 安装了 'node-msql2'，并创建了一个连接池：

```javascript
// utils/mysql.ts
import mysql from "mysql2/promise";
export const getDB = ()=>{
    //链接池
    return mysql.createPool({
        host: -DB,
        user: -DB,
        password: -DB,
        port: -DB,
        database: -DB,
        waitForConnections: true,
        queueLimit: 0
    });
}
```

**但是在NuxtAPP中使用时，会出现 `too many connection` 报错，程序崩溃**

**以下是可能造成该问题的原因：**

> Nuxt的热重载机制可能会重复创建单例

**解决方法：**

> 创建一个静态工具类，只创建一个实例即可

问题详见：[node-mysql2:Issues-GitHub](https://github.com/sidorares/node-mysql2/issues/2362)

```javascript
import mysql, { Pool, PoolConnection } from 'mysql2/promise';
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

export class Connection {
  private static instance: Connection;
  private pool: Pool;

  private constructor() {
    console.log('Creating MySQLPoolSingleton instance'); // Add this line
    // Set up your MySQL connection pool parameters
    const poolConfig: mysql.PoolOptions = {
      host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    idleTimeout: 5000,
    queueLimit: 0,
    };

    this.pool = mysql.createPool(poolConfig);
  }

  public static getInstance(): Connection {
    if (!Connection.instance) {
      Connection.instance = new Connection();
    }

    return Connection.instance;
  }

  public async getConnection(): Promise<PoolConnection> {
    return this.pool.getConnection();
  }

  // You can add other methods or configurations as needed

  public async closePool(): Promise<void> {
    await this.pool.end();
  }
}
```

### 坑7 Joi在生产版本中报错

错误如下：

```bash
[nuxt] [request error] [unhandled] [500] Cannot find module '/mnt/d/Git/kano-nuxt3-learning/.output/server/node_modules/@hapi/hoek/lib/assert' imported from /mnt/d/Git/kano-nuxt3-learning/.output/server/chunks/routes/api/notes.get.mjs
Did you mean to import "@hapi/hoek/lib/assert.js"?
```

解决方案：

[I am using joi validator on the server, but it works in production mode but in development mode it works correctly · nuxt/nuxt · Discussion #23065](https://github.com/nuxt/nuxt/discussions/23065)

**在nuxt.config.ts添加如下代码：**

```javascript
export default defineNuxtConfig({
    ...
    build: {
        //生产环境下Joi bug解决
        transpile: ['@hapi','@sideway'],
    },
    ...
})
```

### **字段解释：**[`transpile`](https://nuxt.com.cn/docs/api/nuxt-config#transpile)

> If you want to transpile specific dependencies with Babel, you can add them here. Each item in transpile can be a package name, a function, a string or regex object matching the dependency's file name.
>
> 如果你想用 Babel 转译特定的依赖项，你可以在这里添加它们。transpile 中的每个项目都可以是与依赖项的文件名匹配的包名称、函数、字符串或正则表达式对象。

