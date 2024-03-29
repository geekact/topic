import { Topic } from './index';

it('can subscribe', () => {
  const topic = new Topic();
  let counter = 0;

  topic.subscribe('hello', () => {
    ++counter;
  });
  topic.subscribe('hello2', () => {
    ++counter;
    ++counter;
  });

  expect(counter).toEqual(0);
  topic.publish('hello');
  expect(counter).toEqual(1);
  topic.publish('hello');
  expect(counter).toEqual(2);

  topic.publish('hello2');
  expect(counter).toEqual(4);
  topic.publish('hello2');
  expect(counter).toEqual(6);
});

it('can subscribe topic only once', () => {
  const topic = new Topic();
  let counter = 0;

  topic.subscribeOnce('hello', () => {
    ++counter;
  });

  topic.subscribeOnce('world', () => {
    counter += 10;
  });

  expect(counter).toEqual(0);
  topic.publish('hello');
  expect(counter).toEqual(1);
  topic.publish('hello');
  expect(counter).toEqual(1);
  topic.publish('hello');
  expect(counter).toEqual(1);

  topic.publish('world');
  expect(counter).toEqual(11);
});

it('can unsubscribe the topic by token', () => {
  const topic = new Topic();
  let counter = 0;

  const token = topic.subscribe('hello', () => {
    ++counter;
  });

  expect(counter).toEqual(0);
  topic.publish('hello');
  expect(counter).toEqual(1);
  topic.publish('hello');
  expect(counter).toEqual(2);

  token.unsubscribe();
  topic.publish('hello');
  expect(counter).toEqual(2);
});

it('can unpublish multiple times', () => {
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
  expect(counter).toEqual(0);

  token.unsubscribe();
  topic.publish('hello');
  expect(counter).toEqual(0);

  token.unsubscribe();
  topic.publish('hello1');
  expect(counter).toEqual(1);
});

it('can take parameters', () => {
  const topic = new Topic<{
    sum: [a: number, b: number];
  }>();
  let sum = 0;

  topic.subscribe('sum', (a, b) => {
    sum = a + b;
  });

  expect(sum).toEqual(0);
  topic.publish('sum', 2, 5);
  expect(sum).toEqual(7);
  topic.publish('sum', 100, 70);
  expect(sum).toEqual(170);
});

it('can subscribe when publishing but only effect next time', () => {
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

  expect(counter).toEqual(0);
  topic.publish('hello');
  expect(counter).toEqual(1);
  topic.publish('hello');
  expect(counter).toEqual(5);
  topic.publish('world');
  expect(counter).toEqual(7);
});

it('can keep publishing', () => {
  const topic = new Topic<{
    hello: [num: number];
  }>();
  let counter = 0;

  topic.keep('hello', true, 3);
  topic.subscribe('hello', (num) => {
    counter += num;
  });

  expect(counter).toEqual(3);

  topic.publish('hello', 4);
  expect(counter).toEqual(7);

  topic.keep('hello', true, 2);
  expect(counter).toEqual(9);
});

it('can set deps for keep publish', async () => {
  const topic = new Topic<{
    hello: [num: number];
  }>();
  let deps = false;
  let counter = 0;

  topic.subscribe('hello', (num) => {
    counter += num;
  });

  const token1 = topic.keep('hello', true, 1);
  expect(counter).toEqual(1);
  token1.release();

  const token2 = topic.keep('hello', () => deps, 1);
  expect(counter).toEqual(1);
  token2.release();

  deps = true;
  topic.keep('hello', () => deps, 1);
  expect(counter).toEqual(2);

  topic.subscribe('hello', (num) => {
    counter += num * 2;
  });
  expect(counter).toEqual(4);

  deps = false;
  topic.subscribe('hello', (num) => {
    counter += num * 20;
  });
  expect(counter).toEqual(4);
});

it('can release keeped handle', async () => {
  const topic = new Topic<{
    hello: [num: number];
  }>();
  let counter = 0;

  const token1 = topic.keep('hello', true, 1);
  topic.subscribe('hello', (num) => {
    counter += num;
  });

  expect(counter).toEqual(1);

  const token2 = topic.keep('hello', true, 10);
  expect(counter).toEqual(11);

  topic.subscribe('hello', (num) => {
    counter += num;
  });

  expect(counter).toEqual(22);

  // remain 1 keeper
  token2.release();
  topic.subscribe('hello', (num) => {
    counter += num;
  });
  expect(counter).toEqual(23);

  // remain 0 keeper
  token1.release();
  topic.subscribe('hello', (num) => {
    counter += num;
  });
  expect(counter).toEqual(23);
});

it('can compose keep and subscribeOnce', () => {
  const topic = new Topic<{
    hello: [num: number];
  }>();

  let counter = 0;

  const token1 = topic.keep('hello', true, 1);
  topic.subscribeOnce('hello', (num) => {
    counter += num;
  });

  expect(counter).toEqual(1);

  token1.release();
});

it('can notify earlier subscription by keeper', () => {
  const topic = new Topic<{
    hello: [];
  }>();

  let counter = 0;

  topic.subscribe('hello', () => {
    counter += 3;
  });
  topic.subscribeOnce('hello', () => {
    counter += 2;
  });
  topic.keep('hello', true);

  expect(counter).toEqual(5);
});

it('is type checking', () => {
  const topic = new Topic<{
    hello: [num: number];
    hi: [x: number, y: string, z: boolean];
    [key: string]: any[];
  }>();

  (function () {
    // @ts-expect-error
    topic.publish('hello');
    // @ts-expect-error
    topic.publish('hello', '2');
    topic.publish('hello', 2);

    topic.publish('hi', 3, '4', true);
    // @ts-expect-error
    topic.publish('hi', '4', '4', true);
    // @ts-expect-error
    topic.publish('hi', 3, '4');

    topic.publish('');
    topic.publish('zzzzz', 'a', 2, 'b', false);
  });
});
