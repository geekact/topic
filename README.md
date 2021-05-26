A light sync event management with typescript.

[![License](https://img.shields.io/github/license/fwh1990/topic)](https://github.com/fwh1990/topic/blob/master/LICENSE)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/fwh1990/topic/CI/master)](https://github.com/fwh1990/topic/actions)
[![Codecov](https://img.shields.io/codecov/c/github/fwh1990/topic)](https://codecov.io/gh/fwh1990/topic)


## Installation
````
yarn add topic
````

# Methods

### subscribe
```typescript
import { topic } from 'topic';

topic.subscribe('who', (name, age) => {
  console.log('Hello' + name + ', are you ' + age + 'old?');
});

topic.publish('who', 'Tom', 12);
```

### subscribeOnce
```typescript
import { topic } from 'topic';

topic.subscribeOnce('who', (name) => {
  console.log('Hello ' + name);
});

// 1 subscription will receive message.
topic.publish('who', 'Tom');
// No subscription now.
topic.publish('who', 'Tom');
```

### unsubscribe
```typescript
import { topic } from 'topic';

const handle = topic.subscribe('who', (name) => {
  console.log('Hello ' + name);
});

// 1 subscription will receive message.
topic.publish('who', 'Tom');
// 1 subscription will receive message.
topic.publish('who', 'John');

handle.unsubscribe();
// No subscription now.
topic.publish('who', 'Tom');
```

### keep and release

```typescript
import { topic } from 'topic';

const sub1 = topic.subscribe('who', (name) => {
  console.log('Hello ' + name);
});

// sub1 will receive message now.
const handle = topic.keep('who', true, 'Tom');

// sub2 will receive message immediately.
const sub2 = topic.subscribe('who', (name) => {});

// sub3 will receive message immediately.
const sub3 = topic.subscribe('who', (name) => {});

handle.release();

// No message will emit to this subscription.
const sub3 = topic.subscribe('who', (name) => {});
```

# With typescript generic
```typescript
import { Topic } from 'topic';

const customTopic = new Topic<{
  foo: [name: string];
  bar: [name: string, age: number];
  // Uncomment next line if you want to support unexpected keys.
  // [more: string]: any[];
}>();

// Make IDE happy now.
customTopic.subscribe('foo', (name) => {});
customTopic.publish('foo', 'Tom');
```
