import { UsersService } from './users.service';
import { Request } from 'express';
export declare class UsersController {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    getProfile(req: Request): Promise<{
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateUsername(req: Request, body: {
        username: string;
    }): Promise<{
        id: string;
        name: string | null;
        email: string;
        emailVerified: Date | null;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getDefaultUserImage(): Promise<{
        url: any;
        publicId: any;
        width: any;
        height: any;
    }>;
}
