import { expect } from 'chai';
import { Topic } from './index';

it ('can subscribe', () => {
  const topic = new Topic();
  let counter = 0;

  topic.subscribe('hello', () => {
    ++counter;
  });
  topic.subscribe('hello2', () => {
    ++counter;
    ++counter;
  });

  expect(counter).to.equal(0);
  topic.publish('hello');
  expect(counter).to.equal(1);
  topic.publish('hello');
  expect(counter).to.equal(2);

  topic.publish('hello2');
  expect(counter).to.equal(4);
  topic.publish('hello2');
  expect(counter).to.equal(6);
});

it ('can subscribe topic only once', () => {
  const topic = new Topic();
  let counter = 0;

  topic.subscribeOnce('hello', () => {
    ++counter;
  });

  topic.subscribeOnce('world', () => {
    counter += 10;
  });

  expect(counter).to.equal(0);
  topic.publish('hello');
  expect(counter).to.equal(1);
  topic.publish('hello');
  expect(counter).to.equal(1);
  topic.publish('hello');
  expect(counter).to.equal(1);

  topic.publish('world');
  expect(counter).to.equal(11);
});

it ('can unsubscribe the topic by token', () => {
  const topic = new Topic();
  let counter = 0;

  const token = topic.subscribe('hello', () => {
    ++counter;
  });

  expect(counter).to.equal(0);
  topic.publish('hello');
  expect(counter).to.equal(1);
  topic.publish('hello');
  expect(counter).to.equal(2);

  topic.unsubscribe(token);
  topic.publish('hello');
  expect(counter).to.equal(2);
});

it ('can unpublish multiple times', () => {
  const topic = new Topic();
  let counter = 0;

  const token = topic.subscribe('hello', () => {
    ++counter;
  });

  topic.subscribe('hello1', () => {
    ++counter;
  });

  topic.unsubscribe(token);
  topic.publish('hello');
  expect(counter).to.equal(0);

  topic.unsubscribe(token);
  topic.publish('hello');
  expect(counter).to.equal(0);

  topic.unsubscribe();
  topic.publish('hello1');
  expect(counter).to.equal(1);
});

it ('can take parameters', () => {
  const topic = new Topic<{
    sum: (a: number, b: number) => void;
  }>();
  let sum = 0;

  topic.subscribe('sum', (a, b) => {
    sum = a + b;
  });

  expect(sum).to.equal(0);
  topic.publish('sum', 2, 5);
  expect(sum).to.equal(7);
  topic.publish('sum', 100, 70);
  expect(sum).to.equal(170);
});

it ('can subscribe when publishing but only effect next time', () => {
  const topic = new Topic();
  let counter = 0;

  topic.subscribe('hello', () => {
    ++counter;

    topic.subscribe('hello', () => {
      ++counter;
      ++counter;
    });

    topic.subscribe('hello', () => {
      ++counter;
    });

    topic.subscribe('world', () => {
      ++counter;
    });
  });

  expect(counter).to.equal(0);
  topic.publish('hello');
  expect(counter).to.equal(1);
  topic.publish('hello');
  expect(counter).to.equal(5);
  topic.publish('world');
  expect(counter).to.equal(7);
});
