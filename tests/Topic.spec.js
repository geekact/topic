import 'babel-polyfill';
import {Topic} from '../src/Topic';

const expect = require('expect.js');

describe('class Topic', () => {
  const obj = new Topic('/hi');

  it('should hav property topicName', () => {
    expect(obj).to.have.property('topicName', '/hi');
  });

  it('can publish', () => {
    expect(obj).to.have.property('publish');
    expect(obj.publish).to.be.a('function');
  });

  it('can subscribe', () => {
    expect(obj).to.have.property('subscribe');
    expect(obj.subscribe).to.be.a('function');
    expect(obj.subscribe).withArgs().to.throwError((e) => {
      expect(e).to.be.a(TypeError);
    });
  });

  it('can subscribe once', () => {
    expect(obj).to.have.property('subscribeOnce');
    expect(obj.subscribeOnce).to.be.a('function');
    expect(obj.subscribeOnce).withArgs().to.throwError((e) => {
      expect(e).to.be.a(TypeError);
    });
  });
  
  it('subscription value can be applied to unsubscribe', () => {
    const handle = obj.subscribe(() => {});
    
    expect(handle).to.be.an('object');
    expect(handle).to.have.property('name', '/hi');
    expect(handle).to.have.property('token');
    expect(Topic.destroy(handle.name, handle.token)).to.be(true);
    expect(Topic.destroy(handle.name, 'invalid token')).to.be(false);
    expect(Topic.destroy('invalid name', 'invalid token')).to.be(false);
  });
  
  it('method subscribeOnce can destroy once it run', (done) => {
    let amount = 1;
    
    const handle = obj.subscribeOnce(() => {
      amount++;
    });
    
    for (let index = 0; index < 10; ++index) {
      obj.publish();
      expect(amount).to.be(2);
    }

    expect(Topic.destroy('/hi', handle.token)).to.be(false);
    
    expect(Topic.getItems(handle.name)).to.have.length(1);
    setTimeout(() => {
      expect(Topic.getItems(handle.name)).to.have.length(0);
      done();
    });
  });
  
  it('unsubscribed subscriptions will be destroyed at any time', (done) => {
    for (let index = 1; index <= 11; ++index) {
      const handle = obj.subscribe(() => {});
      obj.publish();
      expect(Topic.getItems(handle.name)).to.have.length(index);
      Topic.destroy(handle.name, handle.token);
    }
    expect(Topic.getItems('/hi')).to.have.length(11);

    for (let index = 12; index <= 21; ++index) {
      const handle = obj.subscribeOnce(() => {});
      obj.publish();
      expect(Topic.getItems(handle.name)).to.have.length(index);
    }
    expect(Topic.getItems('/hi')).to.have.length(21);

    setTimeout(() => {
      expect(Topic.getItems('/hi')).to.have.length(0);
      done();
    });
  });
  
  it('cannot call synchronous publish in the callback function', () => {
    obj.subscribe(() => {
      try {
        obj.publish();
      } catch (e) {
        expect(e).to.be.a(ReferenceError);
      }
    });
    
    obj.publish();
  });
});
