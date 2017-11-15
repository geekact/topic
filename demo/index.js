import {topic} from '../dist/index';

const handle_1 = topic('register').subscribe((name) => {
  console.log(`[1] hello ${name}`);
});

const handle_2 = topic('register').subscribe((name, age) => {
  console.log(`[2] good boy, ${name}, are you ${age} old?`);
});

const handle_3 = topic('register').subscribeOnce((name) => {
  console.log(`[3] hello ${name}`);
});

topic('login').publish('tom');
topic('register').publish('tom');
topic('register').publish('joke', 14);

console.log('');
console.log('Can I un-subscribe once subscription item: ' + topic.unsubscribe(handle_3));
console.log('');

console.log('I set timeout...........');
setTimeout(() => {
  // handle_1 is destroyed, just handle_2 will be called.
  console.log('timeout coming.......');
  topic('register').publish('timeout:@@@@@@@@@');
});

topic.unsubscribe(handle_1);
topic('register').publish('me');
topic('register').publish('I');

//////// shell:
// npm run build:demo && node demo/_dist.js
////////
