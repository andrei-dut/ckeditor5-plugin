// CONCATENATED MODULE: ./node_modules/@ckeditor/ckeditor5-enter/src/enter.js
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import plugin_Plugin from "./plugin";

/**
 * @module enter/enter
 */

/**
 * This plugin handles the <kbd>Enter</kbd> key (hard line break) in the editor.
 *
 * See also the {@link module:enter/shiftenter~ShiftEnter} plugin.
 *
 * For more information about this feature see the {@glink api/enter package page}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class enter_Enter extends plugin_Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "Enter";
  }

  init() {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    view.addObserver(enterobserver_EnterObserver);

    editor.commands.add("enter", new entercommand_EnterCommand(editor));

    this.listenTo(
      viewDocument,
      "enter",
      (evt, data) => {
        data.preventDefault();

        // The soft enter key is handled by the ShiftEnter plugin.
        if (data.isSoft) {
          return;
        }

        editor.execute("enter");

        view.scrollToTheSelection();
      },
      { priority: "low" }
    );
  }
}
