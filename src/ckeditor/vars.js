export const PLUGIN_DISABLED_EDITING_ROOT_CLASS = "ck-widget__type-around_disabled";

export const TYPE_AROUND_SELECTION_ATTRIBUTE = "widget-type-around";

export const POSSIBLE_INSERTION_POSITIONS = ["before", "after"];

/* harmony default export */ export var return_arrow =
  '<svg viewBox="0 0 10 8" xmlns="http://www.w3.org/2000/svg"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"/></svg>';

// Do the SVG parsing once and then clone the result <svg> DOM element for each new button.
export const RETURN_ARROW_ICON_ELEMENT = new DOMParser().parseFromString(
  return_arrow,
  "image/svg+xml"
).firstChild;

/** Used to compose bitmasks for cloning. */
export var CLONE_DEEP_FLAG = 1,
  CLONE_FLAT_FLAG = 2,
  CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
export var argsTag = "[object Arguments]",
  arrayTag = "[object Array]",
  _baseClone_boolTag = "[object Boolean]",
  _baseClone_dateTag = "[object Date]",
  errorTag = "[object Error]",
  funcTag = "[object Function]",
  genTag = "[object GeneratorFunction]",
  _baseClone_mapTag = "[object Map]",
  _baseClone_numberTag = "[object Number]",
  _baseClone_objectTag = "[object Object]",
  _baseClone_regexpTag = "[object RegExp]",
  _baseClone_setTag = "[object Set]",
  _baseClone_stringTag = "[object String]",
  _baseClone_symbolTag = "[object Symbol]",
  _baseClone_weakMapTag = "[object WeakMap]";

export var _baseClone_arrayBufferTag = "[object ArrayBuffer]",
  _baseClone_dataViewTag = "[object DataView]",
  _baseClone_float32Tag = "[object Float32Array]",
  _baseClone_float64Tag = "[object Float64Array]",
  _baseClone_int8Tag = "[object Int8Array]",
  _baseClone_int16Tag = "[object Int16Array]",
  _baseClone_int32Tag = "[object Int32Array]",
  _baseClone_uint8Tag = "[object Uint8Array]",
  _baseClone_uint8ClampedTag = "[object Uint8ClampedArray]",
  _baseClone_uint16Tag = "[object Uint16Array]",
  _baseClone_uint32Tag = "[object Uint32Array]";

/** Used to identify `toStringTag` values supported by `_.clone`. */
export var cloneableTags = {};
cloneableTags[argsTag] =
  cloneableTags[arrayTag] =
  cloneableTags[_baseClone_arrayBufferTag] =
  cloneableTags[_baseClone_dataViewTag] =
  cloneableTags[_baseClone_boolTag] =
  cloneableTags[_baseClone_dateTag] =
  cloneableTags[_baseClone_float32Tag] =
  cloneableTags[_baseClone_float64Tag] =
  cloneableTags[_baseClone_int8Tag] =
  cloneableTags[_baseClone_int16Tag] =
  cloneableTags[_baseClone_int32Tag] =
  cloneableTags[_baseClone_mapTag] =
  cloneableTags[_baseClone_numberTag] =
  cloneableTags[_baseClone_objectTag] =
  cloneableTags[_baseClone_regexpTag] =
  cloneableTags[_baseClone_setTag] =
  cloneableTags[_baseClone_stringTag] =
  cloneableTags[_baseClone_symbolTag] =
  cloneableTags[_baseClone_uint8Tag] =
  cloneableTags[_baseClone_uint8ClampedTag] =
  cloneableTags[_baseClone_uint16Tag] =
  cloneableTags[_baseClone_uint32Tag] =
    true;
cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[_baseClone_weakMapTag] = false;
