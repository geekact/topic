A light event management with typescript.

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

// sub1 will receive message.
const handle = topic.keep('who', true, 'Tom');

// sub2 will receive message 1-2ms later.
const sub2 = topic.subscribe('who', (name) => {});

// sub3 will receive message 1-2ms later automatically.
const sub3 = topic.subscribe('who', (name) => {});

handle.release();

// No message will trigger this subscription.
const sub3 = topic.subscribe('who', (name) => {});
```

# With typescript generic
```typescript
import { Topic } from 'topic';

const customTopic = new Topic<{
  foo: (name: string) => void;
  bar: (name: string, age: number) => void;
  // Uncomment next line if you want to support unexpected keys.
  // [more: string]: (...args: any[]) => void;
}>();

// Make IDE happy now.
customTopic.subscribe('foo', (name) => {});
customTopic.publish('foo', 'Tom');
```
