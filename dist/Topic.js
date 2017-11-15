'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Topic = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var topicItems = {},
    activeObserver = new _set2.default(),
    refreshTimer = new _map2.default(),
    UN_SUBSCRIBED = 'is_dead',
    RUN_ONCE = 'is_once';
var tokenGenerator = 0;

/**
 * Based on observer mode
 */

var Topic = function () {
  function Topic(name) {
    (0, _classCallCheck3.default)(this, Topic);

    this.topicName = name;
  }

  /**
   * get subscriptions for test
   * @param topicName
   * @returns {Array}
   */


  (0, _createClass3.default)(Topic, [{
    key: 'publish',


    /**
     * Publish your topic with arguments
     * Observer will notice all of the subscribers with arguments
     * @param {...} args
     */
    value: function publish() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var name = this.topicName;
      var itemChanged = false;

      if (topicItems[name]) {
        if (activeObserver.has(name)) {
          throw new ReferenceError('Conflict, don\'t publish \'' + name + '\' in subscription function');
        }

        activeObserver.add(name);
        topicItems[name].forEach(function (item) {
          if (!item[UN_SUBSCRIBED]) {
            try {
              item['callback'].apply(item, args);
            } catch (e) {
              activeObserver.delete(name);
              throw e;
            } finally {
              if (item[RUN_ONCE]) {
                itemChanged = true;
                item[UN_SUBSCRIBED] = true;
              }
            }
          }
        });

        if (itemChanged) {
          Topic.refresh(name);
        }

        activeObserver.delete(name);
      }
    }

    /**
     * Subscribe any topic and listen relative event published by observer,
     * You can use callback function to receive arguments and run your business.
     * @param callback
     * @returns {{name: string, token: string}} handle
     */

  }, {
    key: 'subscribe',
    value: function subscribe(callback) {
      if (typeof callback !== 'function') {
        throw new TypeError('Argument `callback` should be a function.');
      }

      var name = this.topicName,
          token = ++tokenGenerator + ',x,' + tokenGenerator;

      if (!topicItems[name]) {
        topicItems[name] = [];
      }

      topicItems[name].push({
        token: token,
        callback: callback
      });

      return { name: name, token: token };
    }

    /**
     * Once you receive the relative event, subscription will be destroyed automatically.
     * It means, you don't need call method to destroy the subscription by yourself.
     * @see subscribe
     * @param callback
     * @returns {{name: string, token: string}} handle
     */

  }, {
    key: 'subscribeOnce',
    value: function subscribeOnce(callback) {
      var handle = this.subscribe(callback),
          name = this.topicName;

      topicItems[name][topicItems[name].length - 1][RUN_ONCE] = true;

      return handle;
    }
  }], [{
    key: 'getItems',
    value: function getItems(topicName) {
      return topicItems[topicName] || [];
    }

    /**
     * reduce memory size by remove the unSubscribed items
     * and publish action can be faster
     * @param {string} topicName
     */

  }, {
    key: 'refresh',
    value: function refresh(topicName) {
      if (!refreshTimer.has(topicName)) {
        refreshTimer.set(topicName, setTimeout(function () {
          topicItems[topicName] = topicItems[topicName].filter(function (item) {
            return !item[UN_SUBSCRIBED];
          });
          refreshTimer.delete(topicName);
        }));
      }
    }
  }, {
    key: 'destroy',


    /**
     * destroy your subscription by yourself
     * @param {string} topicName
     * @param {string} token
     * @returns {boolean}
     */
    value: function destroy(topicName, token) {
      if (topicItems[topicName]) {
        return topicItems[topicName].some(function (item) {
          if (item['token'] === token && !item[UN_SUBSCRIBED]) {
            item[UN_SUBSCRIBED] = true;
            Topic.refresh(topicName);

            return true;
          }
        });
      }

      return false;
    }
  }]);
  return Topic;
}();

exports.Topic = Topic;