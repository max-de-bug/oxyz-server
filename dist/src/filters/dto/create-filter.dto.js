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
exports.CreateFilterDto = exports.FilterValues = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class FilterValues {
    brightness = 100;
    contrast = 100;
    saturation = 100;
    sepia = 0;
    opacity = 100;
}
exports.FilterValues = FilterValues;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Brightness value (0-200)', example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(200),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FilterValues.prototype, "brightness", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contrast value (0-200)', example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(200),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FilterValues.prototype, "contrast", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Saturation value (0-200)', example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(200),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FilterValues.prototype, "saturation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sepia value (0-100)', example: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FilterValues.prototype, "sepia", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Opacity value (0-100)', example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FilterValues.prototype, "opacity", void 0);
class CreateFilterDto {
    name;
    filter;
}
exports.CreateFilterDto = CreateFilterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Filter name', example: 'Summer Vibes' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFilterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter values',
        type: FilterValues,
        example: {
            brightness: 110,
            contrast: 120,
            saturation: 130,
            sepia: 10,
            opacity: 100,
        },
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", FilterValues)
], CreateFilterDto.prototype, "filter", void 0);
//# sourceMappingURL=create-filter.dto.js.map