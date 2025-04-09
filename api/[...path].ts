import { createProxyMiddleware } from 'http-proxy-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';

// Create a proxy instance with v3.x compatible options
const apiProxy = createProxyMiddleware({
  target: process.env.NEXT_PUBLIC_API_URL || 'https://oxyz-server.vercel.app',
  changeOrigin: true,
  pathRewrite: {
    '^/api/': '/',
  },
  headers: {
    'Access-Control-Allow-Origin': 'https://oxyz-brand-app.vercel.app',
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers':
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  },
  selfHandleResponse: false, // Let the target server handle the response
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
