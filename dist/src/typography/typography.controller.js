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
exports.TypographyController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const typography_service_1 = require("./typography.service");
const update_typography_dto_1 = require("./dto/update-typography.dto");
const create_typography_dto_1 = require("./dto/create-typography.dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
let TypographyController = class TypographyController {
    typographyService;
    constructor(typographyService) {
        this.typographyService = typographyService;
    }
    getPublicTypography() {
    }
    getTypography(req) {
        const userId = req.user.id;
        return this.typographyService.findAll(userId);
    }
    async findOneFromCloudinary(publicId, req) {
        const userId = req.user.id;
        return this.typographyService.findOneFromCloudinary(publicId, userId);
    }
    async create(file, createTypographyDto, req) {
        const userId = req.user.id;
        return this.typographyService.create(file, createTypographyDto, userId);
    }
    async update(id, updateTypographyDto, req) {
        const userId = req.user.id;
        return this.typographyService.update(id, updateTypographyDto, userId);
    }
    async remove(id, req) {
        const userId = req.user.id;
        return this.typographyService.remove(id, userId);
    }
};
exports.TypographyController = TypographyController;
__decorate([
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TypographyController.prototype, "getPublicTypography", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TypographyController.prototype, "getTypography", null);
__decorate([
    (0, common_1.Get)('cloudinary/:publicId'),
    __param(0, (0, common_1.Param)('publicId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TypographyController.prototype, "findOneFromCloudinary", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_typography_dto_1.CreateTypographyDto, Object]),
    __metadata("design:returntype", Promise)
], TypographyController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_typography_dto_1.UpdateTypographyDto, Object]),
    __metadata("design:returntype", Promise)
], TypographyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TypographyController.prototype, "remove", null);
exports.TypographyController = TypographyController = __decorate([
    (0, common_1.Controller)('typography'),
    (0, common_1.UseGuards)(auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [typography_service_1.TypographyService])
], TypographyController);
//# sourceMappingURL=typography.controller.js.map