"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const images_module_1 = require("./images/images.module");
const logos_module_1 = require("./logos/logos.module");
const designs_module_1 = require("./designs/designs.module");
const drizzle_module_1 = require("./drizzle/drizzle.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const auth_module_1 = require("./auth/auth.module");
const presets_module_1 = require("./presets/presets.module");
const typography_module_1 = require("./typography/typography.module");
const users_module_1 = require("./users/users.module");
const filters_module_1 = require("./filters/filters.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            drizzle_module_1.DrizzleModule,
            cloudinary_module_1.CloudinaryModule,
            auth_module_1.AuthModule,
            images_module_1.ImagesModule,
            logos_module_1.LogosModule,
            designs_module_1.DesignsModule,
            presets_module_1.PresetsModule,
            typography_module_1.TypographyModule,
            users_module_1.UsersModule,
            filters_module_1.FiltersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map