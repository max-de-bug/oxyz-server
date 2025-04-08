import { ImagesService } from './images.service';
export declare class ImagesController {
    private readonly imagesService;
    constructor(imagesService: ImagesService);
    uploadImage(file: Express.Multer.File, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    removeFromCloudinary(publicId: string, folder: string | undefined, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
