"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypographyModule = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../drizzle/drizzle.module");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const typography_service_1 = require("./typography.service");
const typography_controller_1 = require("./typography.controller");
const auth_module_1 = require("../auth/auth.module");
let TypographyModule = class TypographyModule {
};
exports.TypographyModule = TypographyModule;
exports.TypographyModule = TypographyModule = __decorate([
    (0, common_1.Module)({
        imports: [drizzle_module_1.DrizzleModule, cloudinary_module_1.CloudinaryModule, auth_module_1.AuthModule],
        controllers: [typography_controller_1.TypographyController],
        providers: [typography_service_1.TypographyService],
        exports: [typography_service_1.TypographyService],
    })
], TypographyModule);
//# sourceMappingURL=typography.module.js.map