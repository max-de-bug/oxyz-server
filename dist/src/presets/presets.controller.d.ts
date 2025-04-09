import { PresetsService } from './presets.service';
export declare class PresetsController {
    private readonly presetsService;
    constructor(presetsService: PresetsService);
    findAll(req: any, source?: string, folder?: string, includeDefaults?: string): Promise<{
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
    }[] | {
        resources: never[];
        next_cursor?: undefined;
    } | {
        resources: any[];
        next_cursor: string | null | undefined;
    }>;
    findAllFromCloudinary(req: any, includeDefaults?: string): Promise<{
        resources: never[];
        next_cursor?: undefined;
    } | {
        resources: any[];
        next_cursor: string | null | undefined;
    }> | {
        resources: never[];
    };
    findOne(id: string, req: any): Promise<{
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
    create(createPresetDto: any, req: any): Promise<{
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
    update(id: string, updatePresetDto: any, req: any): Promise<{
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
    setDefault(id: string, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        id: string;
    }>;
}
