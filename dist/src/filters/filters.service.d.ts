import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { Filter } from './interfaces/filter.interface';
export declare class FiltersService {
    private readonly cloudinaryService;
    private readonly logger;
    constructor(cloudinaryService: CloudinaryService);
    create(createFilterDto: CreateFilterDto, userId: string): Promise<Filter>;
    findAll(userId: string, options?: {
        includeDefaults?: boolean;
    }): Promise<Filter[]>;
    findOne(id: string, userId: string): Promise<Filter>;
    remove(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    private generateFilterThumbnail;
}
