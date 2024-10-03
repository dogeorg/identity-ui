export default {
  port: 6060,
  rootDir: '../src',
  appIndex: '../src/index.html',
  watch: true,
  middleware: [
    function corsMiddleware(ctx, next) {
      // Check if the incoming request is for the static dir stuff
      if (ctx.url.includes('/static/')) {
        // Set CORS headers
        ctx.response.set('Access-Control-Allow-Origin', '*');
        ctx.response.set('Access-Control-Allow-Methods', 'OPTIONS');
        ctx.response.set('Access-Control-Allow-Methods', 'GET');
        ctx.response.set('Access-Control-Allow-Headers', 'Content-Type');
      }
      // TODO: review appropriateness, limit to pups.
      // Below, we are allowing all origins to fetch resources
      ctx.response.set('Access-Control-Allow-Origin', '*');
      ctx.response.set('Access-Control-Allow-Methods', 'OPTIONS');
      ctx.response.set('Access-Control-Allow-Methods', 'GET');
      ctx.response.set('Access-Control-Allow-Headers', 'Content-Type');

      return next();
    }
  ]
};