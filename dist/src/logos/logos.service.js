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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogosService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const schema_2 = require("../drizzle/schema");
let LogosService = class LogosService {
    drizzle;
    cloudinary;
    constructor(drizzle, cloudinary) {
        this.drizzle = drizzle;
        this.cloudinary = cloudinary;
    }
    async findAll(userId, isDefault) {
        let conditions = [(0, drizzle_orm_1.eq)(schema_1.logos.userId, userId)];
        if (isDefault !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.logos.isDefault, isDefault));
        }
        const results = await this.drizzle.db
            .select()
            .from(schema_1.logos)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(schema_1.logos.createdAt);
        return results;
    }
    async findOne(id, userId) {
        const [logo] = await this.drizzle.db
            .select()
            .from(schema_1.logos)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.logos.id, id), (0, drizzle_orm_1.eq)(schema_1.logos.userId, userId)));
        if (!logo) {
            throw new common_1.NotFoundException(`Logo with ID ${id} not found`);
        }
        return logo;
    }
    async create(file, createLogoDto, userId) {
        const uploadResult = await this.cloudinary.uploadFile(file, 'logos', userId);
        const existingLogos = await this.findAll(userId);
        const isDefault = existingLogos.length === 0;
        if (isDefault) {
            await this.cloudinary.addTags(uploadResult.public_id, ['default']);
        }
        const result = (await schema_2.db.insert(schema_1.logos).values({
            userId,
            url: uploadResult.secure_url,
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            width: uploadResult.width,
            height: uploadResult.height,
            publicId: uploadResult.public_id,
            isDefault,
        }));
        return this.findOne(result[0].id, userId);
    }
    async update(id, updateLogoDto, userId) {
        const logo = await this.findOne(id, userId);
        const updatedLogo = {
            ...logo,
            isDefault: updateLogoDto.isDefault !== undefined
                ? updateLogoDto.isDefault
                : logo.isDefault,
            updatedAt: new Date(),
        };
        await this.drizzle.db
            .update(schema_1.logos)
            .set(updatedLogo)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.logos.id, id), (0, drizzle_orm_1.eq)(schema_1.logos.userId, userId)));
        return this.findOne(id, userId);
    }
    async remove(id, userId) {
        const logo = await this.findOne(id, userId);
        if (logo.publicId) {
            await this.cloudinary.deleteFile(logo.publicId);
        }
        await this.drizzle.db
            .delete(schema_1.logos)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.logos.id, id), (0, drizzle_orm_1.eq)(schema_1.logos.userId, userId)));
        return { success: true };
    }
    async setDefault(id, userId) {
        await this.drizzle.db
            .update(schema_1.logos)
            .set({ isDefault: false })
            .where((0, drizzle_orm_1.eq)(schema_1.logos.userId, userId));
        await this.drizzle.db
            .update(schema_1.logos)
            .set({ isDefault: true })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.logos.id, id), (0, drizzle_orm_1.eq)(schema_1.logos.userId, userId)));
        return this.findOne(id, userId);
    }
    async findAllFromCloudinary(folder = 'logos', userId, options = {}) {
        try {
            const includeDefaults = options.includeDefaults !== false;
            if (typeof this.cloudinary.getResourcesByBaseFolder === 'function') {
                const cloudinaryResult = await this.cloudinary.getResourcesByBaseFolder(folder, userId, { includeDefaults });
                console.log('cloudinaryResult', cloudinaryResult);
                const cloudinaryLogos = cloudinaryResult.resources.map((resource) => ({
                    id: resource.public_id,
                    url: resource.secure_url,
                    filename: resource.public_id.split('/').pop() || resource.public_id,
                    mimeType: `image/${resource.format}`,
                    size: resource.bytes,
                    width: resource.width,
                    height: resource.height,
                    publicId: resource.public_id,
                    isDefault: resource.public_id.includes('/defaults/') ||
                        resource.tags?.includes('default') ||
                        false,
                    createdAt: resource.created_at,
                    updatedAt: resource.created_at,
                }));
                const dbLogos = await this.findAll(userId);
                const dbLogoMap = new Map(dbLogos.map((logo) => [logo.publicId, logo]));
                return {
                    resources: cloudinaryLogos.map((cloudLogo) => {
                        const dbLogo = dbLogoMap.get(cloudLogo.publicId);
                        return dbLogo ? { ...cloudLogo, ...dbLogo } : cloudLogo;
                    }),
                    next_cursor: cloudinaryResult.next_cursor,
                };
            }
            else {
                const cloudinaryResult = await this.cloudinary.getResourcesByFolder(folder);
                const cloudinaryLogos = cloudinaryResult.resources.map((resource) => ({
                    id: resource.public_id,
                    url: resource.secure_url,
                    filename: resource.public_id.split('/').pop() || resource.public_id,
                    mimeType: resource.resource_type + '/' + resource.format,
                    size: resource.bytes,
                    width: resource.width,
                    height: resource.height,
                    publicId: resource.public_id,
                    isDefault: false,
                    createdAt: resource.created_at,
                    updatedAt: resource.created_at,
                }));
                const dbLogos = await this.findAll(userId);
                const dbLogoMap = new Map(dbLogos.map((logo) => [logo.publicId, logo]));
                return cloudinaryLogos.map((cloudLogo) => {
                    const dbLogo = dbLogoMap.get(cloudLogo.publicId);
                    return dbLogo ? { ...cloudLogo, ...dbLogo } : cloudLogo;
                });
            }
        }
        catch (error) {
            console.error('Error fetching logos from Cloudinary:', error);
            return this.findAll(userId);
        }
    }
    async findOneFromCloudinary(publicId, userId) {
        try {
            const cloudinaryResult = await this.cloudinary.getResourcesByIds([
                publicId,
            ]);
            if (!cloudinaryResult.resources ||
                cloudinaryResult.resources.length === 0) {
                throw new common_1.NotFoundException('Logo not found in Cloudinary');
            }
            const resource = cloudinaryResult.resources[0];
            const cloudinaryLogo = {
                id: resource.public_id,
                url: resource.secure_url,
                filename: resource.public_id.split('/').pop(),
                mimeType: resource.resource_type + '/' + resource.format,
                size: resource.bytes,
                width: resource.width,
                height: resource.height,
                publicId: resource.public_id,
                isDefault: false,
                createdAt: resource.created_at,
                updatedAt: resource.created_at,
            };
            try {
                const dbLogos = await schema_2.db
                    .select()
                    .from(schema_1.logos)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.logos.publicId, publicId), (0, drizzle_orm_1.eq)(schema_1.logos.userId, userId)))
                    .limit(1);
                if (dbLogos.length > 0) {
                    return { ...cloudinaryLogo, ...dbLogos[0] };
                }
            }
            catch (dbError) {
                console.error('Error fetching logo from database:', dbError);
            }
            return cloudinaryLogo;
        }
        catch (error) {
            console.error('Error fetching logo from Cloudinary:', error);
            const dbLogos = await schema_2.db
                .select()
                .from(schema_1.logos)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.logos.publicId, publicId), (0, drizzle_orm_1.eq)(schema_1.logos.userId, userId)))
                .limit(1);
            if (dbLogos.length > 0) {
                return dbLogos[0];
            }
            throw new common_1.NotFoundException('Logo not found');
        }
    }
};
exports.LogosService = LogosService;
exports.LogosService = LogosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService,
        cloudinary_service_1.CloudinaryService])
], LogosService);
//# sourceMappingURL=logos.service.js.map