"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const users_module_1 = require("../users/users.module");
const drizzle_module_1 = require("../drizzle/drizzle.module");
const supabase_strategy_1 = require("./strategies/supabase.strategy");
const auth_guard_1 = require("./guards/auth.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            passport_1.PassportModule.register({ defaultStrategy: 'supabase' }),
            users_module_1.UsersModule,
            drizzle_module_1.DrizzleModule,
        ],
        controllers: [],
        providers: [
            supabase_strategy_1.SupabaseStrategy,
            {
                provide: core_1.APP_GUARD,
                useClass: auth_guard_1.SupabaseAuthGuard,
            },
        ],
        exports: [],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map