import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class PresetsService {
    private readonly cloudinaryService;
    private readonly logger;
    constructor(cloudinaryService: CloudinaryService);
    findAll(userId: string): Promise<{
        id: string;
        userId: string | null;
        name: string;
        filter: {
            brightness?: number;
            contrast?: number;
            saturation?: number;
            sepia?: number;
        } | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAllFromCloudinary(folder: string | undefined, userId: string, options?: {
        includeDefaults?: boolean;
    }): Promise<{
        resources: never[];
        next_cursor?: undefined;
    } | {
        resources: any[];
        next_cursor: string | null | undefined;
    }>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        userId: string | null;
        name: string;
        filter: {
            brightness?: number;
            contrast?: number;
            saturation?: number;
            sepia?: number;
        } | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(createPresetDto: any, userId: string): Promise<{
        id: string;
        userId: string | null;
        name: string;
        filter: {
            brightness?: number;
            contrast?: number;
            saturation?: number;
            sepia?: number;
        } | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updatePresetDto: any, userId: string): Promise<{
        id: string;
        userId: string | null;
        name: string;
        filter: {
            brightness?: number;
            contrast?: number;
            saturation?: number;
            sepia?: number;
        } | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
    }>;
    setDefault(id: string, userId: string): Promise<{
        id: string;
        userId: string | null;
        name: string;
        filter: {
            brightness?: number;
            contrast?: number;
            saturation?: number;
            sepia?: number;
        } | null;
        isDefault: boolean | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
