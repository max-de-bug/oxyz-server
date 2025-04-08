declare class PresetFilterDto {
    name?: string;
    filter?: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
        sepia?: number;
    };
}
declare class TextOverlayDto {
    text?: string;
    fontSize?: number;
    color?: string;
    fontFamily?: string;
    isBold?: boolean;
    isItalic?: boolean;
    isVisible?: boolean;
}
declare class PositionDto {
    x?: number;
    y?: number;
    rotation?: number;
    scale?: number;
}
export declare class UpdateDesignDto {
    name?: string;
    imageId?: string;
    logoId?: string;
    preset?: PresetFilterDto;
    textOverlay?: TextOverlayDto;
    position?: PositionDto;
    collectionId?: string;
    designState?: any;
}
export {};
