/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var bodyParser = require('body-parser')
var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');
var proto = require('./application');
var Route = require('./router/route');
var Router = require('./router');
var req = require('./request');
var res = require('./response');

/**
 * Expose `createApplication()`.
 */

exports = module.exports = createApplication;

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */

function createApplication() {
  var app = function(req, res, next) {
    // 이 함수 객체가 리턴되는데 이 함수를 실행시키면 app이라는 rhs서치를 하는데 현재 객체에는 app이라는 변수가 없으므로
    // 프로토 타입링크를 타고 올라가면서 app객체를 찾는다. (proto or EventEmitter.prototype) 
    app.handle(req, res, next);
  };

  // mixin은 첫번째 인자의 내부 프로토타입이 두번째 인자를 가리키게 하는 것이다.
  // 세번째 인자(boolean)은 false일 경우, 첫번째 인자에 두번째인자와 같은 이름의 키워드가 없을 경우에만 가리킨다. 
  mixin(app, EventEmitter.prototype, false);
  mixin(app, proto, false);

  // expose the prototype that will get set on requests
  // app이라는 객체에 request프로퍼티에 객체를 넣는다. (request모듈로부터 가져온 req객체를 내부 프로토타입이 가리키는 객체)
  app.request = Object.create(req, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  })

  // expose the prototype that will get set on responses
  app.response = Object.create(res, {
    app: { configurable: true, enumerable: true, writable: true, value: app }
  })

  // 앱 객체에는 init메서드가 없지만 app의 내부 프로퍼티는 EventEmitter.prototype 객체와 application모듈로부터 가져온 객체를 가리키므로
  // 가져온 객체들에 있는 init메서드를 찾아서 실행한다.
  app.init();
  return app;
}

/**
 * Expose the prototypes.
 */

exports.application = proto;
exports.request = req;
exports.response = res;

/**
 * Expose constructors.
 */

exports.Route = Route;
exports.Router = Router;

/**
 * Expose middleware
 */

exports.json = bodyParser.json
exports.query = require('./middleware/query');
exports.raw = bodyParser.raw
exports.static = require('serve-static');
exports.text = bodyParser.text
exports.urlencoded = bodyParser.urlencoded

/**
 * Replace removed middleware with an appropriate error message.
 */

var removedMiddlewares = [
  'bodyParser',
  'compress',
  'cookieSession',
  'session',
  'logger',
  'cookieParser',
  'favicon',
  'responseTime',
  'errorHandler',
  'timeout',
  'methodOverride',
  'vhost',
  'csrf',
  'directory',
  'limit',
  'multipart',
  'staticCache'
]

removedMiddlewares.forEach(function (name) {
  Object.defineProperty(exports, name, {
    get: function () {
      throw new Error('Most middleware (like ' + name + ') is no longer bundled with Express and must be installed separately. Please see https://github.com/senchalabs/connect#middleware.');
    },
    configurable: true
  });
});
