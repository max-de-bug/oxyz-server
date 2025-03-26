/**
 * Interface for Cloudinary resource
 */
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

/**
 * Interface for Cloudinary API response
 */
export interface CloudinaryResponse {
  resources: any[];
  next_cursor?: string | null;
  total?: number;
}

/**
 * Options for fetching resources from Cloudinary
 */
export interface CloudinaryResourceOptions {
  max_results?: number;
  next_cursor?: string;
  resource_type?: string;
  includeDefaults?: boolean;
}

/**
 * Options for searching resources in Cloudinary
 */
export interface CloudinarySearchOptions {
  max_results?: number;
  next_cursor?: string;
  sort_by?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  with_field?: string[];
}
