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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const jszip_1 = __importDefault(require("jszip"));
const axios_1 = __importDefault(require("axios"));
let CloudinaryService = class CloudinaryService {
    configService;
    constructor(configService) {
        this.configService = configService;
        cloudinary_1.v2.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }
    async uploadBuffer(buffer, folder, filename, options = {}) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder,
                public_id: filename.split('.')[0],
                ...options,
            }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
            const readableStream = new stream_1.Readable();
            readableStream.push(buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    }
    async uploadFile(file, folder = 'uploads', userId, options = {}) {
        const targetFolder = userId ? `${folder}/user_${userId}` : folder;
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: targetFolder,
                ...options,
            }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
            const readableStream = new stream_1.Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    }
    async deleteFile(publicId) {
        try {
            const fullPublicId = publicId.startsWith('images/')
                ? publicId
                : `images/${publicId}`;
            console.log('Deleting from Cloudinary with publicId:', fullPublicId);
            const result = await cloudinary_1.v2.uploader.destroy(fullPublicId);
            console.log('Cloudinary delete result:', result);
            return result;
        }
        catch (error) {
            console.error('Error in deleteFile:', error);
            throw error;
        }
    }
    getUrl(publicId, options = {}) {
        return cloudinary_1.v2.url(publicId, { secure: true, ...options });
    }
    async search(query, options = {}) {
        return cloudinary_1.v2.search
            .expression(query)
            .with_field('tags')
            .max_results(options.maxResults || 100)
            .execute();
    }
    async getResourcesByBaseFolder(baseFolder, userId, options = {}) {
        const { includeDefaults = true, max_results = 100, next_cursor } = options;
        let allResources = { resources: [] };
        if (userId) {
            const userFolder = `users/${userId}/${baseFolder}`;
            try {
                const userResources = await this.getResourcesByFolder(userFolder, {
                    max_results,
                    next_cursor,
                });
                allResources.resources = [
                    ...allResources.resources,
                    ...userResources.resources,
                ];
                allResources.next_cursor = userResources.next_cursor;
            }
            catch (error) {
                console.warn(`No resources found in user folder: ${userFolder}`);
            }
        }
        if (includeDefaults) {
            const defaultsFolder = `${baseFolder}/defaults`;
            try {
                const defaultResources = await this.getResourcesByFolder(defaultsFolder, { max_results: 100 });
                const defaultResourcesWithTags = defaultResources.resources.map((resource) => ({
                    ...resource,
                    tags: [...(resource.tags || []), 'default'],
                }));
                allResources.resources = [
                    ...allResources.resources,
                    ...defaultResourcesWithTags,
                ];
                if (!allResources.next_cursor) {
                    allResources.next_cursor = defaultResources.next_cursor;
                }
            }
            catch (error) {
                console.warn(`No resources found in defaults folder: ${defaultsFolder}`);
            }
        }
        return allResources;
    }
    async getResourcesByFolder(folder, options = {}) {
        try {
            const result = await cloudinary_1.v2.api.resources({
                type: 'upload',
                prefix: folder,
                max_results: options.max_results || 100,
                next_cursor: options.next_cursor,
                resource_type: options.resource_type || 'image',
            });
            return result;
        }
        catch (error) {
            console.error(`Error fetching resources from folder ${folder}:`, error);
            return { resources: [] };
        }
    }
    async getResourcesByTag(tag, options = {}) {
        try {
            const result = await cloudinary_1.v2.api.resources_by_tag(tag, {
                max_results: options.max_results || 100,
                next_cursor: options.next_cursor,
                resource_type: options.resource_type || 'image',
            });
            return result;
        }
        catch (error) {
            console.error(`Error fetching resources by tag ${tag}:`, error);
            return { resources: [] };
        }
    }
    async getResourcesByIds(publicIds, options = {}) {
        try {
            const result = await cloudinary_1.v2.api.resources_by_ids(publicIds, {
                resource_type: options.resource_type || 'image',
            });
            return result;
        }
        catch (error) {
            console.error(`Error fetching resources by IDs:`, error);
            return { resources: [] };
        }
    }
    async searchResources(expression, options = {}) {
        try {
            let searchQuery = cloudinary_1.v2.search
                .expression(expression)
                .max_results(options.max_results || 100);
            if (options.next_cursor) {
                searchQuery = searchQuery.next_cursor(options.next_cursor);
            }
            if (options.sort_by && options.sort_by.length > 0) {
                options.sort_by.forEach((sort) => {
                    searchQuery = searchQuery.sort_by(sort.field, sort.direction);
                });
            }
            if (options.with_field && options.with_field.length > 0) {
                options.with_field.forEach((field) => {
                    searchQuery = searchQuery.with_field(field);
                });
            }
            const result = await searchQuery.execute();
            return result;
        }
        catch (error) {
            console.error(`Error searching resources with expression ${expression}:`, error);
            return { resources: [] };
        }
    }
    async listFolders() {
        try {
            return await cloudinary_1.v2.api.root_folders();
        }
        catch (error) {
            console.error('Error listing folders:', error);
            return { folders: [] };
        }
    }
    async listSubFolders(folder) {
        try {
            return await cloudinary_1.v2.api.sub_folders(folder);
        }
        catch (error) {
            console.error(`Error listing subfolders in ${folder}:`, error);
            return { folders: [] };
        }
    }
    async createFolder(path) {
        try {
            return await cloudinary_1.v2.api.create_folder(path);
        }
        catch (error) {
            console.error(`Error creating folder ${path}:`, error);
            throw new common_1.BadRequestException(`Failed to create folder: ${error.message}`);
        }
    }
    async updateMetadata(publicId, metadata) {
        try {
            return await cloudinary_1.v2.uploader.add_context(JSON.stringify(metadata), [
                publicId,
            ]);
        }
        catch (error) {
            console.error(`Error updating metadata for ${publicId}:`, error);
            throw new common_1.BadRequestException(`Failed to update metadata: ${error.message}`);
        }
    }
    async addTags(publicId, tags) {
        try {
            const tagString = tags.join(',');
            return await cloudinary_1.v2.uploader.add_tag(tagString, [publicId]);
        }
        catch (error) {
            console.error(`Error adding tags to ${publicId}:`, error);
            throw new common_1.BadRequestException(`Failed to add tags: ${error.message}`);
        }
    }
    async createZip(urls, options = {}) {
        const zip = new jszip_1.default();
        const folder = options.folderName ? zip.folder(options.folderName) : zip;
        if (!folder) {
            throw new Error('Failed to create folder in zip');
        }
        const downloadPromises = urls.map(async (url, index) => {
            try {
                const filename = url.split('/').pop() || `file_${index}.jpg`;
                const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
                folder.file(filename, response.data);
                return { success: true, url };
            }
            catch (error) {
                console.error(`Error downloading ${url}:`, error);
                return { success: false, url, error };
            }
        });
        await Promise.all(downloadPromises);
        return zip.generateAsync({ type: 'nodebuffer' });
    }
    async uploadToUserFolder(file, userId, type = 'images') {
        try {
            const folder = `users/${userId}/${type}`;
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder,
                    resource_type: 'auto',
                }, (error, result) => {
                    if (error)
                        return reject(error);
                    resolve({
                        publicId: result?.public_id,
                        url: result?.secure_url,
                        width: result?.width || 0,
                        height: result?.height || 0,
                        format: result?.format,
                    });
                });
                const readableStream = new stream_1.Readable();
                readableStream.push(file.buffer);
                readableStream.push(null);
                readableStream.pipe(uploadStream);
            });
        }
        catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new common_1.BadRequestException('Failed to upload file to Cloudinary');
        }
    }
    async getUserResources(userId, type = 'images') {
        try {
            const folder = `users/${userId}/${type}`;
            const result = await cloudinary_1.v2.search
                .expression(`folder:${folder}`)
                .sort_by('created_at', 'desc')
                .max_results(100)
                .execute();
            return {
                resources: result.resources || [],
                total: result.total_count || 0,
                next_cursor: result.next_cursor || null,
            };
        }
        catch (error) {
            console.warn(`No resources found for user ${userId} in ${type} folder`);
            return {
                resources: [],
                total: 0,
                next_cursor: null,
            };
        }
    }
    async deleteUserResource(publicId, userId, folder) {
        try {
            const userFolderPattern = `users/${userId}/${folder}`;
            if (!publicId.includes(userFolderPattern)) {
                throw new common_1.BadRequestException('Unauthorized to delete this resource');
            }
            console.log(`Attempting to delete Cloudinary resource: ${publicId}`);
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            if (result.result !== 'ok') {
                console.error('Cloudinary deletion failed:', result);
                throw new common_1.BadRequestException(`Cloudinary deletion failed: ${result.result}`);
            }
            return true;
        }
        catch (error) {
            console.error('Error deleting resource:', error);
            throw new common_1.BadRequestException(`Failed to delete resource: ${error.message}`);
        }
    }
    async createFileFromUrl(url) {
        if (url.startsWith('data:')) {
            const base64Data = url.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const tempFilename = `temp-${Date.now()}.png`;
            return {
                fieldname: 'file',
                originalname: tempFilename,
                encoding: '7bit',
                mimetype: 'image/png',
                buffer,
                size: buffer.length,
            };
        }
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const tempFilename = `temp-${Date.now()}.png`;
        return {
            fieldname: 'file',
            originalname: tempFilename,
            encoding: '7bit',
            mimetype: 'image/png',
            buffer: Buffer.from(buffer),
            size: buffer.byteLength,
        };
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map