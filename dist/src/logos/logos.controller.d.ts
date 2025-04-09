import { LogosService } from './logos.service';
import { UpdateLogoDto } from './dto/update-logo.dto';
export declare class LogosController {
    private readonly logosService;
    constructor(logosService: LogosService);
    findAll(req: any, source?: string, folder?: string, includeDefaults?: string): Promise<({
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
    findOneFromCloudinary(publicId: string, req: any): Promise<{
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
    findOne(id: string, req: any): Promise<{
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
    update(id: string, updateLogoDto: UpdateLogoDto, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
