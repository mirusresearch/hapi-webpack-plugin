/**
 * Import dependencies
 */
import {version} from '../package.json';
import Path from 'path';
import Webpack from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';


/**
 * Define plugin
 */
function register(server, options, next) {
  // Define variables
  let config = {};
  let compiler;

  // Require config from path
  if (typeof options === 'string') {
    const configPath = Path.resolve(process.cwd(), options);
    config = require(configPath);
    compiler = new Webpack(config);
  }
  else {
    config = options;
    compiler = config.compiler;
  }

  // Create middlewares
  const webpackDevMiddleware = WebpackDevMiddleware(compiler, config.assets);
  const webpackHotMiddleware = WebpackHotMiddleware(compiler, config.hot);

  // Handle webpackDevMiddleware
  server.ext('onRequest', (request, reply) => {
    const {req, res} = request.raw;
    webpackDevMiddleware(req, res, error => {
      if (error) {
        return reply(error);
      }
      reply.continue();
    });
  });

  // Handle webpackHotMiddleware
  server.ext('onRequest', (request, reply) => {
    const {req, res} = request.raw;
    webpackHotMiddleware(req, res, error => {
      if (error) {
        return reply(error);
      }
      reply.continue();
    });
  });

  // Expose compiler and middleware instances
  server.expose({compiler,middleware:{dev:webpackDevMiddleware,hot:webpackHotMiddleware}});

  // Done
  return next();
}


/**
 * Define plugin attributes
 */
register.attributes = {
  name: 'webpack',
  version
};


/**
 * Export plugin
 */
export default register;

