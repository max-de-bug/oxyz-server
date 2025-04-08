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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const auth_guard_1 = require("../auth/guards/auth.guard");
let UsersController = UsersController_1 = class UsersController {
    usersService;
    logger = new common_1.Logger(UsersController_1.name);
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(req) {
        if (req.user && req.user['id']) {
            const userId = req.user['id'];
            this.logger.log(`Getting profile for user: ${userId}`);
            try {
                const userProfile = await this.usersService.getProfile(userId);
                return userProfile;
            }
            catch (error) {
                this.logger.error(`Error retrieving profile for user ${userId}: ${error.message}`, error.stack);
                throw error;
            }
        }
        this.logger.warn('Profile requested but no user found in request');
        return null;
    }
    async updateUsername(req, body) {
        const userId = req.user ? req.user['id'] || 'unknown' : 'unknown';
        this.logger.log(`Updating username for user: ${userId} to ${body.username}`);
        return this.usersService.updateUsername(userId, body.username);
    }
    async getDefaultUserImage() {
        this.logger.log('Attempting to get default user image');
        try {
            const result = await this.usersService.getDefaultUserImage();
            this.logger.log(`Successfully fetched default image: ${result.publicId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to get default user image: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('username'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUsername", null);
__decorate([
    (0, auth_guard_1.Public)(),
    (0, common_1.Get)('defaults/image'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getDefaultUserImage", null);
exports.UsersController = UsersController = UsersController_1 = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map