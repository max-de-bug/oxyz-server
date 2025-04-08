import { Strategy } from 'passport-custom';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { DrizzleService } from '../../drizzle/drizzle.service';
declare const SupabaseStrategy_base: new () => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class SupabaseStrategy extends SupabaseStrategy_base {
    private configService;
    private usersService;
    private drizzle;
    private readonly logger;
    constructor(configService: ConfigService, usersService: UsersService, drizzle: DrizzleService);
    validate(request: any): Promise<{
        id: string;
        name: string | null;
        email: string;
        emailVerified: Date | null;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private decodeToken;
    private findOrCreateUser;
    private extractTokenFromHeader;
}
export {};
