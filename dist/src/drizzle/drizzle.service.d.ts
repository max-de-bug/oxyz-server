import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
export declare class DrizzleService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private client;
    db: ReturnType<typeof drizzle<typeof schema>>;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
}
