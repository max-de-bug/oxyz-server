export interface CloudinaryResource {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    created_at: string;
    tags?: string[];
    context?: Record<string, any>;
}
export interface CloudinaryResponse {
    resources: any[];
    next_cursor?: string | null;
    total?: number;
}
export interface CloudinaryResourceOptions {
    max_results?: number;
    next_cursor?: string;
    resource_type?: string;
    includeDefaults?: boolean;
}
export interface CloudinarySearchOptions {
    max_results?: number;
    next_cursor?: string;
    sort_by?: Array<{
        field: string;
        direction: 'asc' | 'desc';
    }>;
    with_field?: string[];
}
