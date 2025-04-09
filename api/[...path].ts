import { createProxyMiddleware } from 'http-proxy-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';

// Create a proxy instance with v3.x compatible options
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:3001', // Local NestJS server
  changeOrigin: true,
  pathRewrite: {
    '^/api/': '/api/', // Keep the /api/ prefix
  },
  // Use the correct property for response handling in v3.x
  on: {
    proxyRes: (
      proxyRes: IncomingMessage,
      req: IncomingMessage,
      res: ServerResponse,
    ) => {
      // Add CORS headers to the proxy response
      if (proxyRes.headers) {
        proxyRes.headers['Access-Control-Allow-Origin'] =
          'https://oxyz-brand-app.vercel.app';
        proxyRes.headers['Access-Control-Allow-Methods'] =
          'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] =
          'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      }
    },
  },
});

// Export the API handler
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle OPTIONS request directly for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader(
      'Access-Control-Allow-Origin',
      'https://oxyz-brand-app.vercel.app',
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
    return;
  }

  // Log the request for debugging
  console.log(`Proxying request to: ${req.url}`);

  // Forward the request to the target API
  return apiProxy(req as IncomingMessage, res as unknown as ServerResponse);
}

// Configure the API route handler
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
