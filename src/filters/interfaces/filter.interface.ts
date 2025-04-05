export interface FilterValues {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sepia?: number;
  opacity?: number;
}

export interface Filter {
  id: string;
  userId: string;
  name: string;
  filter: FilterValues;
  url?: string | null;
  publicId?: string | null;
  isDefault: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
