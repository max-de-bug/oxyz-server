import { DrizzleService } from '../drizzle/drizzle.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateDesignDto } from './dto/create-design.dto';
export declare class DesignsService {
    private readonly cloudinaryService;
    private readonly drizzle;
    constructor(cloudinaryService: CloudinaryService, drizzle: DrizzleService);
    saveDesign(userId: string, designData: CreateDesignDto): Promise<{
        id: string;
        name: string;
        imageUrl: string | null;
        filter: {
            brightness?: number;
            contrast?: number;
            saturation?: number;
            sepia?: number;
            opacity?: number;
        } | undefined;
        textOverlay: {
            text: string;
            color: string;
            fontFamily: string;
            fontSize?: number;
            isBold?: boolean;
            isItalic?: boolean;
            isVisible?: boolean;
        } | undefined;
        logos: {
            url: string;
            position: {
                x: number;
                y: number;
            };
            size?: number;
        }[] | undefined;
        aspectRatio: string;
        createdAt: Date;
    }>;
    getDesigns(userId: string): Promise<{
        id: string;
        name: string;
        imageUrl: string | null;
        filter: any;
        textOverlay: any;
        logos: any;
        aspectRatio: any;
        createdAt: Date;
    }[]>;
    deleteDesign(userId: string, designId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
