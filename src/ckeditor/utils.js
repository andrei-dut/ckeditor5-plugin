import { View, ViewCollection } from ".";
import template_Template from "./ui/template";
import {
  _baseClone_objectTag,
  argsTag,
  CLONE_DEEP_FLAG,
  CLONE_FLAT_FLAG,
  CLONE_SYMBOLS_FLAG,
  cloneableTags,
  funcTag,
  genTag,
  POSSIBLE_INSERTION_POSITIONS,
  RETURN_ARROW_ICON_ELEMENT,
  TYPE_AROUND_SELECTION_ATTRIBUTE,
} from "./vars";
import {
  _toSource,
  _getNative,
  _root,
  _baseGetTag,
  _Map,
  _Promise,
  _WeakMap,
  _Set,
  isBuffer,
  _cloneBuffer,
  _isPrototype,
  _copyObject,
  isArrayLike,
  _arrayLikeKeys,
  _baseKeysIn,
  _initCloneByTag,
  lodash_es_isSet,
  lodash_es_isMap,
  _getAllKeysIn,
  _Stack,
  _getAllKeys,
  _arrayEach,
  _assignValue,
} from "./ckeditor";

export function forceDisable(evt) {
  evt.return = false;
  evt.stop();
}

/**
 * For the passed selection instance, it returns the position of the fake caret displayed next to a widget.
 *
 * **Note**: If the fake caret is not currently displayed, `null` is returned.
 *
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 * @returns {'before'|'after'|null} The position of the fake caret or `null` when none is present.
 */
export function getTypeAroundFakeCaretPosition(selection) {
  return selection.getAttribute(TYPE_AROUND_SELECTION_ATTRIBUTE);
}

/**
 * Checks if an element is a widget that qualifies to get the widget type around UI.
 *
 * @param {module:engine/view/element~Element} viewElement
 * @param {module:engine/model/element~Element} modelElement
 * @param {module:engine/model/schema~Schema} schema
 * @returns {Boolean}
 */
export function isTypeAroundWidget(viewElement, modelElement, schema) {
  return viewElement && isWidget(viewElement) && !schema.isInline(modelElement);
}

/**
 * Returns `true` if given {@link module:engine/view/node~Node} is an {@link module:engine/view/element~Element} and a widget.
 *
 * @param {module:engine/view/node~Node} node
 * @returns {Boolean}
 */
export function isWidget(node) {
  if (!node.is("element")) {
    return false;
  }

  return !!node.getCustomProperty("widget");
}

// Injects the type around UI into a view widget instance.
//
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @param {Object.<String,String>} buttonTitles
// @param {module:engine/view/element~Element} widgetViewElement
export function injectUIIntoWidget(viewWriter, buttonTitles, widgetViewElement) {
  const typeAroundWrapper = viewWriter.createUIElement(
    "div",
    {
      class: "ck ck-reset_all ck-widget__type-around",
    },
    function (domDocument) {
      const wrapperDomElement = this.toDomElement(domDocument);

      injectButtons(wrapperDomElement, buttonTitles);
      injectFakeCaret(wrapperDomElement);

      return wrapperDomElement;
    }
  );

  // Inject the type around wrapper into the widget's wrapper.
  viewWriter.insert(viewWriter.createPositionAt(widgetViewElement, "end"), typeAroundWrapper);
}

// FYI: Not using the IconView class because each instance would need to be destroyed to avoid memory leaks
// and it's pretty hard to figure out when a view (widget) is gone for good so it's cheaper to use raw
// <svg> here.
//
// @param {HTMLElement} wrapperDomElement
// @param {Object.<String,String>} buttonTitles
export function injectButtons(wrapperDomElement, buttonTitles) {
  for (const position of POSSIBLE_INSERTION_POSITIONS) {
    const buttonTemplate = new template_Template({
      tag: "div",
      attributes: {
        class: [
          "ck",
          "ck-widget__type-around__button",
          `ck-widget__type-around__button_${position}`,
        ],
        title: buttonTitles[position],
      },
      children: [wrapperDomElement.ownerDocument.importNode(RETURN_ARROW_ICON_ELEMENT, true)],
    });

    wrapperDomElement.appendChild(buttonTemplate.render());
  }
}

// @param {HTMLElement} wrapperDomElement
export function injectFakeCaret(wrapperDomElement) {
  const caretTemplate = new template_Template({
    tag: "div",
    attributes: {
      class: ["ck", "ck-widget__type-around__fake-caret"],
    },
  });

  wrapperDomElement.appendChild(caretTemplate.render());
}

// Normalizes "string" {@link module:ui/template~TemplateDefinition}.
//
//		"foo"
//
// becomes
//
//		{ text: [ 'foo' ] },
//
// @param {String} def
// @returns {module:ui/template~TemplateDefinition} Normalized template definition.
export function normalizePlainTextDefinition(def) {
  return {
    text: [def],
  };
}

// CONCATENATED MODULE: ./node_modules/@ckeditor/ckeditor5-utils/src/toarray.js
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/toarray
 */

/**
 * Transforms any value to an array. If the provided value is already an array, it is returned unchanged.
 *
 * @param {*} data The value to transform to an array.
 * @returns {Array} An array created from data.
 */
export function toArray(data) {
  return Array.isArray(data) ? data : [data];
}

// Normalizes text {@link module:ui/template~TemplateDefinition}.
//
//		children: [
//			{ text: 'def' },
//			{ text: {@link module:ui/template~TemplateBinding} }
//		]
//
// becomes
//
//		children: [
//			{ text: [ 'def' ] },
//			{ text: [ {@link module:ui/template~TemplateBinding} ] }
//		]
//
// @param {module:ui/template~TemplateDefinition} def
export function normalizeTextDefinition(def) {
  def.text = toArray(def.text);
}

// Wraps an entry in Object in an Array, if not already one.
//
//		{
//			x: 'y',
//			a: [ 'b' ]
//		}
//
// becomes
//
//		{
//			x: [ 'y' ],
//			a: [ 'b' ]
//		}
//
// @param {Object} obj
// @param {String} key
function arrayify(obj, key) {
  obj[key] = toArray(obj[key]);
}

// Normalizes "on" section of {@link module:ui/template~TemplateDefinition}.
//
//		on: {
//			a: 'bar',
//			b: {@link module:ui/template~TemplateBinding},
//			c: [ {@link module:ui/template~TemplateBinding}, () => { ... } ]
//		}
//
// becomes
//
//		on: {
//			a: [ 'bar' ],
//			b: [ {@link module:ui/template~TemplateBinding} ],
//			c: [ {@link module:ui/template~TemplateBinding}, () => { ... } ]
//		}
//
// @param {Object} listeners
// @returns {Object} Object containing normalized listeners.
function normalizeListeners(listeners) {
  for (const l in listeners) {
    arrayify(listeners, l);
  }

  return listeners;
}

// Normalizes "attributes" section of {@link module:ui/template~TemplateDefinition}.
//
//		attributes: {
//			a: 'bar',
//			b: {@link module:ui/template~TemplateBinding},
//			c: {
//				value: 'bar'
//			}
//		}
//
// becomes
//
//		attributes: {
//			a: [ 'bar' ],
//			b: [ {@link module:ui/template~TemplateBinding} ],
//			c: {
//				value: [ 'bar' ]
//			}
//		}
//
// @param {Object} attributes
function normalizeAttributes(attributes) {
  for (const a in attributes) {
    if (attributes[a].value) {
      attributes[a].value = toArray(attributes[a].value);
    }

    arrayify(attributes, a);
  }
}

// Checks if the item is an instance of {@link module:ui/viewcollection~ViewCollection}
//
// @private
// @param {*} value Value to be checked.
export function isViewCollection(item) {
  return item instanceof ViewCollection;
}

// Checks if the item is an instance of {@link module:ui/view~View}
//
// @private
// @param {*} value Value to be checked.
export function isView(item) {
  return item instanceof View;
}

// Checks if the item is an instance of {@link module:ui/template~Template}
//
// @private
// @param {*} value Value to be checked.
export function isTemplate(item) {
  return item instanceof template_Template;
}

// CONCATENATED MODULE: ./node_modules/@ckeditor/ckeditor5-utils/src/dom/isnode.js
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/isnode
 */

/**
 * Checks if the object is a native DOM Node.
 *
 * @param {*} obj
 * @returns {Boolean}
 */
export function isNode(obj) {
  if (obj) {
    if (obj.defaultView) {
      return obj instanceof obj.defaultView.Document;
    } else if (obj.ownerDocument && obj.ownerDocument.defaultView) {
      return obj instanceof obj.ownerDocument.defaultView.Node;
    }
  }

  return false;
}

// Normalizes given {@link module:ui/template~TemplateDefinition}.
//
// See:
//  * {@link normalizeAttributes}
//  * {@link normalizeListeners}
//  * {@link normalizePlainTextDefinition}
//  * {@link normalizeTextDefinition}
//
// @param {module:ui/template~TemplateDefinition} def
// @returns {module:ui/template~TemplateDefinition} Normalized definition.
export function normalize(def) {
  if (typeof def == "string") {
    def = normalizePlainTextDefinition(def);
  } else if (def.text) {
    normalizeTextDefinition(def);
  }

  if (def.on) {
    def.eventListeners = normalizeListeners(def.on);

    // Template mixes EmitterMixin, so delete #on to avoid collision.
    delete def.on;
  }

  if (!def.text) {
    if (def.attributes) {
      normalizeAttributes(def.attributes);
    }

    const children = [];

    if (def.children) {
      if (isViewCollection(def.children)) {
        children.push(def.children);
      } else {
        for (const child of def.children) {
          if (isTemplate(child) || isView(child) || isNode(child)) {
            children.push(child);
          } else {
            children.push(new template_Template(child));
          }
        }
      }
    }

    def.children = children;
  }

  return def;
}

export function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}

export var isArray = Array.isArray;

// CONCATENATED MODULE: ./node_modules/lodash-es/_initCloneArray.js
/** Used for built-in method references. */
var _initCloneArray_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _initCloneArray_hasOwnProperty = _initCloneArray_objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
    result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (
    length &&
    typeof array[0] == "string" &&
    _initCloneArray_hasOwnProperty.call(array, "index")
  ) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/* harmony default export */ var _initCloneArray = initCloneArray;

// CONCATENATED MODULE: ./node_modules/lodash-es/_copyArray.js
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
    length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/* harmony default export */ var _copyArray = copyArray;

// CONCATENATED MODULE: ./node_modules/lodash-es/_DataView.js

/* Built-in method references that are verified to be native. */
var DataView = Object(_getNative["a" /* default */])(_root["a" /* default */], "DataView");

/* harmony default export */ var _DataView = DataView;

// CONCATENATED MODULE: ./node_modules/lodash-es/_getTag.js

/** `Object#toString` result references. */
var mapTag = "[object Map]",
  objectTag = "[object Object]",
  promiseTag = "[object Promise]",
  setTag = "[object Set]",
  weakMapTag = "[object WeakMap]";

var dataViewTag = "[object DataView]";

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = Object(_toSource["a" /* default */])(_DataView),
  mapCtorString = Object(_toSource["a" /* default */])(_Map),
  promiseCtorString = Object(_toSource["a" /* default */])(_Promise),
  setCtorString = Object(_toSource["a" /* default */])(_Set),
  weakMapCtorString = Object(_toSource["a" /* default */])(_WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = _baseGetTag["a" /* default */];

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if (
  (_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag) ||
  (_Map && getTag(new _Map()) != mapTag) ||
  (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
  (_Set && getTag(new _Set()) != setTag) ||
  (_WeakMap && getTag(new _WeakMap()) != weakMapTag)
) {
  getTag = function (value) {
    var result = Object(_baseGetTag["a" /* default */])(value),
      Ctor = result == objectTag ? value.constructor : undefined,
      ctorString = Ctor ? Object(_toSource["a" /* default */])(Ctor) : "";

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag;
        case mapCtorString:
          return mapTag;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag;
        case weakMapCtorString:
          return weakMapTag;
      }
    }
    return result;
  };
}

/* harmony default export */ var _getTag = getTag;

// CONCATENATED MODULE: ./node_modules/lodash-es/_baseCreate.js

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function () {
  function object() {}
  return function (proto) {
    if (!Object(isObject["a" /* default */])(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object();
    object.prototype = undefined;
    return result;
  };
})();

/* harmony default export */ var _baseCreate = baseCreate;

// CONCATENATED MODULE: ./node_modules/lodash-es/_overArg.js
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

/* harmony default export */ var _overArg = overArg;

// CONCATENATED MODULE: ./node_modules/lodash-es/_getPrototype.js

/** Built-in value references. */
var getPrototype = _overArg(Object.getPrototypeOf, Object);

/* harmony default export */ var _getPrototype = getPrototype;

// CONCATENATED MODULE: ./node_modules/lodash-es/_initCloneObject.js

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return typeof object.constructor == "function" && !Object(_isPrototype["a" /* default */])(object)
    ? _baseCreate(_getPrototype(object))
    : {};
}

/* harmony default export */ var _initCloneObject = initCloneObject;

// CONCATENATED MODULE: ./node_modules/lodash-es/stubArray.js
/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/* harmony default export */ var lodash_es_stubArray = stubArray;

// CONCATENATED MODULE: ./node_modules/lodash-es/_arrayPush.js
/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
    length = values.length,
    offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/* harmony default export */ var _arrayPush = arrayPush;

// CONCATENATED MODULE: ./node_modules/lodash-es/_arrayFilter.js
/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
    length = array == null ? 0 : array.length,
    resIndex = 0,
    result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/* harmony default export */ var _arrayFilter = arrayFilter;

// CONCATENATED MODULE: ./node_modules/lodash-es/_getSymbols.js

/** Used for built-in method references. */
var _getSymbols_objectProto = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = _getSymbols_objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols
  ? lodash_es_stubArray
  : function (object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return _arrayFilter(nativeGetSymbols(object), function (symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };

/* harmony default export */ var _getSymbols = getSymbols;

// CONCATENATED MODULE: ./node_modules/lodash-es/_getSymbolsIn.js

/* Built-in method references for those with the same name as other `lodash` methods. */
var _getSymbolsIn_nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !_getSymbolsIn_nativeGetSymbols
  ? lodash_es_stubArray
  : function (object) {
      var result = [];
      while (object) {
        _arrayPush(result, _getSymbols(object));
        object = _getPrototype(object);
      }
      return result;
    };

/* harmony default export */ var _getSymbolsIn = getSymbolsIn;

// CONCATENATED MODULE: ./node_modules/lodash-es/_copySymbolsIn.js

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return Object(_copyObject["a" /* default */])(source, _getSymbolsIn(source), object);
}

/* harmony default export */ var _copySymbolsIn = copySymbolsIn;

// CONCATENATED MODULE: ./node_modules/lodash-es/keysIn.js

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return Object(isArrayLike["a" /* default */])(object)
    ? Object(_arrayLikeKeys["a" /* default */])(object, true)
    : _baseKeysIn(object);
}

// CONCATENATED MODULE: ./node_modules/lodash-es/_baseAssignIn.js

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return (
    object &&
    Object(_copyObject["a" /* default */])(
      source,
      Object(keysIn["a" /* default */])(source),
      object
    )
  );
}

/* harmony default export */ var _baseAssignIn = baseAssignIn;

// CONCATENATED MODULE: ./node_modules/lodash-es/_copySymbols.js

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return Object(_copyObject["a" /* default */])(source, _getSymbols(source), object);
}

/* harmony default export */ var _copySymbols = copySymbols;

// CONCATENATED MODULE: ./node_modules/lodash-es/_nativeKeys.js

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = _overArg(Object.keys, Object);

/* harmony default export */ var _nativeKeys = nativeKeys;

// CONCATENATED MODULE: ./node_modules/lodash-es/_baseKeys.js

/** Used for built-in method references. */
var _baseKeys_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _baseKeys_hasOwnProperty = _baseKeys_objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!Object(_isPrototype["a" /* default */])(object)) {
    return _nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (_baseKeys_hasOwnProperty.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}

/* harmony default export */ var _baseKeys = baseKeys;

// CONCATENATED MODULE: ./node_modules/lodash-es/keys.js

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return Object(isArrayLike["a" /* default */])(object)
    ? Object(_arrayLikeKeys["a" /* default */])(object)
    : _baseKeys(object);
}

/* harmony default export */ var lodash_es_keys = keys;

// CONCATENATED MODULE: ./node_modules/lodash-es/_baseAssign.js

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && Object(_copyObject["a" /* default */])(source, lodash_es_keys(source), object);
}

/* harmony default export */ var _baseAssign = baseAssign;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
    isDeep = bitmask & CLONE_DEEP_FLAG,
    isFlat = bitmask & CLONE_FLAT_FLAG,
    isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!Object(isObject["a" /* default */])(value)) {
    return value;
  }
  var isArr = Object(isArray["a" /* default */])(value);
  if (isArr) {
    result = _initCloneArray(value);
    if (!isDeep) {
      return _copyArray(value, result);
    }
  } else {
    var tag = _getTag(value),
      isFunc = tag == funcTag || tag == genTag;

    if (Object(isBuffer["a" /* default */])(value)) {
      return Object(_cloneBuffer["a" /* default */])(value, isDeep);
    }
    if (tag == _baseClone_objectTag || tag == argsTag || (isFunc && !object)) {
      result = isFlat || isFunc ? {} : _initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? _copySymbolsIn(value, _baseAssignIn(result, value))
          : _copySymbols(value, _baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = _initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new _Stack());
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (lodash_es_isSet(value)) {
    value.forEach(function (subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (lodash_es_isMap(value)) {
    value.forEach(function (subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? isFlat
      ? _getAllKeysIn
      : _getAllKeys
    : isFlat
    ? keysIn["a" /* default */]
    : lodash_es_keys;

  var props = isArr ? undefined : keysFunc(value);
  _arrayEach(props || value, function (subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    Object(_assignValue["a" /* default */])(
      result,
      key,
      baseClone(subValue, bitmask, customizer, key, value, stack)
    );
  });
  return result;
}

/* harmony default export */ var _baseClone = baseClone;

// CONCATENATED MODULE: ./node_modules/lodash-es/cloneDeepWith.js

/** Used to compose bitmasks for cloning. */
var cloneDeepWith_CLONE_DEEP_FLAG = 1,
  cloneDeepWith_CLONE_SYMBOLS_FLAG = 4;

/**
 * This method is like `_.cloneWith` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @param {Function} [customizer] The function to customize cloning.
 * @returns {*} Returns the deep cloned value.
 * @see _.cloneWith
 * @example
 *
 * function customizer(value) {
 *   if (_.isElement(value)) {
 *     return value.cloneNode(true);
 *   }
 * }
 *
 * var el = _.cloneDeepWith(document.body, customizer);
 *
 * console.log(el === document.body);
 * // => false
 * console.log(el.nodeName);
 * // => 'BODY'
 * console.log(el.childNodes.length);
 * // => 20
 */
function cloneDeepWith(value, customizer) {
  customizer = typeof customizer == "function" ? customizer : undefined;
  return _baseClone(
    value,
    cloneDeepWith_CLONE_DEEP_FLAG | cloneDeepWith_CLONE_SYMBOLS_FLAG,
    customizer
  );
}

/* harmony default export */ export var lodash_es_cloneDeepWith = cloneDeepWith;
