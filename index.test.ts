import { expect } from 'chai';
import sleep from 'sleep-promise';
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

  token.unsubscribe();
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

  token.unsubscribe();
  topic.publish('hello');
  expect(counter).to.equal(0);

  token.unsubscribe();
  topic.publish('hello');
  expect(counter).to.equal(0);

  token.unsubscribe();
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

it ('can keep publishing', async () => {
  const topic = new Topic<{
    hello: (num: number) => void;
  }>();
  let counter = 0;

  topic.keep('hello', true, 3);
  topic.subscribe('hello', (num) => {
    counter += num;
  });

  expect(counter).to.equal(3);

  topic.publish('hello', 4);
  expect(counter).to.equal(7);

  topic.keep('hello', true, 2);
  expect(counter).to.equal(9);
});

it ('can set deps for keep publish', async () => {
  const topic = new Topic<{
    hello: (num: number) => void;
  }>();
  let deps = false;
  let counter = 0;

  topic.subscribe('hello', (num) => {
    counter += num;
  });

  const token1 = topic.keep('hello', true, 1);
  expect(counter).to.equal(1);
  token1.release();

  const token2 = topic.keep('hello', () => deps, 1);
  expect(counter).to.equal(1);
  token2.release();

  deps = true;
  topic.keep('hello', () => deps, 1);
  expect(counter).to.equal(2);

  topic.subscribe('hello', (num) => {
    counter += num * 2;
  });
  expect(counter).to.equal(4);

  deps = false;
  topic.subscribe('hello', (num) => {
    counter += num * 20;
  });
  expect(counter).to.equal(4);
  await sleep(5);
  expect(counter).to.equal(4);
});

it ('can release keeped handle', async () => {
  const topic = new Topic<{
    hello: (num: number) => void;
  }>();
  let counter = 0;

  const token1 = topic.keep('hello', true, 1);
  topic.subscribe('hello', (num) => {
    counter += num;
  });

  expect(counter).to.equal(1);

  const token2 = topic.keep('hello', true, 10);
  expect(counter).to.equal(11);

  topic.subscribe('hello', (num) => {
    counter += num;
  });

  expect(counter).to.equal(22);

  // remain 1 keeper
  token2.release();
  topic.subscribe('hello', (num) => {
    counter += num;
  });
  await sleep(5);
  expect(counter).to.equal(23);

  // remain 0 keeper
  token1.release();
  topic.subscribe('hello', (num) => {
    counter += num;
  });
  await sleep(5);
  expect(counter).to.equal(23);
});

it ('can compose keep and subscribeOnce', async () => {
  const topic = new Topic<{
    hello: (num: number) => void;
  }>();

  let counter = 0;

  const token1 = topic.keep('hello', true, 1);
  topic.subscribeOnce('hello', (num) => {
    counter += num;
  });

  expect(counter).to.equal(1);

  token1.release();
});
