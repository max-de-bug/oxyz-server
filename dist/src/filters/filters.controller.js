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
exports.FiltersController = void 0;
const common_1 = require("@nestjs/common");
const filters_service_1 = require("./filters.service");
const create_filter_dto_1 = require("./dto/create-filter.dto");
const supabase_auth_guard_1 = require("../auth/guards/supabase-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let FiltersController = class FiltersController {
    filtersService;
    constructor(filtersService) {
        this.filtersService = filtersService;
    }
    async create(createFilterDto, req) {
        try {
            const userId = req.user.id;
            return this.filtersService.create(createFilterDto, userId);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create filter: ${error.message}`);
        }
    }
    async findAll(req, includeDefaults) {
        try {
            const userId = req.user.id;
            const includeDefaultsFlag = includeDefaults !== 'false';
            return this.filtersService.findAll(userId, {
                includeDefaults: includeDefaultsFlag,
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch filters: ${error.message}`);
        }
    }
    async findOne(id, req) {
        try {
            const userId = req.user.id;
            return this.filtersService.findOne(id, userId);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch filter: ${error.message}`);
        }
    }
    async remove(id, req) {
        try {
            const userId = req.user.id;
            return this.filtersService.remove(id, userId);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to delete filter: ${error.message}`);
        }
    }
};
exports.FiltersController = FiltersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new filter' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'The filter has been successfully created',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_filter_dto_1.CreateFilterDto, Object]),
    __metadata("design:returntype", Promise)
], FiltersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all filters for the current user' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns all filters for the current user',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('includeDefaults')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FiltersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a filter by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns a filter by ID',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FiltersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a filter' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The filter has been successfully deleted',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FiltersController.prototype, "remove", null);
exports.FiltersController = FiltersController = __decorate([
    (0, swagger_1.ApiTags)('filters'),
    (0, common_1.Controller)('filters'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [filters_service_1.FiltersService])
], FiltersController);
//# sourceMappingURL=filters.controller.js.map