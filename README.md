轻量级事件同步收发管理

[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/geekact/topic/CI/master)](https://github.com/geekact/topic/actions)
[![Codecov](https://img.shields.io/codecov/c/github/geekact/topic)](https://codecov.io/gh/geekact/topic)
[![npm](https://img.shields.io/npm/v/topic)](https://www.npmjs.com/package/topic)
[![npm bundle size (version)](https://img.shields.io/bundlephobia/minzip/topic?label=bundle+size)](https://bundlephobia.com/package/topic@latest)
![GitHub top language](https://img.shields.io/github/languages/top/geekact/topic)
[![License](https://img.shields.io/github/license/geekact/topic)](https://github.com/geekact/topic/blob/master/LICENSE)

## 安装

```
yarn add topic
```

# 方法

### publish

发布事件

```typescript
import { topic } from 'topic';

topic.publish('name', 'message');
```

### subscribe

订阅事件

```typescript
topic.subscribe('who', (name, age) => {
  console.log('Hello' + name + ', are you ' + age + 'old?');
});

topic.publish('who', 'Tom', 12);
```

### subscribeOnce

订阅事件，接收一次后立即取消

```typescript
topic.subscribeOnce('who', (name) => {
  console.log('Hello ' + name);
});

// 有一个订阅者收到消息
topic.publish('who', 'Tom');
// 没有订阅者了
topic.publish('who', 'Tom');
```

### unsubscribe

取消订阅事件

```typescript
const handle = topic.subscribe('who', (name) => {
  console.log('Hello ' + name);
});

// 有一个订阅者收到消息
topic.publish('who', 'Tom');
// 有一个订阅者收到消息
topic.publish('who', 'John');

handle.unsubscribe();
// 没有订阅者了
topic.publish('who', 'Tom');
```

### keep + release

持续发布事件

```typescript
const sub1 = topic.subscribe('who', (name) => {
  console.log('Hello ' + name);
});

// sub1 收到消息
const handle = topic.keep('who', true, 'Tom');

// sub2 立即收到消息
const sub2 = topic.subscribe('who', (name) => {});

// sub3 立即收到消息
const sub3 = topic.subscribe('who', (name) => {});

handle.release();

// sub3 没有收到消息
const sub3 = topic.subscribe('who', (name) => {});
```

# 使用 TS 泛型自定义事件

实例后的 topic 都是互不干扰的，适用于全局业务或者局部业务

```typescript
import { Topic } from 'topic';

const customTopic = new Topic<{
  foo: [name: string];
  bar: [name: string, age: number];
  // 如果你想传入更多不可控的事件名称，则取消下面这行注释
  // [more: string]: any[];
}>();

// 现在编辑器能提示出name的类型了
customTopic.subscribe('foo', (name) => {});
// 现在编辑器知道第二个参数应该传什么类型了
customTopic.publish('foo', 'Tom');
```
