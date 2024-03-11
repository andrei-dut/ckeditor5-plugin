function getFiles(nativeDataTransfer) {
    // DataTransfer.files and items are array-like and might not have an iterable interface.
    const files = Array.from(nativeDataTransfer.files || []);
    const items = Array.from(nativeDataTransfer.items || []);

    if (files.length) {
      return files;
    }

    // Chrome has empty DataTransfer.files, but allows getting files through the items interface.
    return items
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile());
  }

export class CustomDataTransfer {
    constructor(nativeDataTransfer = new DataTransfer()) {

      this.files = getFiles(nativeDataTransfer);


      this._native = nativeDataTransfer;
    }


    get types() {
      return this._native.types;
    }


    getData(type) {
      return this._native.getData(type);
    }


    setData(type, data) {
      this._native.setData(type, data);
    }


    set effectAllowed(value) {
      this._native.effectAllowed = value;
    }

    get effectAllowed() {
      return this._native.effectAllowed;
    }


    set dropEffect(value) {
      this._native.dropEffect = value;
    }

    get dropEffect() {
      return this._native.dropEffect;
    }

    get isCanceled() {
      return (
        this._native.dropEffect == "none" ||
        !!this._native.mozUserCancelled
      );
    }
  }

export const dataTransfer = new CustomDataTransfer();
