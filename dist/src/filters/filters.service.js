"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FiltersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiltersService = void 0;
const common_1 = require("@nestjs/common");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const uuid_1 = require("uuid");
let FiltersService = FiltersService_1 = class FiltersService {
    cloudinaryService;
    logger = new common_1.Logger(FiltersService_1.name);
    constructor(cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    async create(createFilterDto, userId) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const gradientData = await this.generateFilterThumbnail(createFilterDto.filter);
        let url = undefined;
        let publicId = undefined;
        if (gradientData) {
            const buffer = Buffer.from(gradientData.split(',')[1], 'base64');
            const file = {
                buffer,
                originalname: `${createFilterDto.name.replace(/\s+/g, '-').toLowerCase()}-${id.slice(0, 8)}.png`,
                mimetype: 'image/png',
            };
            try {
                const uploadResult = await this.cloudinaryService.uploadToUserFolder(file, userId, 'filters');
                url = uploadResult?.url;
                publicId = uploadResult?.publicId;
            }
            catch (error) {
                this.logger.error(`Error uploading filter thumbnail: ${error.message}`);
            }
        }
        const dbFilter = {
            id,
            userId,
            name: createFilterDto.name,
            filter: createFilterDto.filter,
            url: url || null,
            publicId: publicId || null,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
        };
        await schema_1.db.insert(schema_1.filters).values(dbFilter);
        return {
            id,
            userId,
            name: createFilterDto.name,
            filter: createFilterDto.filter,
            url,
            publicId,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
        };
    }
    async findAll(userId, options = {}) {
        const { includeDefaults = true } = options;
        const userFilters = await schema_1.db
            .select()
            .from(schema_1.filters)
            .where((0, drizzle_orm_1.eq)(schema_1.filters.userId, userId));
        const typedUserFilters = userFilters.map((filter) => ({
            ...filter,
            userId: filter.userId || userId,
            isDefault: filter.isDefault === null ? false : filter.isDefault,
            filter: filter.filter || {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                sepia: 0,
                opacity: 100,
            },
        }));
        if (!includeDefaults) {
            return typedUserFilters;
        }
        try {
            const cloudinaryResult = await this.cloudinaryService.getResourcesByFolder('filters/defaults');
            if (!cloudinaryResult.resources ||
                cloudinaryResult.resources.length === 0) {
                return typedUserFilters;
            }
            const defaultFilters = cloudinaryResult.resources.map((resource) => {
                const filterContext = resource.context?.custom || {};
                return {
                    id: resource.public_id,
                    userId: 'system',
                    name: resource.public_id.split('/').pop() || 'Default Filter',
                    filter: {
                        brightness: parseFloat(filterContext.brightness) || 100,
                        contrast: parseFloat(filterContext.contrast) || 100,
                        saturation: parseFloat(filterContext.saturation) || 100,
                        sepia: parseFloat(filterContext.sepia) || 0,
                        opacity: parseFloat(filterContext.opacity) || 100,
                    },
                    url: resource.secure_url,
                    publicId: resource.public_id,
                    isDefault: true,
                    createdAt: resource.created_at || new Date().toISOString(),
                    updatedAt: resource.created_at || new Date().toISOString(),
                };
            });
            return [...typedUserFilters, ...defaultFilters];
        }
        catch (error) {
            this.logger.error(`Error fetching default filters: ${error.message}`);
            return typedUserFilters;
        }
    }
    async findOne(id, userId) {
        const result = await schema_1.db
            .select()
            .from(schema_1.filters)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.filters.id, id), (0, drizzle_orm_1.eq)(schema_1.filters.userId, userId)));
        if (result.length > 0) {
            const filter = result[0];
            return {
                ...filter,
                userId: filter.userId || userId,
                isDefault: filter.isDefault === null ? false : filter.isDefault,
                filter: filter.filter || {
                    brightness: 100,
                    contrast: 100,
                    saturation: 100,
                    sepia: 0,
                    opacity: 100,
                },
            };
        }
        if (id.includes('/')) {
            try {
                const resources = await this.cloudinaryService.getResourcesByIds([id]);
                if (resources.resources && resources.resources.length > 0) {
                    const resource = resources.resources[0];
                    const filterContext = resource.context?.custom || {};
                    return {
                        id: resource.public_id,
                        userId: 'system',
                        name: resource.public_id.split('/').pop() || 'Default Filter',
                        filter: {
                            brightness: parseFloat(filterContext.brightness) || 100,
                            contrast: parseFloat(filterContext.contrast) || 100,
                            saturation: parseFloat(filterContext.saturation) || 100,
                            sepia: parseFloat(filterContext.sepia) || 0,
                            opacity: parseFloat(filterContext.opacity) || 100,
                        },
                        url: resource.secure_url,
                        publicId: resource.public_id,
                        isDefault: true,
                        createdAt: resource.created_at || new Date().toISOString(),
                        updatedAt: resource.created_at || new Date().toISOString(),
                    };
                }
            }
            catch (error) {
                this.logger.error(`Error fetching filter from Cloudinary: ${error.message}`);
            }
        }
        throw new common_1.NotFoundException(`Filter with ID ${id} not found`);
    }
    async remove(id, userId) {
        const result = await schema_1.db
            .select()
            .from(schema_1.filters)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.filters.id, id), (0, drizzle_orm_1.eq)(schema_1.filters.userId, userId)));
        if (result.length === 0) {
            throw new common_1.NotFoundException(`Filter with ID ${id} not found`);
        }
        const filter = result[0];
        if (filter.publicId) {
            try {
                await this.cloudinaryService.deleteUserResource(filter.publicId, userId, 'filters');
            }
            catch (error) {
                this.logger.error(`Error deleting filter from Cloudinary: ${error.message}`);
            }
        }
        await schema_1.db
            .delete(schema_1.filters)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.filters.id, id), (0, drizzle_orm_1.eq)(schema_1.filters.userId, userId)));
        return { success: true };
    }
    async generateFilterThumbnail(filterValues) {
        try {
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAhUlEQVR42u3RAQ0AAAjDMO5fNCCDkC5z0HQ1kgICIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIAACIADfLGAXTtsVlQmY0QAAAABJRU5ErkJggg==';
        }
        catch (error) {
            this.logger.error(`Error generating filter thumbnail: ${error.message}`);
            return null;
        }
    }
};
exports.FiltersService = FiltersService;
exports.FiltersService = FiltersService = FiltersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService])
], FiltersService);
//# sourceMappingURL=filters.service.js.map