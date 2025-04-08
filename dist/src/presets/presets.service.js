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
var PresetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresetsService = void 0;
const common_1 = require("@nestjs/common");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let PresetsService = PresetsService_1 = class PresetsService {
    cloudinaryService;
    logger = new common_1.Logger(PresetsService_1.name);
    constructor(cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    async findAll(userId) {
        return schema_1.db.select().from(schema_1.presets).where((0, drizzle_orm_1.eq)(schema_1.presets.userId, userId));
    }
    async findAllFromCloudinary(folder = 'presets', userId, options = {}) {
        console.log('DEBUGGING: findAllFromCloudinary called with:', {
            folder,
            userId,
            options,
        });
        this.logger.debug(`Finding all presets from Cloudinary for user ${userId} in folder ${folder}`);
        try {
            console.log('DEBUGGING: Before includeDefaults check');
            const includeDefaults = options.includeDefaults !== false;
            console.log('DEBUGGING: includeDefaults =', includeDefaults);
            console.log('DEBUGGING: Before cloudinaryService call');
            if (!this.cloudinaryService) {
                console.error('DEBUGGING: cloudinaryService is not defined!');
                return { resources: [] };
            }
            if (typeof this.cloudinaryService.getResourcesByBaseFolder !== 'function') {
                console.error('DEBUGGING: getResourcesByBaseFolder method does not exist!');
                return { resources: [] };
            }
            console.log('DEBUGGING: Calling getResourcesByBaseFolder with:', {
                folder,
                userId,
                includeDefaults,
            });
            try {
                const cloudinaryResult = await this.cloudinaryService.getResourcesByBaseFolder(folder, userId, { includeDefaults });
                console.log('DEBUGGING: After getResourcesByBaseFolder call');
                console.log('DEBUGGING: cloudinaryResult =', JSON.stringify(cloudinaryResult, null, 2));
                if (!cloudinaryResult ||
                    !cloudinaryResult.resources ||
                    !Array.isArray(cloudinaryResult.resources)) {
                    console.log('DEBUGGING: No resources found or invalid structure');
                    this.logger.warn('No resources found in Cloudinary');
                    return { resources: [] };
                }
                console.log('DEBUGGING: Found resources:', cloudinaryResult.resources.length);
                const cloudinaryPresets = cloudinaryResult.resources.map((resource) => ({
                    id: resource.public_id,
                    url: resource.secure_url,
                    filename: resource.public_id.split('/').pop() || resource.public_id,
                    mimeType: `image/${resource.format || 'jpeg'}`,
                    size: resource.bytes || 0,
                    width: resource.width || 0,
                    height: resource.height || 0,
                    publicId: resource.public_id,
                    isDefault: resource.public_id.includes('_defaults/') ||
                        (resource.tags && resource.tags.includes('default')) ||
                        false,
                    createdAt: resource.created_at || new Date().toISOString(),
                    updatedAt: resource.created_at || new Date().toISOString(),
                }));
                const dbPresets = await this.findAll(userId);
                const dbPresetMap = new Map();
                for (const preset of dbPresets) {
                    if (preset.id) {
                        dbPresetMap.set(preset.id, preset);
                    }
                }
                return {
                    resources: cloudinaryPresets.map((cloudPreset) => {
                        const dbPreset = dbPresetMap.get(cloudPreset.publicId);
                        return dbPreset ? { ...cloudPreset, ...dbPreset } : cloudPreset;
                    }),
                    next_cursor: cloudinaryResult.next_cursor,
                };
            }
            catch (innerError) {
                console.error('DEBUGGING: Error in getResourcesByBaseFolder call:', innerError);
                throw innerError;
            }
        }
        catch (error) {
            console.error('DEBUGGING: Error in findAllFromCloudinary:', error);
            this.logger.error(`Error fetching presets from Cloudinary: ${error.message}`);
            return { resources: [] };
        }
    }
    async findOne(id, userId) {
        const results = await schema_1.db
            .select()
            .from(schema_1.presets)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.presets.id, id), (0, drizzle_orm_1.eq)(schema_1.presets.userId, userId)));
        return results[0];
    }
    async create(createPresetDto, userId) {
        const existingPresets = await this.findAll(userId);
        const isDefault = existingPresets.length === 0;
        const result = await schema_1.db.insert(schema_1.presets).values({
            ...createPresetDto,
            userId,
            isDefault,
        });
        return this.findOne(result[0], userId);
    }
    async update(id, updatePresetDto, userId) {
        await schema_1.db
            .update(schema_1.presets)
            .set(updatePresetDto)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.presets.id, id), (0, drizzle_orm_1.eq)(schema_1.presets.userId, userId)));
        return this.findOne(id, userId);
    }
    async remove(id, userId) {
        await schema_1.db
            .delete(schema_1.presets)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.presets.id, id), (0, drizzle_orm_1.eq)(schema_1.presets.userId, userId)));
        return { id };
    }
    async setDefault(id, userId) {
        await schema_1.db
            .update(schema_1.presets)
            .set({ isDefault: false })
            .where((0, drizzle_orm_1.eq)(schema_1.presets.userId, userId));
        await schema_1.db
            .update(schema_1.presets)
            .set({ isDefault: true })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.presets.id, id), (0, drizzle_orm_1.eq)(schema_1.presets.userId, userId)));
        return this.findOne(id, userId);
    }
};
exports.PresetsService = PresetsService;
exports.PresetsService = PresetsService = PresetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService])
], PresetsService);
//# sourceMappingURL=presets.service.js.map