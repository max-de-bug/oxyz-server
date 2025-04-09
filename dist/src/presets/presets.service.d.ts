import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class PresetsService {
    private readonly cloudinaryService;
    private readonly logger;
    constructor(cloudinaryService: CloudinaryService);
    findAll(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        filter: {
            brightness?: number;
            contrast?: number;
            saturation?: number;
            sepia?: number;
        } | null;
        isDefault: boolean | null;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        filter: {
            brightness?: number;
            contrast?: number;
            saturation?: number;
            sepia?: number;
        } | null;
        isDefault: boolean | null;
    }>;
    create(createPresetDto: any, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        filter: {
            brightness?: number;
            contrast?: number;
            saturation?: number;
            sepia?: number;
        } | null;
        isDefault: boolean | null;
    }>;
    update(id: string, updatePresetDto: any, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        filter: {
            brightness?: number;
            contrast?: number;
            saturation?: number;
            sepia?: number;
        } | null;
        isDefault: boolean | null;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
    }>;
    setDefault(id: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        filter: {
            brightness?: number;
            contrast?: number;
            saturation?: number;
            sepia?: number;
        } | null;
        isDefault: boolean | null;
    }>;
}
