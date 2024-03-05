import { DomEventObserver } from "../ckeditor";

export class MouseObserver extends DomEventObserver {
  constructor(view) {
    super(view);

    this.domEventType = ["dblclick", "mousedown", "mouseup", "mouseover", "mouseout"];
  }

  onDomEvent(domEvent) {
    this.fire(domEvent.type, domEvent);
  }
}

export class ClickObserver extends DomEventObserver {
  constructor(view) {
    super(view);

    this.domEventType = "click";
  }

  onDomEvent(domEvent) {
    this.fire(domEvent.type, domEvent);
  }
}

export class DblClickObserver extends DomEventObserver {
  constructor(view) {
    super(view);

    this.domEventType = "dblclick";
  }

  onDomEvent(domEvent) {
    this.fire(domEvent.type, domEvent);
  }
}
