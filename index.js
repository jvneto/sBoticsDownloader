'use strict';

const GithubBase = require('github-base');
var extend = require('extend-shallow');
var each = require('each-parallel-async');
const GitHub = require('github-base');

function sBoticsDownloader(settings) {
  if (!(this instanceof sBoticsDownloader))
    return new sBoticsDownloader(settings);

  const settingsInstance = extend(
    { branch: 'master', detailedAnswer: 'false', wordsToRemove: '' },
    settings,
  );
  settingsInstance.json = false;
  settingsInstance.apiurl = 'https://raw.githubusercontent.com';
  GithubBase.call(this, settingsInstance);
  this.settings = extend({}, settingsInstance, this.settings);
}
GithubBase.extend(sBoticsDownloader);

sBoticsDownloader.prototype.file = function (path, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  if (typeof cb !== 'function')
    throw new TypeError('expected callback to be a function');

  var settingsInstance = extend(
    { branch: 'master', path: path, downloadMode: options.downloadMode },
    this.settings,
    options,
  );
  if (!settingsInstance.repository)
    return cb(new Error('expected "options.repository" to be specified'));

  const getrepository = settingsInstance.repository.split('/');
  if (getrepository.length > 1) {
    settingsInstance.user = getrepository[0];
    settingsInstance.repository = getrepository[1];
  }

  var downloadMode = settingsInstance.downloadMode;
  const externalDownload = settingsInstance.externalDownload;
  const detailedAnswer = settingsInstance.detailedAnswer;
  const wordsToRemove = settingsInstance.wordsToRemove;
  if (!downloadMode || !externalDownload) downloadMode = 'github';

  if (wordsToRemove)
    wordsToRemove.forEach((element) => {
      if (path.includes(element)) path = path.replace(element, '');
    });

  if (downloadMode == 'external')
    (async () => {
      try {
        const response = await axios.get(
          'https://raw.githubusercontent.com/Txiag/sBotics/master/W32/MonoBleedingEdge/EmbedRuntime/MonoPosixHelper.dll',
        );
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    })();
  else
    this.get(
      '/:user/:repository/:branch/:path',
      settingsInstance,
      (err, contents, response) => {
        const status = {
          code: response.statusCode,
          message: response.statusMessage,
        };
        if (err || response.statusCode != 200) return cb({ status: status });
        cb(
          null,
          !detailedAnswer
            ? { path: path, file: contents }
            : {
                status: status,
                path: path,
                size: response.headers['content-length'],
                file: contents,
              },
        );
      },
    );

  return this;
};

module.exports = sBoticsDownloader;
