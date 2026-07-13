// Hermes (as shipped in Expo Go) does not provide `DOMException` as a global,
// and React Native 0.81 does not polyfill it. Some modules read it as a bare
// global during evaluation, which throws "property 'DOMException' doesn't
// exist". Register a minimal, spec-shaped implementation before anything runs.
if (typeof global.DOMException === 'undefined') {
  global.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || 'Error';
      this.code = 0;
    }
  };
}


// class DOMExceptionPolyfill extends Error {
//   constructor(message = '', name = 'Error') {
//     super(message);
//     this.name = name;
//     this.code = 0;
//   }
// }

// global.DOMException = DOMExceptionPolyfill;
// globalThis.DOMException = DOMExceptionPolyfill;