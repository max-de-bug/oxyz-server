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
exports.LogosController = void 0;
const common_1 = require("@nestjs/common");
const logos_service_1 = require("./logos.service");
const update_logo_dto_1 = require("./dto/update-logo.dto");
const auth_guard_1 = require("../auth/guards/auth.guard");
let LogosController = class LogosController {
    logosService;
    constructor(logosService) {
        this.logosService = logosService;
    }
    async findAll(req, source, folder, includeDefaults) {
        const userId = req.user.id;
        if (source === 'cloudinary') {
            return this.logosService.findAllFromCloudinary(folder || 'logos', userId, { includeDefaults: includeDefaults !== 'false' });
        }
        return this.logosService.findAll(userId);
    }
    async findOneFromCloudinary(publicId, req) {
        const userId = req.user.id;
        return this.logosService.findOneFromCloudinary(publicId, userId);
    }
    async findOne(id, req) {
        const userId = req.user.id;
        return this.logosService.findOne(id, userId);
    }
    async update(id, updateLogoDto, req) {
        const userId = req.user.id;
        return this.logosService.update(id, updateLogoDto, userId);
    }
    async remove(id, req) {
        const userId = req.user.id;
        return this.logosService.remove(id, userId);
    }
};
exports.LogosController = LogosController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('source')),
    __param(2, (0, common_1.Query)('folder')),
    __param(3, (0, common_1.Query)('includeDefaults')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], LogosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('cloudinary/:publicId'),
    __param(0, (0, common_1.Param)('publicId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogosController.prototype, "findOneFromCloudinary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_logo_dto_1.UpdateLogoDto, Object]),
    __metadata("design:returntype", Promise)
], LogosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LogosController.prototype, "remove", null);
exports.LogosController = LogosController = __decorate([
    (0, common_1.Controller)('logos'),
    (0, common_1.UseGuards)(auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [logos_service_1.LogosService])
], LogosController);
//# sourceMappingURL=logos.controller.js.map