//@ts-ignore
import mysql, {Pool, PoolConnection} from 'mysql2/promise';

const config: any = useRuntimeConfig();

export class MySqlConnection {
    private static instance: MySqlConnection;
    private pool: Pool;

    private constructor() {
        console.log('Creating MySQLPoolSingleton instance'); // Add this line
        // Set up your MySQL connection pool parameters
        const poolConfig: mysql.PoolOptions = {
            host: config.mysqlHost,
            user: config.mysqlUser,
            password: config.mysqlPassword,
            port: config.mysqlPort,
            database:  config.mysqlDatabase,
            waitForConnections: true,
            queueLimit: 0,
            connectionLimit: 10,
            idleTimeout: 5000,
        };
        this.pool = mysql.createPool(poolConfig);
    }

    public static getInstance(): MySqlConnection {
        if (!MySqlConnection.instance) {
            MySqlConnection.instance = new MySqlConnection();
        }
        return MySqlConnection.instance;
    }

    public async getConnection(): Promise<PoolConnection> {
        return this.pool.getConnection();
    }

    // You can add other methods or configurations as needed

    public async end(): Promise<void> {
        await this.pool.end();
    }
}

const con = MySqlConnection.getInstance();

export const Connection = con