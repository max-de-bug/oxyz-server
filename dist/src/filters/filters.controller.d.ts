import { FiltersService } from './filters.service';
import { CreateFilterDto } from './dto/create-filter.dto';
export declare class FiltersController {
    private readonly filtersService;
    constructor(filtersService: FiltersService);
    create(createFilterDto: CreateFilterDto, req: any): Promise<import("./interfaces/filter.interface").Filter>;
    findAll(req: any, includeDefaults?: string): Promise<import("./interfaces/filter.interface").Filter[]>;
    findOne(id: string, req: any): Promise<import("./interfaces/filter.interface").Filter>;
    remove(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
