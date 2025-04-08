import { DrizzleService } from '../drizzle/drizzle.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class UsersService {
    private drizzle;
    private cloudinaryService;
    private readonly logger;
    constructor(drizzle: DrizzleService, cloudinaryService: CloudinaryService);
    getProfile(userId: string): Promise<{
        id: string;
        name: string | null;
        email: string;
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
    updateUsername(userId: string, username: string): Promise<{
        id: string;
        name: string | null;
        email: string;
        emailVerified: Date | null;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
