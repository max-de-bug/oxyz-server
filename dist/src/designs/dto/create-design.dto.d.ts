declare class FilterDto {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    sepia?: number;
    opacity?: number;
}
declare class TextOverlayDto {
    text: string;
    color: string;
    fontFamily: string;
    fontSize?: number;
    isBold?: boolean;
    isItalic?: boolean;
    isVisible?: boolean;
}
declare class LogoPositionDto {
    url: string;
    position: {
        x: number;
        y: number;
    };
    size?: number;
}
export declare class CreateDesignDto {
    name: string;
    imageUrl: string;
    filter?: FilterDto;
    textOverlay?: TextOverlayDto;
    logos?: LogoPositionDto[];
    aspectRatio: string;
}
export {};
