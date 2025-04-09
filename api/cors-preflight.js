module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://oxyz-brand-app.vercel.app',
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  );
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Return 204 No Content for OPTIONS requests
  res.status(204).end();
};
