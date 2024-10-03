// ReactiveClass.js
export class ReactiveClass {
  constructor() {
    this.controllers = new Set();
  }

  addController(controller) {
    this.controllers.add(controller);
    controller.hostConnected?.();
  }

  removeController(controller) {
    this.controllers.delete(controller);
  }

  requestUpdate() {
    this.controllers.forEach((controller) => {
      controller.hostUpdate?.();
    });
  }

  get updateComplete() {
    const promises = [];
    this.controllers.forEach((controller) => {
      if (controller.updateComplete instanceof Promise) {
        promises.push(controller.updateComplete);
      }
    });
    return Promise.all(promises).then(() => true);
  }
}