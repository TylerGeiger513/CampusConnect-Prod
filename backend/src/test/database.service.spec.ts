import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '../config/config.service';
import { getConnectionToken } from '@nestjs/mongoose';

const fakeRedisClient = {
  ping: jest.fn().mockResolvedValue('PONG'),
};
const fakeMongoConnection = { readyState: 1 };

describe('DatabaseService', () => {
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: {
            mongoUri: 'mongodb://mongo:27017/testdb',
            redisUri: 'redis://redis:6379',
          },
        },
        { provide: 'REDIS_CLIENT', useValue: fakeRedisClient },
        { provide: getConnectionToken(), useValue: fakeMongoConnection },
      ],
    }).compile();

    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should ping Redis successfully', async () => {
    const reply = await databaseService.pingRedis();
    expect(reply).toBe('PONG');
    expect(fakeRedisClient.ping).toHaveBeenCalled();
  });

  it('should confirm MongoDB health when ready', async () => {
    await expect(databaseService.mongoHealthCheck()).resolves.toBeUndefined();
  });

  it('should throw an error when MongoDB is not connected', async () => {
    fakeMongoConnection.readyState = 0;
    await expect(databaseService.mongoHealthCheck()).rejects.toThrow('MongoDB is not connected');
  });
});
