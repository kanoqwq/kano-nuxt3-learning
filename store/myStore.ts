import {defineStore} from "pinia";

export const useMyStore = defineStore('myStore', {
    state() {
        return {
            counter: 1
        }
    },
    getters: {
        doubleCounter: (state) => state.counter * 2
    },
    actions: {
        add() {
            this.counter++
        }
    },
    // // 由于localStorage只能在客户端使用，所以需要先声明: process.client
    // persist: process.client && {
    //     storage: localStorage,
    // }
    persist: {
        storage: piniaPluginPersistedstate.cookies(),
        pick:['counter'],
        // storage: piniaPluginPersistedstate.localStorage()
        // paths:['counter']
    }
})