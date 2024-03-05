export default class EventEmitter {
    constructor() {
      this.events = {};
    }
  
    on(eventName, callback) {
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }
      this.events[eventName].push(callback);
    }
  
    off(eventName, callback) {
      const eventCallbacks = this.events[eventName];
      if (eventCallbacks) {
        this.events[eventName] = eventCallbacks.filter(cb => cb !== callback);
      }
    }
  
    emit(eventName, ...args) {
      const eventCallbacks = this.events[eventName];
      if (eventCallbacks) {
        eventCallbacks.forEach(callback => {
          callback(...args);
        });
      }
    }
  }
