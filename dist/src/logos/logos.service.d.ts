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
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        isDefault: boolean | null;
        url: string;
        publicId: string | null;
        filename: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        isDefault: boolean | null;
        url: string;
        publicId: string | null;
        filename: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
    }>;
    create(file: Express.Multer.File, createLogoDto: CreateLogoDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        isDefault: boolean | null;
        url: string;
        publicId: string | null;
        filename: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
    }>;
    update(id: string, updateLogoDto: UpdateLogoDto, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        isDefault: boolean | null;
        url: string;
        publicId: string | null;
        filename: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
    }>;
    remove(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    setDefault(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        isDefault: boolean | null;
        url: string;
        publicId: string | null;
        filename: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
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
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        isDefault: boolean | null;
        url: string;
        publicId: string | null;
        filename: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
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
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        isDefault: boolean | null;
        url: string;
        publicId: string | null;
        filename: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
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
