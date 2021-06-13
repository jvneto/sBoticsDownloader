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
  if (typeof options === 'function') (cb = options), (options = {});

  var settingsInstance = extend(
    {
      branch: 'master',
      path: path,
      downloadMode: '',
      savePath: '',
    },
    this.settings,
    options,
  );

  if (!settingsInstance.repository)
    throw new TypeError('expected "options.repository" to be specified');

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

  try {
    this.get(
      '/:user/:repository/:branch/:path',
      settingsInstance,
      (error, contents, response) => {
        try {
          if (error || response['statusCode'] != 200) {
            cb({
              error: error,
              donwloadMode: downloadMode,
              status: {
                code: response['statusCode'] ? response['statusCode'] : 500,
                message: response['statusMessage']
                  ? response['statusMessage']
                  : '',
              },
            });
          } else {
            if (!detailedAnswer) {
              cb(null, { path: path, file: contents });
            } else {
              cb(null, {
                status: {
                  code: response['statusCode'] ? response['statusCode'] : 500,
                  message: response['statusMessage']
                    ? response['statusMessage']
                    : '',
                },
                path: path,
                size: response.headers['content-length'],
                file: contents,
              });
            }
          }
        } catch (error) {
          cb({
            error: 404,
            donwloadMode: '',
            status: '',
          });
        }
      },
    );
  } catch (error) {
    cb({
      error: 500,
      donwloadMode: '',
      status: '',
    });
  }
  return this;
};

module.exports = sBoticsDownloader;
