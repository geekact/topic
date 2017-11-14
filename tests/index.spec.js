import 'babel-polyfill';
import topic from '../src/index';

const expect = require('expect.js');

describe('topic entry function', () => {
  describe('entry self', () => {
    it('should have method unsubscribe', () => {
      expect(topic).to.have.property('unsubscribe');
    });

    it('method unsubscribe is a function', () => {
      expect(topic.unsubscribe).to.be.a('function');
    });
  });
  
  describe('run function', () => {
    const obj = topic('/hello');

    it('should return object', () => {
      expect(obj).to.be.a('object');
    });
    
    it('subscribe and publish', () => {
      let myData = 0;
      
      obj.subscribe((plusNumber, moreNumber = 0) => {
        myData = myData + plusNumber + moreNumber;
      });
      
      obj.publish(3, 1);
      expect(myData).to.equal(4);
      obj.publish(4, 2);
      expect(myData).to.equal(10);
      obj.publish(1, 3, 5);
      expect(myData).to.equal(14);
    });
    
    it('subscription will be destroy by manually', () => {
      let myData = 0;

      const handle = obj.subscribe((plusNumber, moreNumber = 0) => {
        myData = myData + plusNumber + moreNumber;
      });

      obj.publish(3, 1);
      expect(myData).to.equal(4);
      obj.publish(10, 20);
      expect(myData).to.equal(34);
      
      topic.unsubscribe(handle);
      obj.publish(10, 40);
      expect(myData).to.equal(34);
    });
    
    it('subscription will destroy automatically', () => {
      let myData = 0;

      obj.subscribeOnce((plusNumber, moreNumber = 0) => {
        myData = myData + plusNumber + moreNumber;
      });

      obj.publish(3, 1);
      expect(myData).to.equal(4);
      obj.publish(10, 20);
      expect(myData).to.equal(4);
    });
  });
});
