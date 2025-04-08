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
exports.DesignsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const schema_1 = require("../drizzle/schema");
const schema_2 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let DesignsService = class DesignsService {
    cloudinaryService;
    drizzle;
    constructor(cloudinaryService, drizzle) {
        this.cloudinaryService = cloudinaryService;
        this.drizzle = drizzle;
    }
    async saveDesign(userId, designData) {
        try {
            let cloudinaryResponse;
            if (designData.imageUrl.startsWith('data:image')) {
                const base64Data = designData.imageUrl.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const file = {
                    buffer,
                    originalname: `design_${Date.now()}.png`,
                    mimetype: 'image/png',
                };
                cloudinaryResponse = await this.cloudinaryService.uploadToUserFolder(file, userId, 'designs');
            }
            else if (designData.imageUrl.startsWith('http')) {
                if (designData.imageUrl.includes(`users/${userId}/designs`)) {
                    const urlParts = designData.imageUrl.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    const publicId = filename.split('.')[0];
                    cloudinaryResponse = {
                        url: designData.imageUrl,
                        secure_url: designData.imageUrl,
                        publicId: publicId,
                        public_id: publicId,
                    };
                }
                else {
                    try {
                        const response = await fetch(designData.imageUrl);
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        const extension = designData.imageUrl.split('.').pop() || 'png';
                        const file = {
                            buffer,
                            originalname: `design_${Date.now()}.${extension}`,
                            mimetype: `image/${extension}`,
                        };
                        cloudinaryResponse =
                            await this.cloudinaryService.uploadToUserFolder(file, userId, 'designs');
                    }
                    catch (fetchError) {
                        console.error('Error fetching image from URL:', fetchError);
                        throw new common_1.BadRequestException('Failed to process the image URL');
                    }
                }
            }
            else {
                throw new common_1.BadRequestException('Invalid image URL format');
            }
            if (!cloudinaryResponse ||
                (!cloudinaryResponse.url && !cloudinaryResponse.secure_url)) {
                throw new common_1.InternalServerErrorException('Failed to upload image to Cloudinary');
            }
            const designRecord = {
                userId,
                name: designData.name,
                imageUrl: cloudinaryResponse.secure_url || cloudinaryResponse.url,
                imageData: JSON.stringify({
                    url: cloudinaryResponse.secure_url || cloudinaryResponse.url,
                    publicId: cloudinaryResponse.public_id || cloudinaryResponse.publicId,
                }),
                designState: JSON.stringify({
                    filter: designData.filter,
                    textOverlay: designData.textOverlay,
                    logos: designData.logos,
                    aspectRatio: designData.aspectRatio,
                }),
                publicId: cloudinaryResponse.public_id || cloudinaryResponse.publicId,
            };
            const [savedDesign] = await this.drizzle.db
                .insert(schema_1.designs)
                .values(designRecord)
                .returning();
            return {
                id: savedDesign.id,
                name: savedDesign.name,
                imageUrl: savedDesign.imageUrl,
                filter: designData.filter,
                textOverlay: designData.textOverlay,
                logos: designData.logos,
                aspectRatio: designData.aspectRatio,
                createdAt: savedDesign.createdAt,
            };
        }
        catch (error) {
            console.error('Error saving design:', error);
            throw new common_1.InternalServerErrorException(`Failed to save design: ${error.message}`);
        }
    }
    async getDesigns(userId) {
        try {
            const userDesigns = await schema_2.db
                .select()
                .from(schema_1.designs)
                .where((0, drizzle_orm_1.eq)(schema_1.designs.userId, userId))
                .orderBy(schema_1.designs.createdAt);
            return userDesigns.map((design) => {
                let imageUrl = design.imageUrl;
                if (imageUrl && !imageUrl.startsWith('http')) {
                    const imageData = JSON.parse(design.imageData);
                    imageUrl = imageData.url;
                }
                const designState = JSON.parse(design.designState);
                return {
                    id: design.id,
                    name: design.name,
                    imageUrl: imageUrl,
                    filter: designState.filter || {},
                    textOverlay: designState.textOverlay || {},
                    logos: designState.logos || [],
                    aspectRatio: designState.aspectRatio || '1:1',
                    createdAt: design.createdAt,
                };
            });
        }
        catch (error) {
            console.error('Error fetching designs:', error);
            throw new common_1.InternalServerErrorException('Failed to fetch designs');
        }
    }
    async deleteDesign(userId, designId) {
        try {
            const [design] = await schema_2.db
                .select()
                .from(schema_1.designs)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.designs.id, designId), (0, drizzle_orm_1.eq)(schema_1.designs.userId, userId)))
                .limit(1);
            if (!design) {
                throw new common_1.NotFoundException('Design not found');
            }
            let publicId;
            if (design.imageData) {
                try {
                    const imageData = JSON.parse(design.imageData);
                    publicId = imageData.publicId || imageData.id;
                    if (!publicId && design.imageUrl) {
                        const urlParts = design.imageUrl.split('/');
                        const filename = urlParts[urlParts.length - 1];
                        publicId = filename.split('.')[0];
                    }
                }
                catch (e) {
                    console.warn('Could not parse imageData:', e);
                }
            }
            if (publicId) {
                try {
                    await this.cloudinaryService.deleteUserResource(publicId, userId, 'designs');
                }
                catch (cloudinaryError) {
                    console.warn('Error deleting from Cloudinary:', cloudinaryError);
                }
            }
            await schema_2.db
                .delete(schema_1.designs)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.designs.id, designId), (0, drizzle_orm_1.eq)(schema_1.designs.userId, userId)));
            return { success: true, message: 'Design deleted successfully' };
        }
        catch (error) {
            console.error('Delete error:', error);
            throw new common_1.BadRequestException(`Failed to delete design: ${error.message}`);
        }
    }
};
exports.DesignsService = DesignsService;
exports.DesignsService = DesignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService,
        drizzle_service_1.DrizzleService])
], DesignsService);
//# sourceMappingURL=designs.service.js.map