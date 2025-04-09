import { TypographyService } from './typography.service';
import { UpdateTypographyDto } from './dto/update-typography.dto';
import { CreateTypographyDto } from './dto/create-typography.dto';
export declare class TypographyController {
    private readonly typographyService;
    constructor(typographyService: TypographyService);
    getPublicTypography(): void;
    getTypography(req: any): Promise<{
        id: string;
        name: string;
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
    findOneFromCloudinary(publicId: string, req: any): Promise<{
        id: string;
        name: string;
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
        name: any;
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
    create(file: Express.Multer.File, createTypographyDto: CreateTypographyDto, req: any): Promise<{
        id: string;
        name: string;
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
    update(id: string, updateTypographyDto: UpdateTypographyDto, req: any): Promise<{
        id: string;
        name: string;
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
    remove(id: string, req: any): Promise<import("postgres").RowList<never[]>>;
}
