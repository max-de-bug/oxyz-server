import { PresetsService } from './presets.service';
export declare class PresetsController {
    private readonly presetsService;
    constructor(presetsService: PresetsService);
    findAll(req: any, source?: string, folder?: string, includeDefaults?: string): Promise<{
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
    create(createPresetDto: any, req: any): Promise<{
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
    update(id: string, updatePresetDto: any, req: any): Promise<{
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
    setDefault(id: string, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        id: string;
    }>;
}
