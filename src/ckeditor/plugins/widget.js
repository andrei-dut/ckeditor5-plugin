import plugin_Plugin from "./plugin";

// CONCATENATED MODULE: ./node_modules/@ckeditor/ckeditor5-widget/src/widget.js
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widget
 */

/**
 * The widget plugin. It enables base support for widgets.
 *
 * See {@glink api/widget package page} for more details and documentation.
 *
 * This plugin enables multiple behaviors required by widgets:
 *
 * * The model to view selection converter for the editing pipeline (it handles widget custom selection rendering).
 * If a converted selection wraps around a widget element, that selection is marked as
 * {@link module:engine/view/selection~Selection#isFake fake}. Additionally, the `ck-widget_selected` CSS class
 * is added to indicate that widget has been selected.
 * * The mouse and keyboard events handling on and around widget elements.
 *
 * @extends module:core/plugin~Plugin
 */
export default class widget_Widget extends plugin_Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "Widget";
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [widgettypearound_WidgetTypeAround, delete_Delete];
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    /**
     * Holds previously selected widgets.
     *
     * @private
     * @type {Set.<module:engine/view/element~Element>}
     */
    this._previouslySelected = new Set();

    // Model to view selection converter.
    // Converts selection placed over widget element to fake selection.
    //
    // By default, the selection is downcasted by the engine to surround the attribute element, even though its only
    // child is an inline widget. A similar thing also happens when a collapsed marker is rendered as a UI element
    // next to an inline widget: the view selection contains both the widget and the marker.
    //
    // This prevents creating a correct fake selection when this inline widget is selected. Normalize the selection
    // in these cases based on the model:
    //
    //		[<attributeElement><inlineWidget /></attributeElement>] -> <attributeElement>[<inlineWidget />]</attributeElement>
    //		[<uiElement></uiElement><inlineWidget />] -> <uiElement></uiElement>[<inlineWidget />]
    //
    // Thanks to this:
    //
    // * fake selection can be set correctly,
    // * any logic depending on (View)Selection#getSelectedElement() also works OK.
    //
    // See https://github.com/ckeditor/ckeditor5/issues/9524.
    this.editor.editing.downcastDispatcher.on("selection", (evt, data, conversionApi) => {
      const viewWriter = conversionApi.writer;
      const modelSelection = data.selection;

      // The collapsed selection can't contain any widget.
      if (modelSelection.isCollapsed) {
        return;
      }

      const selectedModelElement = modelSelection.getSelectedElement();

      if (!selectedModelElement) {
        return;
      }

      const selectedViewElement = editor.editing.mapper.toViewElement(selectedModelElement);

      if (!isWidget(selectedViewElement)) {
        return;
      }

      if (!conversionApi.consumable.consume(modelSelection, "selection")) {
        return;
      }

      viewWriter.setSelection(viewWriter.createRangeOn(selectedViewElement), {
        fake: true,
        label: getLabel(selectedViewElement),
      });
    });

    // Mark all widgets inside the selection with the css class.
    // This handler is registered at the 'low' priority so it's triggered after the real selection conversion.
    this.editor.editing.downcastDispatcher.on(
      "selection",
      (evt, data, conversionApi) => {
        // Remove selected class from previously selected widgets.
        this._clearPreviouslySelectedWidgets(conversionApi.writer);

        const viewWriter = conversionApi.writer;
        const viewSelection = viewWriter.document.selection;

        let lastMarked = null;

        for (const range of viewSelection.getRanges()) {
          // Note: There could be multiple selected widgets in a range but no fake selection.
          // All of them must be marked as selected, for instance [<widget></widget><widget></widget>]
          for (const value of range) {
            const node = value.item;

            // Do not mark nested widgets in selected one. See: #57.
            if (isWidget(node) && !isChild(node, lastMarked)) {
              viewWriter.addClass(WIDGET_SELECTED_CLASS_NAME, node);

              this._previouslySelected.add(node);
              lastMarked = node;
            }
          }
        }
      },
      { priority: "low" }
    );

    // If mouse down is pressed on widget - create selection over whole widget.
    view.addObserver(mouseobserver_MouseObserver);
    this.listenTo(viewDocument, "mousedown", (...args) => this._onMousedown(...args));

    // There are two keydown listeners working on different priorities. This allows other
    // features such as WidgetTypeAround or TableKeyboard to attach their listeners in between
    // and customize the behavior even further in different content/selection scenarios.
    //
    // * The first listener handles changing the selection on arrow key press
    // if the widget is selected or if the selection is next to a widget and the widget
    // should become selected upon the arrow key press.
    //
    // * The second (late) listener makes sure the default browser action on arrow key press is
    // prevented when a widget is selected. This prevents the selection from being moved
    // from a fake selection container.
    this.listenTo(
      viewDocument,
      "arrowKey",
      (...args) => {
        this._handleSelectionChangeOnArrowKeyPress(...args);
      },
      { context: [isWidget, "$text"] }
    );

    this.listenTo(
      viewDocument,
      "arrowKey",
      (...args) => {
        this._preventDefaultOnArrowKeyPress(...args);
      },
      { context: "$root" }
    );

    this.listenTo(viewDocument, "arrowKey", verticalNavigationHandler(this.editor.editing), {
      context: "$text",
    });

    // Handle custom delete behaviour.
    this.listenTo(
      viewDocument,
      "delete",
      (evt, data) => {
        if (this._handleDelete(data.direction == "forward")) {
          data.preventDefault();
          evt.stop();
        }
      },
      { context: "$root" }
    );
  }

  /**
   * Handles {@link module:engine/view/document~Document#event:mousedown mousedown} events on widget elements.
   *
   * @private
   * @param {module:utils/eventinfo~EventInfo} eventInfo
   * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
   */
  _onMousedown(eventInfo, domEventData) {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;
    let element = domEventData.target;

    // Do nothing for single or double click inside nested editable.
    if (isInsideNestedEditable(element)) {
      // But at least triple click inside nested editable causes broken selection in Safari.
      // For such event, we select the entire nested editable element.
      // See: https://github.com/ckeditor/ckeditor5/issues/1463.
      if ((src_env.isSafari || src_env.isGecko) && domEventData.domEvent.detail >= 3) {
        const mapper = editor.editing.mapper;
        const viewElement = element.is("attributeElement")
          ? element.findAncestor((element) => !element.is("attributeElement"))
          : element;
        const modelElement = mapper.toModelElement(viewElement);

        domEventData.preventDefault();

        this.editor.model.change((writer) => {
          writer.setSelection(modelElement, "in");
        });
      }

      return;
    }

    // If target is not a widget element - check if one of the ancestors is.
    if (!isWidget(element)) {
      element = element.findAncestor(isWidget);

      if (!element) {
        return;
      }
    }

    // On Android selection would jump to the first table cell, on other devices
    // we can't block it (and don't need to) because of drag and drop support.
    if (src_env.isAndroid) {
      domEventData.preventDefault();
    }

    // Focus editor if is not focused already.
    if (!viewDocument.isFocused) {
      view.focus();
    }

    // Create model selection over widget.
    const modelElement = editor.editing.mapper.toModelElement(element);

    this._setSelectionOverElement(modelElement);
  }

  /**
   * Handles {@link module:engine/view/document~Document#event:keydown keydown} events and changes
   * the model selection when:
   *
   * * arrow key is pressed when the widget is selected,
   * * the selection is next to a widget and the widget should become selected upon the arrow key press.
   *
   * See {@link #_preventDefaultOnArrowKeyPress}.
   *
   * @private
   * @param {module:utils/eventinfo~EventInfo} eventInfo
   * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
   */
  _handleSelectionChangeOnArrowKeyPress(eventInfo, domEventData) {
    const keyCode = domEventData.keyCode;

    const model = this.editor.model;
    const schema = model.schema;
    const modelSelection = model.document.selection;
    const objectElement = modelSelection.getSelectedElement();
    const isForward = isForwardArrowKeyCode(keyCode, this.editor.locale.contentLanguageDirection);

    // If object element is selected.
    if (objectElement && schema.isObject(objectElement)) {
      const position = isForward
        ? modelSelection.getLastPosition()
        : modelSelection.getFirstPosition();
      const newRange = schema.getNearestSelectionRange(
        position,
        isForward ? "forward" : "backward"
      );

      if (newRange) {
        model.change((writer) => {
          writer.setSelection(newRange);
        });

        domEventData.preventDefault();
        eventInfo.stop();
      }

      return;
    }

    // If selection is next to object element.
    // Return if not collapsed.
    if (!modelSelection.isCollapsed) {
      return;
    }

    const objectElementNextToSelection = this._getObjectElementNextToSelection(isForward);

    if (objectElementNextToSelection && schema.isObject(objectElementNextToSelection)) {
      this._setSelectionOverElement(objectElementNextToSelection);

      domEventData.preventDefault();
      eventInfo.stop();
    }
  }

  /**
   * Handles {@link module:engine/view/document~Document#event:keydown keydown} events and prevents
   * the default browser behavior to make sure the fake selection is not being moved from a fake selection
   * container.
   *
   * See {@link #_handleSelectionChangeOnArrowKeyPress}.
   *
   * @private
   * @param {module:utils/eventinfo~EventInfo} eventInfo
   * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
   */
  _preventDefaultOnArrowKeyPress(eventInfo, domEventData) {
    const model = this.editor.model;
    const schema = model.schema;
    const objectElement = model.document.selection.getSelectedElement();

    // If object element is selected.
    if (objectElement && schema.isObject(objectElement)) {
      domEventData.preventDefault();
      eventInfo.stop();
    }
  }

  /**
   * Handles delete keys: backspace and delete.
   *
   * @private
   * @param {Boolean} isForward Set to true if delete was performed in forward direction.
   * @returns {Boolean|undefined} Returns `true` if keys were handled correctly.
   */
  _handleDelete(isForward) {
    // Do nothing when the read only mode is enabled.
    if (this.editor.isReadOnly) {
      return;
    }

    const modelDocument = this.editor.model.document;
    const modelSelection = modelDocument.selection;

    // Do nothing on non-collapsed selection.
    if (!modelSelection.isCollapsed) {
      return;
    }

    const objectElement = this._getObjectElementNextToSelection(isForward);

    if (objectElement) {
      this.editor.model.change((writer) => {
        let previousNode = modelSelection.anchor.parent;

        // Remove previous element if empty.
        while (previousNode.isEmpty) {
          const nodeToRemove = previousNode;
          previousNode = nodeToRemove.parent;

          writer.remove(nodeToRemove);
        }

        this._setSelectionOverElement(objectElement);
      });

      return true;
    }
  }

  /**
   * Sets {@link module:engine/model/selection~Selection document's selection} over given element.
   *
   * @protected
   * @param {module:engine/model/element~Element} element
   */
  _setSelectionOverElement(element) {
    this.editor.model.change((writer) => {
      writer.setSelection(writer.createRangeOn(element));
    });
  }

  /**
   * Checks if {@link module:engine/model/element~Element element} placed next to the current
   * {@link module:engine/model/selection~Selection model selection} exists and is marked in
   * {@link module:engine/model/schema~Schema schema} as `object`.
   *
   * @protected
   * @param {Boolean} forward Direction of checking.
   * @returns {module:engine/model/element~Element|null}
   */
  _getObjectElementNextToSelection(forward) {
    const model = this.editor.model;
    const schema = model.schema;
    const modelSelection = model.document.selection;

    // Clone current selection to use it as a probe. We must leave default selection as it is so it can return
    // to its current state after undo.
    const probe = model.createSelection(modelSelection);
    model.modifySelection(probe, {
      direction: forward ? "forward" : "backward",
    });
    const objectElement = forward ? probe.focus.nodeBefore : probe.focus.nodeAfter;

    if (!!objectElement && schema.isObject(objectElement)) {
      return objectElement;
    }

    return null;
  }

  /**
   * Removes CSS class from previously selected widgets.
   *
   * @private
   * @param {module:engine/view/downcastwriter~DowncastWriter} writer
   */
  _clearPreviouslySelectedWidgets(writer) {
    for (const widget of this._previouslySelected) {
      writer.removeClass(WIDGET_SELECTED_CLASS_NAME, widget);
    }

    this._previouslySelected.clear();
  }
}
