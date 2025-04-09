export declare class HealthController {
    healthCheck(): {
        status: string;
        timestamp: string;
        service: string;
    };
    detailedHealthCheck(): {
        status: string;
        timestamp: string;
        service: string;
        environment: "development" | "production" | "test";
        version: string;
    };
}
