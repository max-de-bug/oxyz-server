"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogosModule = void 0;
const common_1 = require("@nestjs/common");
const logos_controller_1 = require("./logos.controller");
const logos_service_1 = require("./logos.service");
const drizzle_module_1 = require("../drizzle/drizzle.module");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const auth_module_1 = require("../auth/auth.module");
let LogosModule = class LogosModule {
};
exports.LogosModule = LogosModule;
exports.LogosModule = LogosModule = __decorate([
    (0, common_1.Module)({
        imports: [drizzle_module_1.DrizzleModule, cloudinary_module_1.CloudinaryModule, auth_module_1.AuthModule],
        controllers: [logos_controller_1.LogosController],
        providers: [logos_service_1.LogosService],
        exports: [logos_service_1.LogosService],
    })
], LogosModule);
//# sourceMappingURL=logos.module.js.map