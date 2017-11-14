const
  topicItems = {},
  activeObserver = new Set(),
  refreshTimer = new Map();
const
  UN_SUBSCRIBED = 'is_dead',
  RUN_ONCE = 'is_once';
let
  tokenGenerator = 0;

class Topic {
  topicName;

  constructor(name) {
    this.topicName = name;
  }
  
  static getItems(topicName) {
    return topicItems[topicName] || [];
  }
  
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
   * destroy your description by yourself
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
   * @param args
   */
  publish(...args) {
    const name = this.topicName;

    if (topicItems[name]) {
      if (activeObserver.has(name)) {
        throw new ReferenceError(`Conflict, don't publish '${name}' in subscription function`);
      }
      
      activeObserver.add(name);
      topicItems[name].forEach((item) => {
        if (!item[UN_SUBSCRIBED]) {
          // fixme: 不做try...catch，循环能否继续下去
          try {
            item['callback'](...args);
          } catch (e) {
            setTimeout(() => {
              throw e;
            });
          }
        }

        if (item[RUN_ONCE]) {
          item[UN_SUBSCRIBED] = true;
        }
      });
      Topic.refresh(name);
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

    return {
      name,
      token,
    };
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

export {
  Topic,
}
