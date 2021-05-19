'use strict';

const GithubBase = require('github-base');
var extend = require('extend-shallow');
const axios = require('axios');
var each = require('each-parallel-async');

function sBoticsDownloader(settings) {
  if (!(this instanceof sBoticsDownloader))
    return new sBoticsDownloader(settings);

  const settingsInstance = extend(
    {
      branch: 'master',
      detailedAnswer: false,
      externalDownload: false,
      wordsToRemove: '',
    },
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
    {
      branch: 'master',
      path: path,
      downloadMode: options.downloadMode,
      savePath: options.savePath,
    },
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
  const savePath = settingsInstance.savePath;

  if (!downloadMode || !externalDownload) downloadMode = 'github';

  if (wordsToRemove && !savePath)
    wordsToRemove.forEach((element) => {
      if (path.includes(element)) path = path.replace(element, '');
    });
  else if (savePath) path = savePath;

  if (downloadMode == 'external')
    (async () => {
      try {
        const response = await axios.get(settingsInstance.path);
        const status = {
          code: response.status,
          message: response.statusText,
        };
        cb(
          null,
          !detailedAnswer
            ? { path: path, file: response.data }
            : {
                status: status,
                path: path,
                size: response.headers['content-length'],
                file: response.data,
              },
        );
      } catch (error) {
        const status = { code: undefined, message: '' };
        cb({ error: error, donwloadMode: downloadMode, status: status });
      }
    })();
  else
    this.get(
      '/:user/:repository/:branch/:path',
      settingsInstance,
      (error, contents, response) => {
        const status = {
          code: response.statusCode,
          message: response.statusMessage,
        };
        if (error || response.statusCode != 200)
          return cb({
            error: error,
            donwloadMode: downloadMode,
            status: status,
          });
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
