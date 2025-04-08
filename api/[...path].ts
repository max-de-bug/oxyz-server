import { createProxyMiddleware } from 'http-proxy-middleware';
import { NextApiRequest, NextApiResponse } from 'next';

// Create a proxy instance
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/': '/',
  },
  onProxyRes: (proxyRes) => {
    // Add CORS headers to proxy response
    proxyRes.headers['Access-Control-Allow-Origin'] =
      'https://oxyz-brand-app.vercel.app';
    proxyRes.headers['Access-Control-Allow-Methods'] =
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] =
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
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

  // Forward the request to the target API
  return apiProxy(req, res);
}

// Configure the API route handler
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
