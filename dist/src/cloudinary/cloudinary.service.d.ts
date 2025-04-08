import { ConfigService } from '@nestjs/config';
import { CloudinaryResponse, CloudinaryResourceOptions, CloudinarySearchOptions } from './interfaces/cloudinary.interfaces';
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    uploadBuffer(buffer: Buffer, folder: string, filename: string, options?: any): Promise<any>;
    uploadFile(file: Express.Multer.File, folder?: string, userId?: string, options?: any): Promise<any>;
    deleteFile(publicId: string): Promise<CloudinaryResponse>;
    getUrl(publicId: string, options?: any): string;
    search(query: string, options?: any): Promise<any>;
    getResourcesByBaseFolder(baseFolder: string, userId?: string, options?: CloudinaryResourceOptions): Promise<CloudinaryResponse>;
    getResourcesByFolder(folder: string, options?: CloudinaryResourceOptions): Promise<CloudinaryResponse>;
    getResourcesByTag(tag: string, options?: CloudinaryResourceOptions): Promise<CloudinaryResponse>;
    getResourcesByIds(publicIds: string[], options?: {
        resource_type?: string;
    }): Promise<CloudinaryResponse>;
    searchResources(expression: string, options?: CloudinarySearchOptions): Promise<CloudinaryResponse>;
    listFolders(): Promise<any>;
    listSubFolders(folder: string): Promise<any>;
    createFolder(path: string): Promise<any>;
    updateMetadata(publicId: string, metadata: Record<string, any>): Promise<any>;
    addTags(publicId: string, tags: string[]): Promise<any>;
    createZip(urls: string[], options?: {
        folderName?: string;
    }): Promise<Buffer>;
    uploadToUserFolder(file: Express.Multer.File, userId: string, type?: string): Promise<any>;
    getUserResources(userId: string, type?: string): Promise<CloudinaryResponse>;
    deleteUserResource(publicId: string, userId: string, folder: any): Promise<boolean>;
    createFileFromUrl(url: string): Promise<Express.Multer.File>;
}
