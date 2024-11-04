export default defineNuxtPlugin(() => {
    return {
        provide: {
            myPlugin: (msg: string) => `hello ${msg}`
        }
    }
})