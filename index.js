'use strict';

var gitbase = require('github-base');
var extend = require('extend-shallow');
var each = require('each-parallel-async');

const sBoticsDownloader = (settings) => {
  if (!(this instanceof sBoticsDownloader))
    return new sBoticsDownloader(settings);

  const settingsInstance = extend(
    { branch: 'master', detailedAnswer: 'false' },
    settings,
  );
  settingsInstance.json = false;
  settingsInstance.apiurl = 'https://raw.githubusercontent.com';
  gitbase.call(this, settingsInstance);
  this.settings = extend({}, settingsInstance, this.settings);
};
gitBase.extend(sBoticsDownloader);

sBoticsDownloader.prototype.file = function (path, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (typeof cb !== 'function')
    throw new TypeError('expected callback to be a function');

  var opts = extend({ branch: 'master', path: path }, this.options, options);
  if (!opts.repo) {
    cb(new Error('expected "options.repo" to be specified'));
    return;
  }

  var segs = opts.repo.split('/');
  if (segs.length > 1) {
    opts.owner = segs[0];
    opts.repo = segs[1];
  }

  this.get('/:owner/:repo/:branch/:path', opts, (err, contents) => {
    if (err) return cb(err);
    cb(null, { path: path, contents: contents });
  });
  return this;
};

module.exports = sBoticsDownloader;
