## install
````
npm install topic --save
````

## ES6
You should install `babel` plugin if your code include keyword `import`:
````
npm install babel-cli babel-preset-env --save-dev
````
And add file `.babelrc` to root directory.
````
{
  "presets": ["env"]
}
````

## support
This project support `nodejs` and `js`

# documentation

### subscribe and publish
Normal subscribe and publish
````
import {topic} from 'topic';

topic('register').subscribe(function(name, age) {
  console.log('Hello' + name + ', are you ' + age + 'old?');
});

topic('register').publish('tom', 12);
````

### different between subscribe and subscribeOnce
>- `subscribe` will listen the relative topic all the lifecycle, unless you un-subscribe it.
>- `subscribeOnce` similar to subscribe, but just execute once.

### destroy subscription
````
const handle = topic('hi').subscribe(...);

topic.unsubscribe(handle); // you should destroy the handle by yourself
````
or use `subscribeOnce`
````
topic('hi').subscribeOnce(...);
topic('hi').publish(...); // subscribeOnce handle will be destroyed immediately.
````
