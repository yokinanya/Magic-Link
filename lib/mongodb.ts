import { MongoClient } from 'mongodb';

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// 安全的MongoDB连接配置
const mongoOptions = {
    // 设置连接超时
    serverSelectionTimeoutMS: 5000,
    // 设置socket超时
    socketTimeoutMS: 45000,
    // 设置连接池大小
    maxPoolSize: 10,
    // 设置最小连接池大小
    minPoolSize: 1,
    // 设置连接最大空闲时间
    maxIdleTimeMS: 30000,
    // 设置等待连接超时时间
    waitQueueTimeoutMS: 10000,
    // 启用重试机制
    retryWrites: true
};

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, mongoOptions);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, mongoOptions);
    clientPromise = client.connect();
}

export default clientPromise;

