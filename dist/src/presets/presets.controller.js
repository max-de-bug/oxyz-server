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
exports.PresetsController = void 0;
const common_1 = require("@nestjs/common");
const presets_service_1 = require("./presets.service");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../auth/guards/auth.guard");
let PresetsController = class PresetsController {
    presetsService;
    constructor(presetsService) {
        this.presetsService = presetsService;
    }
    async findAll(req, source, folder, includeDefaults) {
        const userId = req.user.id;
        console.log('PRESETS CONTROLLER: findAll called with source =', source);
        if (source === 'cloudinary') {
            console.log('PRESETS CONTROLLER: Fetching from Cloudinary');
            return this.presetsService.findAllFromCloudinary(folder || 'presets', userId, { includeDefaults: includeDefaults !== 'false' });
        }
        console.log('PRESETS CONTROLLER: Fetching from database');
        return this.presetsService.findAll(userId);
    }
    findAllFromCloudinary(req, includeDefaults) {
        try {
            console.log('CONTROLLER ENTRY POINT: findAllFromCloudinary called');
            console.log('CONTROLLER ENTRY POINT: req.user =', req.user);
            if (!req.user || !req.user.id) {
                console.error('CONTROLLER ERROR: User not authenticated or missing ID');
                return { resources: [] };
            }
            const includeDefaultsBool = includeDefaults
                ? includeDefaults === 'true'
                : true;
            console.log('CONTROLLER ENTRY POINT: Calling service method');
            return this.presetsService.findAllFromCloudinary('presets', req.user.id, {
                includeDefaults: includeDefaultsBool,
            });
        }
        catch (error) {
            console.error('CONTROLLER ERROR:', error);
            return { resources: [] };
        }
    }
    findOne(id, req) {
        return this.presetsService.findOne(id, req.user.id);
    }
    create(createPresetDto, req) {
        return this.presetsService.create(createPresetDto, req.user.id);
    }
    update(id, updatePresetDto, req) {
        return this.presetsService.update(id, updatePresetDto, req.user.id);
    }
    setDefault(id, req) {
        return this.presetsService.setDefault(id, req.user.id);
    }
    remove(id, req) {
        return this.presetsService.remove(id, req.user.id);
    }
};
exports.PresetsController = PresetsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all presets for the current user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns all presets for the current user',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('source')),
    __param(2, (0, common_1.Query)('folder')),
    __param(3, (0, common_1.Query)('includeDefaults')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], PresetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('cloudinary'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all presets from Cloudinary for the current user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns all presets from Cloudinary for the current user',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('includeDefaults')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PresetsController.prototype, "findAllFromCloudinary", null);
__decorate([
    (0, common_1.Get)('cloudinary/paginated'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get paginated presets from Cloudinary for the current user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns paginated presets from Cloudinary for the current user',
    }),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a preset by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns a preset by ID',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PresetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new preset' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The preset has been successfully created',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PresetsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a preset' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The preset has been successfully updated',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PresetsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/default'),
    (0, swagger_1.ApiOperation)({ summary: 'Set a preset as default' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The preset has been successfully set as default',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PresetsController.prototype, "setDefault", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a preset' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The preset has been successfully deleted',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PresetsController.prototype, "remove", null);
exports.PresetsController = PresetsController = __decorate([
    (0, common_1.Controller)('presets'),
    (0, common_1.UseGuards)(auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [presets_service_1.PresetsService])
], PresetsController);
//# sourceMappingURL=presets.controller.js.map