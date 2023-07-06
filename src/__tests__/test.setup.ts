import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const setupMongoMemoryServer = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();

  const mongoUri = await mongoServer.getUri();

  await mongoose.connect(mongoUri);
};

export const tearDownMongoMemoryServer = async (): Promise<void> => {
  await mongoose.disconnect();
  await mongoServer.stop();
};
