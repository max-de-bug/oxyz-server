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
var SupabaseStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_custom_1 = require("passport-custom");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../../users/users.service");
const drizzle_service_1 = require("../../drizzle/drizzle.service");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let SupabaseStrategy = SupabaseStrategy_1 = class SupabaseStrategy extends (0, passport_1.PassportStrategy)(passport_custom_1.Strategy, 'supabase') {
    configService;
    usersService;
    drizzle;
    logger = new common_1.Logger(SupabaseStrategy_1.name);
    constructor(configService, usersService, drizzle) {
        super();
        this.configService = configService;
        this.usersService = usersService;
        this.drizzle = drizzle;
    }
    async validate(request) {
        try {
            const token = this.extractTokenFromHeader(request);
            if (!token) {
                this.logger.warn('No token provided in request');
                throw new common_1.UnauthorizedException('No token provided');
            }
            const payload = this.decodeToken(token);
            if (!payload || !payload.sub) {
                this.logger.warn('Invalid token payload');
                throw new common_1.UnauthorizedException('Invalid token payload');
            }
            this.logger.debug('Token payload:', payload);
            const user = await this.findOrCreateUser(payload);
            return user;
        }
        catch (error) {
            this.logger.error('Authentication failed:', error);
            throw new common_1.UnauthorizedException('Invalid authentication credentials');
        }
    }
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''));
            return JSON.parse(jsonPayload);
        }
        catch (error) {
            this.logger.error('Token decoding failed:', error);
            throw new Error('Invalid token format');
        }
    }
    async findOrCreateUser(payload) {
        try {
            let [user] = await this.drizzle.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, payload.sub));
            if (!user) {
                const email = payload.email;
                [user] = await this.drizzle.db
                    .insert(schema_1.users)
                    .values({
                    id: payload.sub,
                    email: email,
                    name: email ? email.split('@')[0] : undefined,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                    .returning();
                this.logger.log(`Created new user: ${user.id}`);
            }
            return user;
        }
        catch (error) {
            this.logger.error('Error finding/creating user:', error);
            throw new Error('Failed to process user');
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.SupabaseStrategy = SupabaseStrategy;
exports.SupabaseStrategy = SupabaseStrategy = SupabaseStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService,
        drizzle_service_1.DrizzleService])
], SupabaseStrategy);
//# sourceMappingURL=supabase.strategy.js.map