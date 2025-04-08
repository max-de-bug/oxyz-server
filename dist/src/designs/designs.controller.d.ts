import { DesignsService } from './designs.service';
import { CreateDesignDto } from './dto/create-design.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
export declare class DesignsController {
    private readonly designsService;
    private readonly cloudinaryService;
    constructor(designsService: DesignsService, cloudinaryService: CloudinaryService);
    saveDesign(req: any, createDesignDto: CreateDesignDto): Promise<{
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
    getDesigns(req: any): Promise<{
        id: string;
        name: string;
        imageUrl: string | null;
        filter: any;
        textOverlay: any;
        logos: any;
        aspectRatio: any;
        createdAt: Date;
    }[]>;
    deleteDesign(req: any, designId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAssetsByFolder(folder: string, req: any, maxResults?: number): Promise<import("../cloudinary/interfaces/cloudinary.interfaces").CloudinaryResponse>;
}
