import { DrizzleService } from '../drizzle/drizzle.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto } from './dto/update-logo.dto';
export declare class LogosService {
    private drizzle;
    private cloudinary;
    constructor(drizzle: DrizzleService, cloudinary: CloudinaryService);
    findAll(userId: string, isDefault?: boolean): Promise<{
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        mimeType: string;
        publicId: string | null;
        size: number;
        width: number | null;
        height: number | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        mimeType: string;
        publicId: string | null;
        size: number;
        width: number | null;
        height: number | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(file: Express.Multer.File, createLogoDto: CreateLogoDto, userId: string): Promise<{
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        mimeType: string;
        publicId: string | null;
        size: number;
        width: number | null;
        height: number | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateLogoDto: UpdateLogoDto, userId: string): Promise<{
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        mimeType: string;
        publicId: string | null;
        size: number;
        width: number | null;
        height: number | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    setDefault(id: string, userId: string): Promise<{
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        mimeType: string;
        publicId: string | null;
        size: number;
        width: number | null;
        height: number | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllFromCloudinary(folder: string | undefined, userId: string, options?: {
        includeDefaults?: boolean;
    }): Promise<({
        id: any;
        url: any;
        filename: any;
        mimeType: string;
        size: any;
        width: any;
        height: any;
        publicId: any;
        isDefault: boolean;
        createdAt: any;
        updatedAt: any;
    } | {
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        mimeType: string;
        publicId: string | null;
        size: number;
        width: number | null;
        height: number | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    })[] | {
        resources: {
            id: any;
            url: any;
            filename: any;
            mimeType: string;
            size: any;
            width: any;
            height: any;
            publicId: any;
            isDefault: any;
            createdAt: any;
            updatedAt: any;
        }[];
        next_cursor: string | null | undefined;
    }>;
    findOneFromCloudinary(publicId: string, userId: string): Promise<{
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        mimeType: string;
        publicId: string | null;
        size: number;
        width: number | null;
        height: number | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    } | {
        id: any;
        url: any;
        filename: any;
        mimeType: string;
        size: any;
        width: any;
        height: any;
        publicId: any;
        isDefault: boolean;
        createdAt: any;
        updatedAt: any;
    }>;
}
