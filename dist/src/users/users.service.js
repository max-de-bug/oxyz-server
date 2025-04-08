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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_service_1 = require("../drizzle/drizzle.service");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../drizzle/schema");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const common_2 = require("@nestjs/common");
let UsersService = UsersService_1 = class UsersService {
    drizzle;
    cloudinaryService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(drizzle, cloudinaryService) {
        this.drizzle = drizzle;
        this.cloudinaryService = cloudinaryService;
    }
    async getProfile(userId) {
        if (!userId) {
            throw new common_1.BadRequestException('User ID is required');
        }
        try {
            const [user] = await this.drizzle.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            };
        }
        catch (error) {
            this.logger.error(`Error getting profile for user ${userId}: ${error.message}`, error.stack);
            if (error instanceof common_2.HttpException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to get user profile');
        }
    }
    async getDefaultUserImage() {
        this.logger.log('Attempting to fetch default user image');
        try {
            this.logger.debug('Attempting to fetch from users/defaults folder');
            try {
                const result = await this.cloudinaryService.getResourcesByBaseFolder('users');
                this.logger.debug(`Result from users/defaults: ${JSON.stringify(result)}`);
                if (result.resources && result.resources.length > 0) {
                    const defaultImage = result.resources[0];
                    this.logger.log(`Found default image in users/defaults: ${defaultImage.public_id}`);
                    return {
                        url: defaultImage.secure_url,
                        publicId: defaultImage.public_id,
                        width: defaultImage.width,
                        height: defaultImage.height,
                    };
                }
                else {
                    this.logger.warn('No resources found in users/defaults folder');
                }
            }
            catch (firstError) {
                this.logger.warn(`Error fetching from users/defaults: ${firstError.message}`, firstError.stack);
            }
            this.logger.debug('Attempting to fetch from images/defaults folder');
            const result = await this.cloudinaryService.getResourcesByFolder('images/defaults');
            this.logger.debug(`Result from images/defaults: ${JSON.stringify(result)}`);
            if (!result.resources || result.resources.length === 0) {
                this.logger.error('No default user image found in any defaults folder');
                throw new common_1.NotFoundException('No default user image found in any defaults folder');
            }
            const defaultImage = result.resources[0];
            this.logger.log(`Found default image in images/defaults: ${defaultImage.public_id}`);
            return {
                url: defaultImage.secure_url,
                publicId: defaultImage.public_id,
                width: defaultImage.width,
                height: defaultImage.height,
            };
        }
        catch (error) {
            this.logger.error(`Error fetching default user image: ${error.message}`, error.stack);
            throw new common_1.NotFoundException('Default user image not found');
        }
    }
    async updateUsername(userId, username) {
        if (!userId) {
            throw new common_1.BadRequestException('User ID is required');
        }
        if (!username || typeof username !== 'string') {
            throw new common_1.BadRequestException('Valid username is required');
        }
        const normalizedUsername = username.trim();
        if (normalizedUsername.length < 3) {
            throw new common_1.BadRequestException('Username must be at least 3 characters long');
        }
        if (normalizedUsername.length > 30) {
            throw new common_1.BadRequestException('Username cannot exceed 30 characters');
        }
        if (!/^[a-zA-Z0-9._-]+$/.test(normalizedUsername)) {
            throw new common_1.BadRequestException('Username can only contain letters, numbers, periods, underscores, and hyphens');
        }
        try {
            const existingUser = await this.drizzle.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.name, normalizedUsername), (0, drizzle_orm_1.not)((0, drizzle_orm_1.eq)(schema_1.users.id, userId))))
                .limit(1);
            if (existingUser.length > 0) {
                throw new common_1.ConflictException('Username is already taken');
            }
            const [updatedUser] = await this.drizzle.db
                .update(schema_1.users)
                .set({
                name: normalizedUsername,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
                .returning();
            if (!updatedUser) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            this.logger.log(`Username updated for user ${userId} to ${normalizedUsername}`);
            return updatedUser;
        }
        catch (error) {
            this.logger.error(`Error updating username for user ${userId}: ${error.message}`, error.stack);
            if (error instanceof common_2.HttpException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to update username');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drizzle_service_1.DrizzleService,
        cloudinary_service_1.CloudinaryService])
], UsersService);
//# sourceMappingURL=users.service.js.map