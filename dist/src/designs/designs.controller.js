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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignsController = void 0;
const common_1 = require("@nestjs/common");
const designs_service_1 = require("./designs.service");
const create_design_dto_1 = require("./dto/create-design.dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let DesignsController = class DesignsController {
    designsService;
    cloudinaryService;
    constructor(designsService, cloudinaryService) {
        this.designsService = designsService;
        this.cloudinaryService = cloudinaryService;
    }
    async saveDesign(req, createDesignDto) {
        const userId = req.user.id;
        return await this.designsService.saveDesign(userId, createDesignDto);
    }
    async getDesigns(req) {
        const userId = req.user.id;
        return await this.designsService.getDesigns(userId);
    }
    async deleteDesign(req, designId) {
        const userId = req.user.id;
        return await this.designsService.deleteDesign(userId, designId);
    }
    async getAssetsByFolder(folder, req, maxResults = 100) {
        const userId = req.user.id;
        try {
            let folderPath = folder;
            if (!folderPath.startsWith(`users/${userId}`)) {
                folderPath = `users/${userId}/${folderPath}`;
            }
            const result = await this.cloudinaryService.getResourcesByFolder(folderPath);
            if (result.resources && maxResults) {
                result.resources = result.resources.slice(0, maxResults);
                result.total = Math.min(result.total || 0, maxResults);
            }
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to get assets by folder: ${error.message}`);
        }
    }
};
exports.DesignsController = DesignsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_design_dto_1.CreateDesignDto]),
    __metadata("design:returntype", Promise)
], DesignsController.prototype, "saveDesign", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DesignsController.prototype, "getDesigns", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DesignsController.prototype, "deleteDesign", null);
__decorate([
    (0, common_1.Get)('assets/folder/:folder'),
    __param(0, (0, common_1.Param)('folder')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('maxResults')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number]),
    __metadata("design:returntype", Promise)
], DesignsController.prototype, "getAssetsByFolder", null);
exports.DesignsController = DesignsController = __decorate([
    (0, common_1.Controller)('designs'),
    (0, common_1.UseGuards)(auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [designs_service_1.DesignsService,
        cloudinary_service_1.CloudinaryService])
], DesignsController);
//# sourceMappingURL=designs.controller.js.map