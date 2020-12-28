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

const token = topic.subscribe('who', (name) => {
  console.log('Hello ' + name);
});

// 1 subscription will receive message.
topic.publish('who', 'Tom');
// 1 subscription will receive message.
topic.publish('who', 'John');

topic.unsubscribe(token);
// No subscription now.
topic.publish('who', 'Tom');
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
