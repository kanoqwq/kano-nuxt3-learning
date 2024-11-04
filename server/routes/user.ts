import {defineEventHandler} from "h3";
// 在routes里面就不需要加/api了
// "/user"
export default defineEventHandler(() => {
    return {
        uid: '123'
    }
})