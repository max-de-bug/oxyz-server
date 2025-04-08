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
exports.CreateDesignDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class FilterDto {
    brightness;
    contrast;
    saturation;
    sepia;
    opacity;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FilterDto.prototype, "brightness", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FilterDto.prototype, "contrast", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FilterDto.prototype, "saturation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FilterDto.prototype, "sepia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FilterDto.prototype, "opacity", void 0);
class TextOverlayDto {
    text;
    color;
    fontFamily;
    fontSize;
    isBold;
    isItalic;
    isVisible;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TextOverlayDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TextOverlayDto.prototype, "color", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TextOverlayDto.prototype, "fontFamily", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], TextOverlayDto.prototype, "fontSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], TextOverlayDto.prototype, "isBold", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], TextOverlayDto.prototype, "isItalic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], TextOverlayDto.prototype, "isVisible", void 0);
class LogoPositionDto {
    url;
    position;
    size;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LogoPositionDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LogoPositionDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LogoPositionDto.prototype, "size", void 0);
class CreateDesignDto {
    name;
    imageUrl;
    filter;
    textOverlay;
    logos;
    aspectRatio;
}
exports.CreateDesignDto = CreateDesignDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDesignDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDesignDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FilterDto),
    __metadata("design:type", FilterDto)
], CreateDesignDto.prototype, "filter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TextOverlayDto),
    __metadata("design:type", TextOverlayDto)
], CreateDesignDto.prototype, "textOverlay", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LogoPositionDto),
    __metadata("design:type", Array)
], CreateDesignDto.prototype, "logos", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDesignDto.prototype, "aspectRatio", void 0);
//# sourceMappingURL=create-design.dto.js.map