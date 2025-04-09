import { DrizzleService } from '../drizzle/drizzle.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
export declare class ImagesService {
    private readonly cloudinaryService;
    private readonly drizzle;
    constructor(cloudinaryService: CloudinaryService, drizzle: DrizzleService);
    uploadImage(file: Express.Multer.File, userId: string): Promise<{
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        size: number;
        width: number | null;
        height: number | null;
        public_id: string | null;
        mime_type: string;
        created_at: Date;
        updated_at: Date;
    }[]>;
    getUserImages(userId: string): Promise<{
        images: any[];
        total: number;
    }>;
    findAll(userId: string): Promise<{
        publicId: string | null;
        mimeType: string;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        size: number;
        width: number | null;
        height: number | null;
        public_id: string | null;
        mime_type: string;
        created_at: Date;
        updated_at: Date;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        size: number;
        width: number | null;
        height: number | null;
        public_id: string | null;
        mime_type: string;
        created_at: Date;
        updated_at: Date;
    }>;
    create(file: Express.Multer.File, createImageDto: CreateImageDto, userId: string): Promise<{
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        size: number;
        width: number | null;
        height: number | null;
        public_id: string | null;
        mime_type: string;
        created_at: Date;
        updated_at: Date;
    }>;
    update(id: string, updateImageDto: UpdateImageDto, userId: string): Promise<{
        id: string;
        userId: string | null;
        url: string;
        filename: string;
        size: number;
        width: number | null;
        height: number | null;
        public_id: string | null;
        mime_type: string;
        created_at: Date;
        updated_at: Date;
    }>;
    deleteImage(publicId: string, userId: string, folder?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    remove(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    findAllFromCloudinary(folder: string | undefined, userId: string): Promise<{
        images: {
            id: any;
            url: any;
            filename: any;
            mimeType: string;
            size: any;
            width: any;
            height: any;
            publicId: any;
            createdAt: any;
            updatedAt: any;
        }[];
        total: number;
    }>;
    findOneFromCloudinary(publicId: string, userId: string): Promise<{
        id: any;
        url: any;
        filename: any;
        mimeType: string;
        size: any;
        width: any;
        height: any;
        publicId: any;
        createdAt: any;
        updatedAt: any;
    }>;
    getDefaultUserImage(): Promise<{
        url: any;
        publicId: any;
        width: any;
        height: any;
    }>;
}
