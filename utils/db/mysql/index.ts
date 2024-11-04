import mysql from "mysql2/promise";
export const getDB = ()=>{
    //链接池
    return mysql.createPool({
        host: "127.0.0.1",
        user: "root",
        password: "123456",
        port: 3306,
        database: "jbook",
        waitForConnections: true,
        queueLimit: 0
    });
}