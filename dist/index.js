'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.topic = undefined;

var _Topic = require('./Topic');

var topicHandles = {};

/**
 * 
 * @param {string|number} topicName
 * @returns {Topic}
 */
var topic = function topic(topicName) {
  topicName = String(topicName).trim();

  if (!topicHandles[topicName]) {
    topicHandles[topicName] = new _Topic.Topic(topicName);
  }

  return topicHandles[topicName];
};

/**
 * @param {{name: string, token: string}} handle
 * @returns {boolean}
 */
topic.unsubscribe = function (handle) {
  return _Topic.Topic.destroy(handle.name, handle.token);
};

exports.topic = topic;