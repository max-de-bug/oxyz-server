import { CloudinaryService } from './cloudinary.service';
import { CloudinaryResponse } from './interfaces/cloudinary.interfaces';
export declare class CloudinaryController {
    private readonly cloudinaryService;
    constructor(cloudinaryService: CloudinaryService);
    listFolders(): Promise<any>;
    listSubFolders(folder: string): Promise<any>;
    getResources(folder: string, maxResults?: string, nextCursor?: string): Promise<CloudinaryResponse>;
    searchResources(query: string, maxResults?: string, nextCursor?: string): Promise<CloudinaryResponse>;
}
