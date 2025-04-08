"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const schema_1 = require("../drizzle/schema");
let ImagesService = class ImagesService {
    cloudinaryService;
    drizzle;
    constructor(cloudinaryService, drizzle) {
        this.cloudinaryService = cloudinaryService;
        this.drizzle = drizzle;
    }
    async uploadImage(file, userId) {
        try {
            if (!file || !file.mimetype || !file.size) {
                throw new common_1.BadRequestException('Invalid file upload');
            }
            const result = await this.cloudinaryService.uploadToUserFolder(file, userId, 'images');
            const savedImage = await this.drizzle.db
                .insert(schema_1.images)
                .values({
                id: (0, uuid_1.v4)(),
                userId: userId,
                url: result.url,
                filename: file.originalname,
                public_id: result.publicId,
                mime_type: file.mimetype,
                size: file.size,
                width: result.width || 0,
                height: result.height || 0,
                created_at: new Date(),
                updated_at: new Date(),
            })
                .returning();
            return savedImage;
        }
        catch (error) {
            console.error('Upload error:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to upload image: ${error.message}`);
        }
        finally {
            if (file?.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }
    }
    async getUserImages(userId) {
        try {
            const [cloudinaryResult, dbImages] = await Promise.all([
                this.findAllFromCloudinary('images', userId),
                this.findAll(userId),
            ]);
            const combinedImages = new Map();
            cloudinaryResult.images.forEach((image) => {
                combinedImages.set(image.publicId, image);
            });
            dbImages.forEach((image) => {
                if (image.public_id) {
                    combinedImages.set(image.public_id, {
                        id: image.id,
                        url: image.url,
                        filename: image.filename,
                        publicId: image.public_id,
                        mimeType: image.mime_type,
                        size: image.size,
                        width: image.width,
                        height: image.height,
                        createdAt: image.created_at,
                        updatedAt: image.updated_at,
                    });
                }
            });
            return {
                images: Array.from(combinedImages.values()),
                total: combinedImages.size,
            };
        }
        catch (error) {
            console.error('Error fetching user images:', error);
            return {
                images: [],
                total: 0,
            };
        }
    }
    async findAll(userId) {
        try {
            const dbImages = await this.drizzle.db
                .select()
                .from(schema_1.images)
                .where((0, drizzle_orm_1.eq)(schema_1.images.userId, userId));
            return dbImages.map((image) => ({
                ...image,
                publicId: image.public_id,
                mimeType: image.mime_type,
                createdAt: image.created_at,
                updatedAt: image.updated_at,
            }));
        }
        catch (error) {
            console.error('Error fetching images:', error);
            return [];
        }
    }
    async findOne(id, userId) {
        const [image] = await this.drizzle.db
            .select()
            .from(schema_1.images)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.images.id, id), (0, drizzle_orm_1.eq)(schema_1.images.userId, userId)));
        if (!image) {
            throw new common_1.NotFoundException(`Image with ID ${id} not found`);
        }
        return image;
    }
    async create(file, createImageDto, userId) {
        const uploadResult = await this.cloudinaryService.uploadFile(file, 'images');
        const id = (0, uuid_1.v4)();
        const newImage = {
            id,
            user_id: userId,
            filename: file.originalname,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            tags: createImageDto.tags || [],
            mimeType: file.mimetype,
            size: file.size,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const dbImage = {
            id: newImage.id,
            user_id: newImage.user_id,
            filename: newImage.filename,
            url: newImage.url,
            public_id: newImage.publicId,
            width: newImage.width,
            height: newImage.height,
            format: newImage.format,
            tags: newImage.tags,
            mime_type: newImage.mimeType,
            size: newImage.size,
            created_at: newImage.createdAt,
            updated_at: newImage.updatedAt,
        };
        await this.drizzle.db.insert(schema_1.images).values(dbImage);
        return this.findOne(id, userId);
    }
    async update(id, updateImageDto, userId) {
        const image = await this.findOne(id, userId);
        const updatedImage = {
            ...image,
            tags: updateImageDto.tags,
            updatedAt: new Date(),
        };
        await this.drizzle.db
            .update(schema_1.images)
            .set(updatedImage)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.images.id, id), (0, drizzle_orm_1.eq)(schema_1.images.userId, userId)));
        return this.findOne(id, userId);
    }
    async deleteImage(publicId, userId, folder = 'images') {
        try {
            console.log(`Deleting image: ${publicId} from folder ${folder} for user ${userId}`);
            await this.cloudinaryService.deleteUserResource(publicId, userId, folder);
            try {
                const deletedRows = await this.drizzle.db
                    .delete(schema_1.images)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.images.public_id, publicId), (0, drizzle_orm_1.eq)(schema_1.images.userId, userId)))
                    .returning();
                console.log(`Deleted ${deletedRows.length} database records`);
            }
            catch (dbError) {
                console.warn('Database entry not found, continuing with deletion', dbError);
            }
            return { success: true, message: 'Image deleted successfully' };
        }
        catch (error) {
            console.error('Delete error:', error);
            throw new common_1.BadRequestException(`Failed to delete image: ${error.message}`);
        }
    }
    async remove(id, userId) {
        try {
            const image = await this.findOne(id, userId);
            if (image.public_id) {
                try {
                    await this.cloudinaryService.deleteUserResource(image.public_id, userId, 'images');
                }
                catch (cloudinaryError) {
                    console.error('Error deleting from Cloudinary:', cloudinaryError);
                }
            }
            await this.drizzle.db
                .delete(schema_1.images)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.images.id, id), (0, drizzle_orm_1.eq)(schema_1.images.userId, userId)));
            return { success: true, message: 'Image deleted successfully' };
        }
        catch (error) {
            console.error('Error in remove:', error);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to delete image: ${error.message || 'Unknown error'}`);
        }
    }
    async findAllFromCloudinary(folder = 'images', userId) {
        try {
            const userFolder = `users/${userId}/${folder}`;
            const cloudinaryResult = await this.cloudinaryService.getResourcesByFolder(userFolder);
            if (!cloudinaryResult || !cloudinaryResult.resources) {
                return {
                    images: [],
                    total: 0,
                };
            }
            const cloudinaryImages = cloudinaryResult.resources.map((resource) => ({
                id: resource.public_id,
                url: resource.secure_url,
                filename: resource.public_id.split('/').pop(),
                mimeType: resource.resource_type + '/' + resource.format,
                size: resource.bytes,
                width: resource.width,
                height: resource.height,
                publicId: resource.public_id,
                createdAt: resource.created_at,
                updatedAt: resource.created_at,
            }));
            return {
                images: cloudinaryImages,
                total: cloudinaryImages.length,
            };
        }
        catch (error) {
            console.error('Error fetching images from Cloudinary:', error);
            return {
                images: [],
                total: 0,
            };
        }
    }
    async findOneFromCloudinary(publicId, userId) {
        try {
            const cloudinaryResult = await this.cloudinaryService.getResourcesByIds([
                publicId,
            ]);
            if (!cloudinaryResult.resources ||
                cloudinaryResult.resources.length === 0) {
                throw new common_1.NotFoundException('Image not found in Cloudinary');
            }
            const resource = cloudinaryResult.resources[0];
            const [dbImage] = await this.drizzle.db
                .select()
                .from(schema_1.images)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.images.public_id, publicId), (0, drizzle_orm_1.eq)(schema_1.images.userId, userId)))
                .limit(1);
            const cloudinaryImage = {
                id: resource.public_id,
                url: resource.secure_url,
                filename: resource.public_id.split('/').pop(),
                mimeType: resource.resource_type + '/' + resource.format,
                size: resource.bytes,
                width: resource.width,
                height: resource.height,
                publicId: resource.public_id,
                createdAt: resource.created_at,
                updatedAt: resource.created_at,
            };
            return dbImage ? { ...cloudinaryImage, ...dbImage } : cloudinaryImage;
        }
        catch (error) {
            console.error('Error fetching image:', error);
            throw new common_1.NotFoundException('Image not found');
        }
    }
    async getDefaultUserImage() {
        try {
            const result = await this.cloudinaryService.getResourcesByFolder('images/defaults');
            if (!result.resources || result.resources.length === 0) {
                throw new common_1.NotFoundException('No default user image found');
            }
            const defaultImage = result.resources[0];
            return {
                url: defaultImage.secure_url,
                publicId: defaultImage.public_id,
                width: defaultImage.width,
                height: defaultImage.height,
            };
        }
        catch (error) {
            console.error('Error fetching default user image:', error);
            throw new common_1.NotFoundException('Default user image not found');
        }
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService,
        drizzle_service_1.DrizzleService])
], ImagesService);
//# sourceMappingURL=images.service.js.map