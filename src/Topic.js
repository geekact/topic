const
  topicItems = {},
  activeObserver = new Set(),
  refreshTimer = new Map(),
  UN_SUBSCRIBED = 'is_dead',
  RUN_ONCE = 'is_once';
let
  tokenGenerator = 0;

/**
 * Based on observer mode
 */
class Topic {
  topicName;

  constructor(name) {
    this.topicName = name;
  }

  /**
   * get subscriptions for test
   * @param topicName
   * @returns {Array}
   */
  static getItems(topicName) {
    return topicItems[topicName] || [];
  }

  /**
   * reduce memory size by remove the unSubscribed items
   * and publish action can be faster
   * @param {string} topicName
   */
  static refresh = (topicName) => {
    if (!refreshTimer.has(topicName)) {
      refreshTimer.set(
        topicName,
        setTimeout(() => {
          topicItems[topicName] = topicItems[topicName].filter((item) => {
            return !item[UN_SUBSCRIBED];
          });
          refreshTimer.delete(topicName);
        })
      );
    }
  };

  /**
   * destroy your subscription by yourself
   * @param {string} topicName
   * @param {string} token
   * @returns {boolean}
   */
  static destroy = (topicName, token) => {
    if (topicItems[topicName]) {
      return topicItems[topicName].some((item) => {
        if (item['token'] === token && !item[UN_SUBSCRIBED]) {
          item[UN_SUBSCRIBED] = true;
          Topic.refresh(topicName);

          return true;
        }
      });
    }
    
    return false;
  };

  /**
   * Publish your topic with arguments
   * Observer will notice all of the subscribers with arguments
   * @param {...} args
   */
  publish(...args) {
    const name = this.topicName;
    let itemChanged = false;

    if (topicItems[name]) {
      if (activeObserver.has(name)) {
        throw new ReferenceError(`Conflict, don't publish '${name}' in subscription function`);
      }
      
      activeObserver.add(name);
      topicItems[name].forEach((item) => {
        if (!item[UN_SUBSCRIBED]) {
          try {
            item['callback'](...args);
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
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Argument `callback` should be a function.');
    }

    const
      name = this.topicName,
      token = ++tokenGenerator + ',x,' + tokenGenerator;

    if (!topicItems[name]) {
      topicItems[name] = [];
    }

    topicItems[name].push({
      token,
      callback,
    });

    return {name, token};
  }

  /**
   * Once you receive the relative event, subscription will be destroyed automatically.
   * It means, you don't need call method to destroy the subscription by yourself.
   * @see subscribe
   * @param callback
   * @returns {{name: string, token: string}} handle
   */
  subscribeOnce(callback) {
    const
      handle = this.subscribe(callback),
      name = this.topicName;

    topicItems[name][topicItems[name].length - 1][RUN_ONCE] = true;

    return handle;
  }
}

export {Topic};
