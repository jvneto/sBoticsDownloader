'use strict';

const GitHub = require('github-base');
var extend = require('extend-shallow');
var each = require('each-parallel-async');

const GithubBase = new GitHub();

function sBoticsDownloader (settings){
  if (!(this instanceof sBoticsDownloader))
    return new sBoticsDownloader(settings);

  const settingsInstance = extend(
    { branch: 'master', detailedAnswer: 'false' },
    settings,
  );
  settingsInstance.json = false;
  settingsInstance.apiurl = 'https://raw.githubusercontent.com';
  GithubBase.call(this, settingsInstance);
  this.settings = extend({}, settingsInstance, this.settings);
};
GithubBase.extend(sBoticsDownloader);

sBoticsDownloader.prototype.file = function (path, options, cb) {
  if (typeof options === 'function'){cb = options; options = {} }
  if (typeof cb !== 'function') throw new TypeError('expected callback to be a function');

  var settingsInstance = extend({branch: 'master', path: path}, this.settings, options);
  if (!settingsInstance.repository) return cb(new Error('expected "options.repository" to be specified'));

  var set = settingsInstance.repository.split('/');
  if (set.length > 1) {
    settingsInstance.user = set[0];
    settingsInstance.repository = set[1];
  }
  
  const detailedAnswer = settingsInstance.detailedAnswer;

  this.get('/:user/:repository/:branch/:path', settingsInstance, function(err, contents, response, size) {
    if (err) return cb(err);  
    console.log(response);
    cb( !detailedAnswer ? (null, {path: path, contents: contents}):(null, {path: path, contents: contents, }) );
  });
  return this;
};

module.exports = sBoticsDownloader;
