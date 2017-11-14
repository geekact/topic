import {Topic} from './Topic';

const topichandles = {};

/**
 * 
 * @param {string} topicName
 * @returns {Topic}
 */
const topic = (topicName) => {
  topicName = String(topicName).trim();
  
  if (!topichandles[topicName]) {
    topichandles[topicName] = new Topic(topicName);
  }
  
  return topichandles[topicName];
};

/**
 * @param {{name: string, token: string}} handle
 * @returns {boolean}
 */
topic.unsubscribe = (handle) => {
  return Topic.destroy(handle.name, handle.token);
};

export {
  topic,
};
