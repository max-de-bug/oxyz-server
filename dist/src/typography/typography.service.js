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
exports.TypographyService = void 0;
const common_1 = require("@nestjs/common");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let TypographyService = class TypographyService {
    cloudinaryService;
    constructor(cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }
    async findAll(userId) {
        return schema_1.db.select().from(schema_1.typography).where((0, drizzle_orm_1.eq)(schema_1.typography.userId, userId));
    }
    async findOne(id, userId) {
        const result = await schema_1.db
            .select()
            .from(schema_1.typography)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.typography.id, id), (0, drizzle_orm_1.eq)(schema_1.typography.userId, userId)))
            .limit(1);
        if (!result.length) {
            throw new common_1.NotFoundException('Typography not found');
        }
        return result[0];
    }
    async findAllFromCloudinary(folder = 'typography', userId) {
        try {
            const cloudinaryResult = await this.cloudinaryService.getResourcesByFolder(folder);
            const cloudinaryTypography = cloudinaryResult.resources.map((resource) => ({
                id: resource.public_id,
                name: resource.public_id.split('/').pop(),
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
            }));
            const dbTypography = await this.findAll(userId);
            const dbTypoMap = new Map(dbTypography.map((typo) => [typo.publicId, typo]));
            return cloudinaryTypography.map((cloudTypo) => {
                const dbTypo = dbTypoMap.get(cloudTypo.publicId);
                return dbTypo ? { ...cloudTypo, ...dbTypo } : cloudTypo;
            });
        }
        catch (error) {
            console.error('Error fetching typography from Cloudinary:', error);
            return this.findAll(userId);
        }
    }
    async findOneFromCloudinary(publicId, userId) {
        try {
            const cloudinaryResult = await this.cloudinaryService.getResourcesByIds([
                publicId,
            ]);
            if (!cloudinaryResult.resources ||
                cloudinaryResult.resources.length === 0) {
                throw new common_1.NotFoundException('Typography not found in Cloudinary');
            }
            const resource = cloudinaryResult.resources[0];
            const cloudinaryTypography = {
                id: resource.public_id,
                name: resource.public_id.split('/').pop(),
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
                const dbTypography = await schema_1.db
                    .select()
                    .from(schema_1.typography)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.typography.publicId, publicId), (0, drizzle_orm_1.eq)(schema_1.typography.userId, userId)))
                    .limit(1);
                if (dbTypography.length > 0) {
                    return { ...cloudinaryTypography, ...dbTypography[0] };
                }
            }
            catch (dbError) {
                console.error('Error fetching typography from database:', dbError);
            }
            return cloudinaryTypography;
        }
        catch (error) {
            console.error('Error fetching typography from Cloudinary:', error);
            const dbTypography = await schema_1.db
                .select()
                .from(schema_1.typography)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.typography.publicId, publicId), (0, drizzle_orm_1.eq)(schema_1.typography.userId, userId)))
                .limit(1);
            if (dbTypography.length > 0) {
                return dbTypography[0];
            }
            throw new common_1.NotFoundException('Typography not found');
        }
    }
    async create(file, createTypographyDto, userId) {
        const uploadResult = await this.cloudinaryService.uploadFile(file, 'typography');
        const existingTypography = await this.findAll(userId);
        const isDefault = existingTypography.length === 0;
        const result = await schema_1.db.insert(schema_1.typography).values({
            userId,
            name: file.originalname,
            url: uploadResult.secure_url,
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            width: uploadResult.width,
            height: uploadResult.height,
            publicId: uploadResult.public_id,
            isDefault,
        });
        const [insertedId] = result;
        return this.findOne(insertedId, userId);
    }
    async update(id, updateTypographyDto, userId) {
        const typographyItem = await this.findOne(id, userId);
        if (updateTypographyDto.isDefault) {
            await schema_1.db
                .update(schema_1.typography)
                .set({ isDefault: false })
                .where((0, drizzle_orm_1.eq)(schema_1.typography.userId, userId));
        }
        await schema_1.db
            .update(schema_1.typography)
            .set(updateTypographyDto)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.typography.id, id), (0, drizzle_orm_1.eq)(schema_1.typography.userId, userId)));
        return this.findOne(id, userId);
    }
    async remove(id, userId) {
        const typo = await this.findOne(id, userId);
        if (typo.publicId) {
            await this.cloudinaryService.deleteFile(typo.publicId);
        }
        return schema_1.db
            .delete(schema_1.typography)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.typography.id, id), (0, drizzle_orm_1.eq)(schema_1.typography.userId, userId)));
    }
};
exports.TypographyService = TypographyService;
exports.TypographyService = TypographyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService])
], TypographyService);
//# sourceMappingURL=typography.service.js.map