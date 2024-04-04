import plugin_Plugin from "./plugin";

// CONCATENATED MODULE: ./node_modules/@ckeditor/ckeditor5-table/src/tableediting.js
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableediting
 */

/**
 * The table editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
class tableediting_TableEditing extends plugin_Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "TableEditing";
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const model = editor.model;
    const schema = model.schema;
    const conversion = editor.conversion;

    schema.register("table", {
      allowWhere: "$block",
      allowAttributes: ["headingRows", "headingColumns"],
      isObject: true,
      isBlock: true,
    });

    schema.register("tableRow", {
      allowIn: "table",
      isLimit: true,
    });

    schema.register("tableCell", {
      allowIn: "tableRow",
      allowChildren: "$block",
      allowAttributes: ["colspan", "rowspan"],
      isLimit: true,
      isSelectable: true,
    });

    // Figure conversion.
    conversion.for("upcast").add(upcastTableFigure());

    // Table conversion.
    conversion.for("upcast").add(upcastTable());

    conversion.for("editingDowncast").add(downcastInsertTable({ asWidget: true }));
    conversion.for("dataDowncast").add(downcastInsertTable());

    // Table row conversion.
    conversion.for("upcast").elementToElement({ model: "tableRow", view: "tr" });
    conversion.for("upcast").add(skipEmptyTableRow());

    conversion.for("editingDowncast").add(downcastInsertRow());
    conversion.for("editingDowncast").add(downcastRemoveRow());

    // Table cell conversion.
    conversion.for("upcast").elementToElement({ model: "tableCell", view: "td" });
    conversion.for("upcast").elementToElement({ model: "tableCell", view: "th" });
    conversion.for("upcast").add(ensureParagraphInTableCell("td"));
    conversion.for("upcast").add(ensureParagraphInTableCell("th"));

    conversion.for("editingDowncast").add(downcastInsertCell());

    // Duplicates code - needed to properly refresh paragraph inside a table cell.
    conversion.for("editingDowncast").elementToElement({
      model: "paragraph",
      view: convertParagraphInTableCell,
      converterPriority: "high",
    });

    // Table attributes conversion.
    conversion.for("downcast").attributeToAttribute({ model: "colspan", view: "colspan" });
    conversion.for("upcast").attributeToAttribute({
      model: { key: "colspan", value: upcastCellSpan("colspan") },
      view: "colspan",
    });

    conversion.for("downcast").attributeToAttribute({ model: "rowspan", view: "rowspan" });
    conversion.for("upcast").attributeToAttribute({
      model: { key: "rowspan", value: upcastCellSpan("rowspan") },
      view: "rowspan",
    });

    // Table heading columns conversion (a change of heading rows requires a reconversion of the whole table).
    conversion.for("editingDowncast").add(downcastTableHeadingColumnsChange());

    // Manually adjust model position mappings in a special case, when a table cell contains a paragraph, which is bound
    // to its parent (to the table cell). This custom model-to-view position mapping is necessary in data pipeline only,
    // because only during this conversion a paragraph can be bound to its parent.
    editor.data.mapper.on("modelToViewPosition", mapTableCellModelPositionToView());

    // Define the config.
    editor.config.define("table.defaultHeadings.rows", 0);
    editor.config.define("table.defaultHeadings.columns", 0);

    // Define all the commands.
    editor.commands.add("insertTable", new inserttablecommand_InsertTableCommand(editor));
    editor.commands.add(
      "insertTableRowAbove",
      new insertrowcommand_InsertRowCommand(editor, { order: "above" })
    );
    editor.commands.add(
      "insertTableRowBelow",
      new insertrowcommand_InsertRowCommand(editor, { order: "below" })
    );
    editor.commands.add(
      "insertTableColumnLeft",
      new insertcolumncommand_InsertColumnCommand(editor, {
        order: "left",
      })
    );
    editor.commands.add(
      "insertTableColumnRight",
      new insertcolumncommand_InsertColumnCommand(editor, {
        order: "right",
      })
    );

    editor.commands.add("removeTableRow", new removerowcommand_RemoveRowCommand(editor));
    editor.commands.add("removeTableColumn", new removecolumncommand_RemoveColumnCommand(editor));

    editor.commands.add(
      "splitTableCellVertically",
      new splitcellcommand_SplitCellCommand(editor, {
        direction: "vertically",
      })
    );
    editor.commands.add(
      "splitTableCellHorizontally",
      new splitcellcommand_SplitCellCommand(editor, {
        direction: "horizontally",
      })
    );

    editor.commands.add("mergeTableCells", new mergecellscommand_MergeCellsCommand(editor));

    editor.commands.add(
      "mergeTableCellRight",
      new mergecellcommand_MergeCellCommand(editor, {
        direction: "right",
      })
    );
    editor.commands.add(
      "mergeTableCellLeft",
      new mergecellcommand_MergeCellCommand(editor, {
        direction: "left",
      })
    );
    editor.commands.add(
      "mergeTableCellDown",
      new mergecellcommand_MergeCellCommand(editor, {
        direction: "down",
      })
    );
    editor.commands.add(
      "mergeTableCellUp",
      new mergecellcommand_MergeCellCommand(editor, { direction: "up" })
    );

    editor.commands.add(
      "setTableColumnHeader",
      new setheadercolumncommand_SetHeaderColumnCommand(editor)
    );
    editor.commands.add("setTableRowHeader", new setheaderrowcommand_SetHeaderRowCommand(editor));

    editor.commands.add("selectTableRow", new selectrowcommand_SelectRowCommand(editor));
    editor.commands.add("selectTableColumn", new selectcolumncommand_SelectColumnCommand(editor));

    injectTableHeadingRowsRefreshPostFixer(model);
    injectTableLayoutPostFixer(model);
    injectTableCellRefreshPostFixer(model, editor.editing.mapper);
    injectTableCellParagraphPostFixer(model);
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [tableutils_TableUtils];
  }
}

// CONCATENATED MODULE: ./node_modules/@ckeditor/ckeditor5-table/src/tableui.js
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableui
 */

/**
 * The table UI plugin. It introduces:
 *
 * * The `'insertTable'` dropdown,
 * * The `'tableColumn'` dropdown,
 * * The `'tableRow'` dropdown,
 * * The `'mergeTableCells'` split button.
 *
 * The `'tableColumn'`, `'tableRow'` and `'mergeTableCells'` dropdowns work best with {@link module:table/tabletoolbar~TableToolbar}.
 *
 * @extends module:core/plugin~Plugin
 */
class tableui_TableUI extends plugin_Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "TableUI";
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const t = this.editor.t;
    const contentLanguageDirection = editor.locale.contentLanguageDirection;
    const isContentLtr = contentLanguageDirection === "ltr";

    editor.ui.componentFactory.add("insertTable", (locale) => {
      const command = editor.commands.get("insertTable");
      const dropdownView = createDropdown(locale);

      dropdownView.bind("isEnabled").to(command);

      // Decorate dropdown's button.
      dropdownView.buttonView.set({
        icon: icons_table,
        label: t("Insert table"),
        tooltip: true,
      });

      let insertTableView;

      dropdownView.on("change:isOpen", () => {
        if (insertTableView) {
          return;
        }

        // Prepare custom view for dropdown's panel.
        insertTableView = new inserttableview_InsertTableView(locale);
        dropdownView.panelView.children.add(insertTableView);

        insertTableView.delegate("execute").to(dropdownView);

        dropdownView.buttonView.on("open", () => {
          // Reset the chooser before showing it to the user.
          insertTableView.rows = 0;
          insertTableView.columns = 0;
        });

        dropdownView.on("execute", () => {
          editor.execute("insertTable", {
            rows: insertTableView.rows,
            columns: insertTableView.columns,
          });
          editor.editing.view.focus();
        });
      });

      return dropdownView;
    });

    editor.ui.componentFactory.add("tableColumn", (locale) => {
      const options = [
        {
          type: "switchbutton",
          model: {
            commandName: "setTableColumnHeader",
            label: t("Header column"),
            bindIsOn: true,
          },
        },
        { type: "separator" },
        {
          type: "button",
          model: {
            commandName: isContentLtr ? "insertTableColumnLeft" : "insertTableColumnRight",
            label: t("Insert column left"),
          },
        },
        {
          type: "button",
          model: {
            commandName: isContentLtr ? "insertTableColumnRight" : "insertTableColumnLeft",
            label: t("Insert column right"),
          },
        },
        {
          type: "button",
          model: {
            commandName: "removeTableColumn",
            label: t("Delete column"),
          },
        },
        {
          type: "button",
          model: {
            commandName: "selectTableColumn",
            label: t("Select column"),
          },
        },
      ];

      return this._prepareDropdown(t("Column"), table_column, options, locale);
    });

    editor.ui.componentFactory.add("tableRow", (locale) => {
      const options = [
        {
          type: "switchbutton",
          model: {
            commandName: "setTableRowHeader",
            label: t("Header row"),
            bindIsOn: true,
          },
        },
        { type: "separator" },
        {
          type: "button",
          model: {
            commandName: "insertTableRowAbove",
            label: t("Insert row above"),
          },
        },
        {
          type: "button",
          model: {
            commandName: "insertTableRowBelow",
            label: t("Insert row below"),
          },
        },
        {
          type: "button",
          model: {
            commandName: "removeTableRow",
            label: t("Delete row"),
          },
        },
        {
          type: "button",
          model: {
            commandName: "selectTableRow",
            label: t("Select row"),
          },
        },
      ];

      return this._prepareDropdown(t("Row"), table_row, options, locale);
    });

    editor.ui.componentFactory.add("mergeTableCells", (locale) => {
      const options = [
        {
          type: "button",
          model: {
            commandName: "mergeTableCellUp",
            label: t("Merge cell up"),
          },
        },
        {
          type: "button",
          model: {
            commandName: isContentLtr ? "mergeTableCellRight" : "mergeTableCellLeft",
            label: t("Merge cell right"),
          },
        },
        {
          type: "button",
          model: {
            commandName: "mergeTableCellDown",
            label: t("Merge cell down"),
          },
        },
        {
          type: "button",
          model: {
            commandName: isContentLtr ? "mergeTableCellLeft" : "mergeTableCellRight",
            label: t("Merge cell left"),
          },
        },
        { type: "separator" },
        {
          type: "button",
          model: {
            commandName: "splitTableCellVertically",
            label: t("Split cell vertically"),
          },
        },
        {
          type: "button",
          model: {
            commandName: "splitTableCellHorizontally",
            label: t("Split cell horizontally"),
          },
        },
      ];

      return this._prepareMergeSplitButtonDropdown(
        t("Merge cells"),
        table_merge_cell,
        options,
        locale
      );
    });
  }

  /**
   * Creates a dropdown view from a set of options.
   *
   * @private
   * @param {String} label The dropdown button label.
   * @param {String} icon An icon for the dropdown button.
   * @param {Array.<module:ui/dropdown/utils~ListDropdownItemDefinition>} options The list of options for the dropdown.
   * @param {module:utils/locale~Locale} locale
   * @returns {module:ui/dropdown/dropdownview~DropdownView}
   */
  _prepareDropdown(label, icon, options, locale) {
    const editor = this.editor;
    const dropdownView = createDropdown(locale);
    const commands = this._fillDropdownWithListOptions(dropdownView, options);

    // Decorate dropdown's button.
    dropdownView.buttonView.set({
      label,
      icon,
      tooltip: true,
    });

    // Make dropdown button disabled when all options are disabled.
    dropdownView.bind("isEnabled").toMany(commands, "isEnabled", (...areEnabled) => {
      return areEnabled.some((isEnabled) => isEnabled);
    });

    this.listenTo(dropdownView, "execute", (evt) => {
      editor.execute(evt.source.commandName);
      editor.editing.view.focus();
    });

    return dropdownView;
  }

  /**
   * Creates a dropdown view with a {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView} for
   * merge (and split)–related commands.
   *
   * @private
   * @param {String} label The dropdown button label.
   * @param {String} icon An icon for the dropdown button.
   * @param {Array.<module:ui/dropdown/utils~ListDropdownItemDefinition>} options The list of options for the dropdown.
   * @param {module:utils/locale~Locale} locale
   * @returns {module:ui/dropdown/dropdownview~DropdownView}
   */
  _prepareMergeSplitButtonDropdown(label, icon, options, locale) {
    const editor = this.editor;
    const dropdownView = createDropdown(locale, splitbuttonview_SplitButtonView);
    const mergeCommandName = "mergeTableCells";

    // Main command.
    const mergeCommand = editor.commands.get(mergeCommandName);

    // Subcommands in the dropdown.
    const commands = this._fillDropdownWithListOptions(dropdownView, options);

    dropdownView.buttonView.set({
      label,
      icon,
      tooltip: true,
      isEnabled: true,
    });

    // Make dropdown button disabled when all options are disabled together with the main command.
    dropdownView
      .bind("isEnabled")
      .toMany([mergeCommand, ...commands], "isEnabled", (...areEnabled) => {
        return areEnabled.some((isEnabled) => isEnabled);
      });

    // Merge selected table cells when the main part of the split button is clicked.
    this.listenTo(dropdownView.buttonView, "execute", () => {
      editor.execute(mergeCommandName);
      editor.editing.view.focus();
    });

    // Execute commands for events coming from the list in the dropdown panel.
    this.listenTo(dropdownView, "execute", (evt) => {
      editor.execute(evt.source.commandName);
      editor.editing.view.focus();
    });

    return dropdownView;
  }

  /**
   * Injects a {@link module:ui/list/listview~ListView} into the passed dropdown with buttons
   * which execute editor commands as configured in passed options.
   *
   * @private
   * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView
   * @param {Array.<module:ui/dropdown/utils~ListDropdownItemDefinition>} options The list of options for the dropdown.
   * @returns {Array.<module:core/command~Command>} Commands the list options are interacting with.
   */
  _fillDropdownWithListOptions(dropdownView, options) {
    const editor = this.editor;
    const commands = [];
    const itemDefinitions = new src_collection["default"]();

    for (const option of options) {
      addListOption(option, editor, commands, itemDefinitions);
    }

    addListToDropdown(dropdownView, itemDefinitions, editor.ui.componentFactory);

    return commands;
  }
}

// CONCATENATED MODULE: ./node_modules/@ckeditor/ckeditor5-table/src/tableselection.js
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection
 */

/**
 * This plugin enables the advanced table cells, rows and columns selection.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 *
 * @extends module:core/plugin~Plugin
 */
class tableselection_TableSelection extends plugin_Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "TableSelection";
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [tableutils_TableUtils];
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const model = editor.model;

    this.listenTo(model, "deleteContent", (evt, args) => this._handleDeleteContent(evt, args), {
      priority: "high",
    });

    this._defineSelectionConverter();
    this._enablePluginDisabling(); // sic!
  }

  /**
   * Returns the currently selected table cells or `null` if it is not a table cells selection.
   *
   * @returns {Array.<module:engine/model/element~Element>|null}
   */
  getSelectedTableCells() {
    const selection = this.editor.model.document.selection;

    const selectedCells = getSelectedTableCells(selection);

    if (selectedCells.length == 0) {
      return null;
    }

    // This should never happen, but let's know if it ever happens.
    // @if CK_DEBUG //	/* istanbul ignore next */
    // @if CK_DEBUG //	if ( selectedCells.length != selection.rangeCount ) {
    // @if CK_DEBUG //		console.warn( 'Mixed selection warning. The selection contains table cells and some other ranges.' );
    // @if CK_DEBUG //	}

    return selectedCells;
  }

  /**
   * Returns the selected table fragment as a document fragment.
   *
   * @returns {module:engine/model/documentfragment~DocumentFragment|null}
   */
  getSelectionAsFragment() {
    const selectedCells = this.getSelectedTableCells();

    if (!selectedCells) {
      return null;
    }

    return this.editor.model.change((writer) => {
      const documentFragment = writer.createDocumentFragment();
      const tableUtils = this.editor.plugins.get("TableUtils");

      const { first: firstColumn, last: lastColumn } = getColumnIndexes(selectedCells);
      const { first: firstRow, last: lastRow } = getRowIndexes(selectedCells);

      const sourceTable = selectedCells[0].findAncestor("table");

      let adjustedLastRow = lastRow;
      let adjustedLastColumn = lastColumn;

      // If the selection is rectangular there could be a case of all cells in the last row/column spanned over
      // next row/column so the real lastRow/lastColumn should be updated.
      if (isSelectionRectangular(selectedCells, tableUtils)) {
        const dimensions = {
          firstColumn,
          lastColumn,
          firstRow,
          lastRow,
        };

        adjustedLastRow = adjustLastRowIndex(sourceTable, dimensions);
        adjustedLastColumn = adjustLastColumnIndex(sourceTable, dimensions);
      }

      const cropDimensions = {
        startRow: firstRow,
        startColumn: firstColumn,
        endRow: adjustedLastRow,
        endColumn: adjustedLastColumn,
      };

      const table = cropTableToDimensions(sourceTable, cropDimensions, writer);

      writer.insert(table, documentFragment, 0);

      return documentFragment;
    });
  }

  /**
   * Sets the model selection based on given anchor and target cells (can be the same cell).
   * Takes care of setting the backward flag.
   *
   *		const modelRoot = editor.model.document.getRoot();
   *		const firstCell = modelRoot.getNodeByPath( [ 0, 0, 0 ] );
   *		const lastCell = modelRoot.getNodeByPath( [ 0, 0, 1 ] );
   *
   *		const tableSelection = editor.plugins.get( 'TableSelection' );
   *		tableSelection.setCellSelection( firstCell, lastCell );
   *
   * @param {module:engine/model/element~Element} anchorCell
   * @param {module:engine/model/element~Element} targetCell
   */
  setCellSelection(anchorCell, targetCell) {
    const cellsToSelect = this._getCellsToSelect(anchorCell, targetCell);

    this.editor.model.change((writer) => {
      writer.setSelection(
        cellsToSelect.cells.map((cell) => writer.createRangeOn(cell)),
        { backward: cellsToSelect.backward }
      );
    });
  }

  /**
   * Returns the focus cell from the current selection.
   *
   * @returns {module:engine/model/element~Element}
   */
  getFocusCell() {
    const selection = this.editor.model.document.selection;
    const focusCellRange = [...selection.getRanges()].pop();
    const element = focusCellRange.getContainedElement();

    if (element && element.is("element", "tableCell")) {
      return element;
    }

    return null;
  }

  /**
   * Returns the anchor cell from the current selection.
   *
   * @returns {module:engine/model/element~Element} anchorCell
   */
  getAnchorCell() {
    const selection = this.editor.model.document.selection;
    const anchorCellRange = first_first(selection.getRanges());
    const element = anchorCellRange.getContainedElement();

    if (element && element.is("element", "tableCell")) {
      return element;
    }

    return null;
  }

  /**
   * Defines a selection converter which marks the selected cells with a specific class.
   *
   * The real DOM selection is put in the last cell. Since the order of ranges is dependent on whether the
   * selection is backward or not, the last cell will usually be close to the "focus" end of the selection
   * (a selection has anchor and focus).
   *
   * The real DOM selection is then hidden with CSS.
   *
   * @private
   */
  _defineSelectionConverter() {
    const editor = this.editor;
    const highlighted = new Set();

    editor.conversion.for("editingDowncast").add((dispatcher) =>
      dispatcher.on(
        "selection",
        (evt, data, conversionApi) => {
          const viewWriter = conversionApi.writer;

          clearHighlightedTableCells(viewWriter);

          const selectedCells = this.getSelectedTableCells();

          if (!selectedCells) {
            return;
          }

          for (const tableCell of selectedCells) {
            const viewElement = conversionApi.mapper.toViewElement(tableCell);

            viewWriter.addClass("ck-editor__editable_selected", viewElement);
            highlighted.add(viewElement);
          }

          const lastViewCell = conversionApi.mapper.toViewElement(
            selectedCells[selectedCells.length - 1]
          );
          viewWriter.setSelection(lastViewCell, 0);
        },
        { priority: "lowest" }
      )
    );

    function clearHighlightedTableCells(writer) {
      for (const previouslyHighlighted of highlighted) {
        writer.removeClass("ck-editor__editable_selected", previouslyHighlighted);
      }

      highlighted.clear();
    }
  }

  /**
   * Creates a listener that reacts to changes in {@link #isEnabled} and, if the plugin was disabled,
   * it collapses the multi-cell selection to a regular selection placed inside a table cell.
   *
   * This listener helps features that disable the table selection plugin bring the selection
   * to a clear state they can work with (for instance, because they don't support multiple cell selection).
   */
  _enablePluginDisabling() {
    const editor = this.editor;

    this.on("change:isEnabled", () => {
      if (!this.isEnabled) {
        const selectedCells = this.getSelectedTableCells();

        if (!selectedCells) {
          return;
        }

        editor.model.change((writer) => {
          const position = writer.createPositionAt(selectedCells[0], 0);
          const range = editor.model.schema.getNearestSelectionRange(position);

          writer.setSelection(range);
        });
      }
    });
  }

  /**
   * Overrides the default `model.deleteContent()` behavior over a selected table fragment.
   *
   * @private
   * @param {module:utils/eventinfo~EventInfo} event
   * @param {Array.<*>} args Delete content method arguments.
   */
  _handleDeleteContent(event, args) {
    const [selection, options] = args;
    const model = this.editor.model;
    const isBackward = !options || options.direction == "backward";
    const selectedTableCells = getSelectedTableCells(selection);

    if (!selectedTableCells.length) {
      return;
    }

    event.stop();

    model.change((writer) => {
      const tableCellToSelect = selectedTableCells[isBackward ? selectedTableCells.length - 1 : 0];

      model.change((writer) => {
        for (const tableCell of selectedTableCells) {
          model.deleteContent(writer.createSelection(tableCell, "in"));
        }
      });

      const rangeToSelect = model.schema.getNearestSelectionRange(
        writer.createPositionAt(tableCellToSelect, 0)
      );

      // Note: we ignore the case where rangeToSelect may be null because deleteContent() will always (unless someone broke it)
      // create an empty paragraph to accommodate the selection.

      if (selection.is("documentSelection")) {
        writer.setSelection(rangeToSelect);
      } else {
        selection.setTo(rangeToSelect);
      }
    });
  }

  /**
   * Returns an array of table cells that should be selected based on the
   * given anchor cell and target (focus) cell.
   *
   * The cells are returned in a reverse direction if the selection is backward.
   *
   * @private
   * @param {module:engine/model/element~Element} anchorCell
   * @param {module:engine/model/element~Element} targetCell
   * @returns {Array.<module:engine/model/element~Element>}
   */
  _getCellsToSelect(anchorCell, targetCell) {
    const tableUtils = this.editor.plugins.get("TableUtils");
    const startLocation = tableUtils.getCellLocation(anchorCell);
    const endLocation = tableUtils.getCellLocation(targetCell);

    const startRow = Math.min(startLocation.row, endLocation.row);
    const endRow = Math.max(startLocation.row, endLocation.row);

    const startColumn = Math.min(startLocation.column, endLocation.column);
    const endColumn = Math.max(startLocation.column, endLocation.column);

    // 2-dimensional array of the selected cells to ease flipping the order of cells for backward selections.
    const selectionMap = new Array(endRow - startRow + 1).fill(null).map(() => []);

    const walkerOptions = {
      startRow,
      endRow,
      startColumn,
      endColumn,
    };

    for (const { row, cell } of new TableWalker(anchorCell.findAncestor("table"), walkerOptions)) {
      selectionMap[row - startRow].push(cell);
    }

    const flipVertically = endLocation.row < startLocation.row;
    const flipHorizontally = endLocation.column < startLocation.column;

    if (flipVertically) {
      selectionMap.reverse();
    }

    if (flipHorizontally) {
      selectionMap.forEach((row) => row.reverse());
    }

    return {
      cells: selectionMap.flat(),
      backward: flipVertically || flipHorizontally,
    };
  }
}

// CONCATENATED MODULE: ./node_modules/@ckeditor/ckeditor5-table/src/tablemouse.js
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablemouse
 */

/**
 * This plugin enables a table cells' selection with the mouse.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 *
 * @extends module:core/plugin~Plugin
 */
class tablemouse_TableMouse extends plugin_Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "TableMouse";
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [tableselection_TableSelection];
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;

    // Currently the MouseObserver only handles `mousedown` and `mouseup` events.
    // TODO move to the engine?
    editor.editing.view.addObserver(mouseeventsobserver_MouseEventsObserver);

    this._enableShiftClickSelection();
    this._enableMouseDragSelection();
  }

  /**
   * Enables making cells selection by <kbd>Shift</kbd>+click. Creates a selection from the cell which previously held
   * the selection to the cell which was clicked. It can be the same cell, in which case it selects a single cell.
   *
   * @private
   */
  _enableShiftClickSelection() {
    const editor = this.editor;
    let blockSelectionChange = false;

    const tableSelection = editor.plugins.get(tableselection_TableSelection);

    this.listenTo(editor.editing.view.document, "mousedown", (evt, domEventData) => {
      if (!this.isEnabled || !tableSelection.isEnabled) {
        return;
      }

      if (!domEventData.domEvent.shiftKey) {
        return;
      }

      const anchorCell =
        tableSelection.getAnchorCell() ||
        getTableCellsContainingSelection(editor.model.document.selection)[0];

      if (!anchorCell) {
        return;
      }

      const targetCell = this._getModelTableCellFromDomEvent(domEventData);

      if (targetCell && haveSameTableParent(anchorCell, targetCell)) {
        blockSelectionChange = true;
        tableSelection.setCellSelection(anchorCell, targetCell);

        domEventData.preventDefault();
      }
    });

    this.listenTo(editor.editing.view.document, "mouseup", () => {
      blockSelectionChange = false;
    });

    // We need to ignore a `selectionChange` event that is fired after we render our new table cells selection.
    // When downcasting table cells selection to the view, we put the view selection in the last selected cell
    // in a place that may not be natively a "correct" location. This is – we put it directly in the `<td>` element.
    // All browsers fire the native `selectionchange` event.
    // However, all browsers except Safari return the selection in the exact place where we put it
    // (even though it's visually normalized). Safari returns `<td><p>^foo` that makes our selection observer
    // fire our `selectionChange` event (because the view selection that we set in the first step differs from the DOM selection).
    // Since `selectionChange` is fired, we automatically update the model selection that moves it that paragraph.
    // This breaks our dear cells selection.
    //
    // Theoretically this issue concerns only Safari that is the only browser that do normalize the selection.
    // However, to avoid code branching and to have a good coverage for this event blocker, I enabled it for all browsers.
    //
    // Note: I'm keeping the `blockSelectionChange` state separately for shift+click and mouse drag (exact same logic)
    // so I don't have to try to analyze whether they don't overlap in some weird cases. Probably they don't.
    // But I have other things to do, like writing this comment.
    this.listenTo(
      editor.editing.view.document,
      "selectionChange",
      (evt) => {
        if (blockSelectionChange) {
          // @if CK_DEBUG // console.log( 'Blocked selectionChange to avoid breaking table cells selection.' );

          evt.stop();
        }
      },
      { priority: "highest" }
    );
  }

  /**
   * Enables making cells selection by dragging.
   *
   * The selection is made only on mousemove. Mouse tracking is started on mousedown.
   * However, the cells selection is enabled only after the mouse cursor left the anchor cell.
   * Thanks to that normal text selection within one cell works just fine. However, you can still select
   * just one cell by leaving the anchor cell and moving back to it.
   *
   * @private
   */
  _enableMouseDragSelection() {
    const editor = this.editor;
    let anchorCell, targetCell;
    let beganCellSelection = false;
    let blockSelectionChange = false;

    const tableSelection = editor.plugins.get(tableselection_TableSelection);

    this.listenTo(editor.editing.view.document, "mousedown", (evt, domEventData) => {
      if (!this.isEnabled || !tableSelection.isEnabled) {
        return;
      }

      // Make sure to not conflict with the shift+click listener and any other possible handler.
      if (
        domEventData.domEvent.shiftKey ||
        domEventData.domEvent.ctrlKey ||
        domEventData.domEvent.altKey
      ) {
        return;
      }

      anchorCell = this._getModelTableCellFromDomEvent(domEventData);
    });

    this.listenTo(editor.editing.view.document, "mousemove", (evt, domEventData) => {
      if (!domEventData.domEvent.buttons) {
        return;
      }

      if (!anchorCell) {
        return;
      }

      const newTargetCell = this._getModelTableCellFromDomEvent(domEventData);

      if (newTargetCell && haveSameTableParent(anchorCell, newTargetCell)) {
        targetCell = newTargetCell;

        // Switch to the cell selection mode after the mouse cursor left the anchor cell.
        // Switch off only on mouseup (makes selecting a single cell possible).
        if (!beganCellSelection && targetCell != anchorCell) {
          beganCellSelection = true;
        }
      }

      // Yep, not making a cell selection yet. See method docs.
      if (!beganCellSelection) {
        return;
      }

      blockSelectionChange = true;
      tableSelection.setCellSelection(anchorCell, targetCell);

      domEventData.preventDefault();
    });

    this.listenTo(editor.editing.view.document, "mouseup", () => {
      beganCellSelection = false;
      blockSelectionChange = false;
      anchorCell = null;
      targetCell = null;
    });

    // See the explanation in `_enableShiftClickSelection()`.
    this.listenTo(
      editor.editing.view.document,
      "selectionChange",
      (evt) => {
        if (blockSelectionChange) {
          // @if CK_DEBUG // console.log( 'Blocked selectionChange to avoid breaking table cells selection.' );

          evt.stop();
        }
      },
      { priority: "highest" }
    );
  }

  /**
   * Returns the model table cell element based on the target element of the passed DOM event.
   *
   * @private
   * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
   * @returns {module:engine/model/element~Element|undefined} Returns the table cell or `undefined`.
   */
  _getModelTableCellFromDomEvent(domEventData) {
    // Note: Work with positions (not element mapping) because the target element can be an attribute or other non-mapped element.
    const viewTargetElement = domEventData.target;
    const viewPosition = this.editor.editing.view.createPositionAt(viewTargetElement, 0);
    const modelPosition = this.editor.editing.mapper.toModelPosition(viewPosition);
    const modelElement = modelPosition.parent;

    return modelElement.findAncestor("tableCell", {
      includeSelf: true,
    });
  }
}

// CONCATENATED MODULE: ./node_modules/@ckeditor/ckeditor5-table/src/tablekeyboard.js
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablekeyboard
 */

/**
 * This plugin enables keyboard navigation for tables.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 *
 * @extends module:core/plugin~Plugin
 */
class tablekeyboard_TableKeyboard extends plugin_Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "TableKeyboard";
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [tableselection_TableSelection];
  }

  /**
   * @inheritDoc
   */
  init() {
    const view = this.editor.editing.view;
    const viewDocument = view.document;

    // Handle Tab key navigation.
    this.editor.keystrokes.set("Tab", (...args) => this._handleTabOnSelectedTable(...args), {
      priority: "low",
    });
    this.editor.keystrokes.set("Tab", this._getTabHandler(true), {
      priority: "low",
    });
    this.editor.keystrokes.set("Shift+Tab", this._getTabHandler(false), { priority: "low" });

    this.listenTo(viewDocument, "arrowKey", (...args) => this._onArrowKey(...args), {
      context: "table",
    });
  }

  /**
   * Handles {@link module:engine/view/document~Document#event:keydown keydown} events for the <kbd>Tab</kbd> key executed
   * when the table widget is selected.
   *
   * @private
   * @param {module:engine/view/observer/keyobserver~KeyEventData} data Key event data.
   * @param {Function} cancel The stop/stopPropagation/preventDefault function.
   */
  _handleTabOnSelectedTable(data, cancel) {
    const editor = this.editor;
    const selection = editor.model.document.selection;
    const selectedElement = selection.getSelectedElement();

    if (!selectedElement || !selectedElement.is("element", "table")) {
      return;
    }

    cancel();

    editor.model.change((writer) => {
      writer.setSelection(writer.createRangeIn(selectedElement.getChild(0).getChild(0)));
    });
  }

  /**
   * Returns a handler for {@link module:engine/view/document~Document#event:keydown keydown} events for the <kbd>Tab</kbd> key executed
   * inside table cells.
   *
   * @private
   * @param {Boolean} isForward Whether this handler will move the selection to the next or the previous cell.
   */
  _getTabHandler(isForward) {
    const editor = this.editor;

    return (domEventData, cancel) => {
      const selection = editor.model.document.selection;
      let tableCell = getTableCellsContainingSelection(selection)[0];

      if (!tableCell) {
        tableCell = this.editor.plugins.get("TableSelection").getFocusCell();
      }

      if (!tableCell) {
        return;
      }

      cancel();

      const tableRow = tableCell.parent;
      const table = tableRow.parent;

      const currentRowIndex = table.getChildIndex(tableRow);
      const currentCellIndex = tableRow.getChildIndex(tableCell);

      const isFirstCellInRow = currentCellIndex === 0;

      if (!isForward && isFirstCellInRow && currentRowIndex === 0) {
        // Set the selection over the whole table if the selection was in the first table cell.
        editor.model.change((writer) => {
          writer.setSelection(writer.createRangeOn(table));
        });

        return;
      }

      const tableUtils = this.editor.plugins.get("TableUtils");
      const isLastCellInRow = currentCellIndex === tableRow.childCount - 1;
      const isLastRow = currentRowIndex === tableUtils.getRows(table) - 1;

      if (isForward && isLastRow && isLastCellInRow) {
        editor.execute("insertTableRowBelow");

        // Check if the command actually added a row. If `insertTableRowBelow` execution didn't add a row (because it was disabled
        // or it got overwritten) set the selection over the whole table to mirror the first cell case.
        if (currentRowIndex === tableUtils.getRows(table) - 1) {
          editor.model.change((writer) => {
            writer.setSelection(writer.createRangeOn(table));
          });

          return;
        }
      }

      let cellToFocus;

      // Move to the first cell in the next row.
      if (isForward && isLastCellInRow) {
        const nextRow = table.getChild(currentRowIndex + 1);

        cellToFocus = nextRow.getChild(0);
      }
      // Move to the last cell in the previous row.
      else if (!isForward && isFirstCellInRow) {
        const previousRow = table.getChild(currentRowIndex - 1);

        cellToFocus = previousRow.getChild(previousRow.childCount - 1);
      }
      // Move to the next/previous cell.
      else {
        cellToFocus = tableRow.getChild(currentCellIndex + (isForward ? 1 : -1));
      }

      editor.model.change((writer) => {
        writer.setSelection(writer.createRangeIn(cellToFocus));
      });
    };
  }

  /**
   * Handles {@link module:engine/view/document~Document#event:keydown keydown} events.
   *
   * @private
   * @param {module:utils/eventinfo~EventInfo} eventInfo
   * @param {module:engine/view/observer/domeventdata~DomEventData} domEventData
   */
  _onArrowKey(eventInfo, domEventData) {
    const editor = this.editor;
    const keyCode = domEventData.keyCode;

    const direction = getLocalizedArrowKeyCodeDirection(
      keyCode,
      editor.locale.contentLanguageDirection
    );
    const wasHandled = this._handleArrowKeys(direction, domEventData.shiftKey);

    if (wasHandled) {
      domEventData.preventDefault();
      domEventData.stopPropagation();
      eventInfo.stop();
    }
  }

  /**
   * Handles arrow keys to move the selection around the table.
   *
   * @private
   * @param {'left'|'up'|'right'|'down'} direction The direction of the arrow key.
   * @param {Boolean} expandSelection If the current selection should be expanded.
   * @returns {Boolean} Returns `true` if key was handled.
   */
  _handleArrowKeys(direction, expandSelection) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const isForward = ["right", "down"].includes(direction);

    // In case one or more table cells are selected (from outside),
    // move the selection to a cell adjacent to the selected table fragment.
    const selectedCells = getSelectedTableCells(selection);

    if (selectedCells.length) {
      let focusCell;

      if (expandSelection) {
        focusCell = this.editor.plugins.get("TableSelection").getFocusCell();
      } else {
        focusCell = isForward ? selectedCells[selectedCells.length - 1] : selectedCells[0];
      }

      this._navigateFromCellInDirection(focusCell, direction, expandSelection);

      return true;
    }

    // Abort if we're not in a table cell.
    const tableCell = selection.focus.findAncestor("tableCell");

    /* istanbul ignore if: paranoid check */
    if (!tableCell) {
      return false;
    }

    // Navigation is in the opposite direction than the selection direction so this is shrinking of the selection.
    // Selection for sure will not approach cell edge.
    if (expandSelection && !selection.isCollapsed && selection.isBackward == isForward) {
      return false;
    }

    // Let's check if the selection is at the beginning/end of the cell.
    if (this._isSelectionAtCellEdge(selection, tableCell, isForward)) {
      this._navigateFromCellInDirection(tableCell, direction, expandSelection);

      return true;
    }

    return false;
  }

  /**
   * Returns `true` if the selection is at the boundary of a table cell according to the navigation direction.
   *
   * @private
   * @param {module:engine/model/selection~Selection} selection The current selection.
   * @param {module:engine/model/element~Element} tableCell The current table cell element.
   * @param {Boolean} isForward The expected navigation direction.
   * @returns {Boolean}
   */
  _isSelectionAtCellEdge(selection, tableCell, isForward) {
    const model = this.editor.model;
    const schema = this.editor.model.schema;

    const focus = isForward ? selection.getLastPosition() : selection.getFirstPosition();

    // If the current limit element is not table cell we are for sure not at the cell edge.
    // Also `modifySelection` will not let us out of it.
    if (!schema.getLimitElement(focus).is("element", "tableCell")) {
      const boundaryPosition = model.createPositionAt(tableCell, isForward ? "end" : 0);

      return boundaryPosition.isTouching(focus);
    }

    const probe = model.createSelection(focus);

    model.modifySelection(probe, {
      direction: isForward ? "forward" : "backward",
    });

    // If there was no change in the focus position, then it's not possible to move the selection there.
    return focus.isEqual(probe.focus);
  }

  /**
   * Moves the selection from the given table cell in the specified direction.
   *
   * @protected
   * @param {module:engine/model/element~Element} focusCell The table cell that is current multi-cell selection focus.
   * @param {'left'|'up'|'right'|'down'} direction Direction in which selection should move.
   * @param {Boolean} [expandSelection=false] If the current selection should be expanded.
   */
  _navigateFromCellInDirection(focusCell, direction, expandSelection = false) {
    const model = this.editor.model;

    const table = focusCell.findAncestor("table");
    const tableMap = [...new TableWalker(table, { includeAllSlots: true })];
    const { row: lastRow, column: lastColumn } = tableMap[tableMap.length - 1];

    const currentCellInfo = tableMap.find(({ cell }) => cell == focusCell);
    let { row, column } = currentCellInfo;

    switch (direction) {
      case "left":
        column--;
        break;

      case "up":
        row--;
        break;

      case "right":
        column += currentCellInfo.cellWidth;
        break;

      case "down":
        row += currentCellInfo.cellHeight;
        break;
    }

    const isOutsideVertically = row < 0 || row > lastRow;
    const isBeforeFirstCell = column < 0 && row <= 0;
    const isAfterLastCell = column > lastColumn && row >= lastRow;

    // Note that if the table cell at the end of a row is row-spanned then isAfterLastCell will never be true.
    // However, we don't know if user was navigating on the last row or not, so let's stay in the table.

    if (isOutsideVertically || isBeforeFirstCell || isAfterLastCell) {
      model.change((writer) => {
        writer.setSelection(writer.createRangeOn(table));
      });

      return;
    }

    if (column < 0) {
      column = expandSelection ? 0 : lastColumn;
      row--;
    } else if (column > lastColumn) {
      column = expandSelection ? lastColumn : 0;
      row++;
    }

    const cellToSelect = tableMap.find(
      (cellInfo) => cellInfo.row == row && cellInfo.column == column
    ).cell;
    const isForward = ["right", "down"].includes(direction);
    const tableSelection = this.editor.plugins.get("TableSelection");

    if (expandSelection && tableSelection.isEnabled) {
      const anchorCell = tableSelection.getAnchorCell() || focusCell;

      tableSelection.setCellSelection(anchorCell, cellToSelect);
    } else {
      const positionToSelect = model.createPositionAt(cellToSelect, isForward ? 0 : "end");

      model.change((writer) => {
        writer.setSelection(positionToSelect);
      });
    }
  }
}

// CONCATENATED MODULE: ./node_modules/@ckeditor/ckeditor5-table/src/tableclipboard.js
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableclipboard
 */

/**
 * This plugin adds support for copying/cutting/pasting fragments of tables.
 * It is loaded automatically by the {@link module:table/table~Table} plugin.
 *
 * @extends module:core/plugin~Plugin
 */
class tableclipboard_TableClipboard extends plugin_Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "TableClipboard";
  }

  /**
   * @inheritDoc
   */
  static get requires() {
    return [tableselection_TableSelection, tableutils_TableUtils];
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const viewDocument = editor.editing.view.document;

    this.listenTo(viewDocument, "copy", (evt, data) => this._onCopyCut(evt, data));
    this.listenTo(viewDocument, "cut", (evt, data) => this._onCopyCut(evt, data));
    this.listenTo(
      editor.model,
      "insertContent",
      (evt, args) => this._onInsertContent(evt, ...args),
      { priority: "high" }
    );

    this.decorate("_replaceTableSlotCell");
  }

  /**
   * Copies table content to a clipboard on "copy" & "cut" events.
   *
   * @private
   * @param {module:utils/eventinfo~EventInfo} evt An object containing information about the handled event.
   * @param {Object} data Clipboard event data.
   */
  _onCopyCut(evt, data) {
    const tableSelection = this.editor.plugins.get(tableselection_TableSelection);

    if (!tableSelection.getSelectedTableCells()) {
      return;
    }

    if (evt.name == "cut" && this.editor.isReadOnly) {
      return;
    }

    data.preventDefault();
    evt.stop();

    const dataController = this.editor.data;
    const viewDocument = this.editor.editing.view.document;

    const content = dataController.toView(tableSelection.getSelectionAsFragment());

    viewDocument.fire("clipboardOutput", {
      dataTransfer: data.dataTransfer,
      content,
      method: evt.name,
    });
  }

  /**
   * Overrides default {@link module:engine/model/model~Model#insertContent `model.insertContent()`} method to handle pasting table inside
   * selected table fragment.
   *
   * Depending on selected table fragment:
   * - If a selected table fragment is smaller than paste table it will crop pasted table to match dimensions.
   * - If dimensions are equal it will replace selected table fragment with a pasted table contents.
   *
   * @private
   * @param evt
   * @param {module:engine/model/documentfragment~DocumentFragment|module:engine/model/item~Item} content The content to insert.
   * @param {module:engine/model/selection~Selectable} [selectable=model.document.selection]
   * The selection into which the content should be inserted. If not provided the current model document selection will be used.
   */
  _onInsertContent(evt, content, selectable) {
    if (selectable && !selectable.is("documentSelection")) {
      return;
    }

    const model = this.editor.model;
    const tableUtils = this.editor.plugins.get(tableutils_TableUtils);

    // We might need to crop table before inserting so reference might change.
    let pastedTable = getTableIfOnlyTableInContent(content, model);

    if (!pastedTable) {
      return;
    }

    const selectedTableCells = getSelectionAffectedTableCells(model.document.selection);

    if (!selectedTableCells.length) {
      removeEmptyRowsColumns(pastedTable, tableUtils);

      return;
    }

    // Override default model.insertContent() handling at this point.
    evt.stop();

    model.change((writer) => {
      const pastedDimensions = {
        width: tableUtils.getColumns(pastedTable),
        height: tableUtils.getRows(pastedTable),
      };

      // Prepare the table for pasting.
      const selection = prepareTableForPasting(
        selectedTableCells,
        pastedDimensions,
        writer,
        tableUtils
      );

      // Beyond this point we operate on a fixed content table with rectangular selection and proper last row/column values.

      const selectionHeight = selection.lastRow - selection.firstRow + 1;
      const selectionWidth = selection.lastColumn - selection.firstColumn + 1;

      // Crop pasted table if:
      // - Pasted table dimensions exceeds selection area.
      // - Pasted table has broken layout (ie some cells sticks out by the table dimensions established by the first and last row).
      //
      // Note: The table dimensions are established by the width of the first row and the total number of rows.
      // It is possible to programmatically create a table that has rows which would have cells anchored beyond first row width but
      // such table will not be created by other editing solutions.
      const cropDimensions = {
        startRow: 0,
        startColumn: 0,
        endRow: Math.min(selectionHeight, pastedDimensions.height) - 1,
        endColumn: Math.min(selectionWidth, pastedDimensions.width) - 1,
      };

      pastedTable = cropTableToDimensions(pastedTable, cropDimensions, writer);

      // Content table to which we insert a pasted table.
      const selectedTable = selectedTableCells[0].findAncestor("table");

      const cellsToSelect = this._replaceSelectedCellsWithPasted(
        pastedTable,
        pastedDimensions,
        selectedTable,
        selection,
        writer
      );

      if (this.editor.plugins.get("TableSelection").isEnabled) {
        // Selection ranges must be sorted because the first and last selection ranges are considered
        // as anchor/focus cell ranges for multi-cell selection.
        const selectionRanges = sortRanges(cellsToSelect.map((cell) => writer.createRangeOn(cell)));

        writer.setSelection(selectionRanges);
      } else {
        // Set selection inside first cell if multi-cell selection is disabled.
        writer.setSelection(cellsToSelect[0], 0);
      }
    });
  }

  /**
   * Replaces the part of selectedTable with pastedTable.
   *
   * @private
   * @param {module:engine/model/element~Element} pastedTable
   * @param {Object} pastedDimensions
   * @param {Number} pastedDimensions.height
   * @param {Number} pastedDimensions.width
   * @param {module:engine/model/element~Element} selectedTable
   * @param {Object} selection
   * @param {Number} selection.firstColumn
   * @param {Number} selection.firstRow
   * @param {Number} selection.lastColumn
   * @param {Number} selection.lastRow
   * @param {module:engine/model/writer~Writer} writer
   * @returns {Array.<module:engine/model/element~Element>}
   */
  _replaceSelectedCellsWithPasted(pastedTable, pastedDimensions, selectedTable, selection, writer) {
    const { width: pastedWidth, height: pastedHeight } = pastedDimensions;

    // Holds two-dimensional array that is addressed by [ row ][ column ] that stores cells anchored at given location.
    const pastedTableLocationMap = createLocationMap(pastedTable, pastedWidth, pastedHeight);

    const selectedTableMap = [
      ...new TableWalker(selectedTable, {
        startRow: selection.firstRow,
        endRow: selection.lastRow,
        startColumn: selection.firstColumn,
        endColumn: selection.lastColumn,
        includeAllSlots: true,
      }),
    ];

    // Selection must be set to pasted cells (some might be removed or new created).
    const cellsToSelect = [];

    // Store next cell insert position.
    let insertPosition;

    // Content table replace cells algorithm iterates over a selected table fragment and:
    //
    // - Removes existing table cells at current slot (location).
    // - Inserts cell from a pasted table for a matched slots.
    //
    // This ensures proper table geometry after the paste
    for (const tableSlot of selectedTableMap) {
      const { row, column } = tableSlot;

      // Save the insert position for current row start.
      if (column === selection.firstColumn) {
        insertPosition = tableSlot.getPositionBefore();
      }

      // Map current table slot location to an pasted table slot location.
      const pastedRow = row - selection.firstRow;
      const pastedColumn = column - selection.firstColumn;
      const pastedCell =
        pastedTableLocationMap[pastedRow % pastedHeight][pastedColumn % pastedWidth];

      // Clone cell to insert (to duplicate its attributes and children).
      // Cloning is required to support repeating pasted table content when inserting to a bigger selection.
      const cellToInsert = pastedCell ? writer.cloneElement(pastedCell) : null;

      // Replace the cell from the current slot with new table cell.
      const newTableCell = this._replaceTableSlotCell(
        tableSlot,
        cellToInsert,
        insertPosition,
        writer
      );

      // The cell was only removed.
      if (!newTableCell) {
        continue;
      }

      // Trim the cell if it's row/col-spans would exceed selection area.
      trimTableCellIfNeeded(
        newTableCell,
        row,
        column,
        selection.lastRow,
        selection.lastColumn,
        writer
      );

      cellsToSelect.push(newTableCell);

      insertPosition = writer.createPositionAfter(newTableCell);
    }

    // If there are any headings, all the cells that overlap from heading must be splitted.
    const headingRows = parseInt(selectedTable.getAttribute("headingRows") || 0);
    const headingColumns = parseInt(selectedTable.getAttribute("headingColumns") || 0);

    const areHeadingRowsIntersectingSelection =
      selection.firstRow < headingRows && headingRows <= selection.lastRow;
    const areHeadingColumnsIntersectingSelection =
      selection.firstColumn < headingColumns && headingColumns <= selection.lastColumn;

    if (areHeadingRowsIntersectingSelection) {
      const columnsLimit = {
        first: selection.firstColumn,
        last: selection.lastColumn,
      };
      const newCells = doHorizontalSplit(
        selectedTable,
        headingRows,
        columnsLimit,
        writer,
        selection.firstRow
      );

      cellsToSelect.push(...newCells);
    }

    if (areHeadingColumnsIntersectingSelection) {
      const rowsLimit = {
        first: selection.firstRow,
        last: selection.lastRow,
      };
      const newCells = doVerticalSplit(selectedTable, headingColumns, rowsLimit, writer);

      cellsToSelect.push(...newCells);
    }

    return cellsToSelect;
  }

  /**
   * Replaces a single table slot.
   *
   * @private
   * @param {module:table/tablewalker~TableSlot} tableSlot
   * @param {module:engine/model/element~Element} cellToInsert
   * @param {module:engine/model/position~Position} insertPosition
   * @param {module:engine/model/writer~Writer} writer
   * @returns {module:engine/model/element~Element|null} Inserted table cell or null if slot should remain empty.
   */
  _replaceTableSlotCell(tableSlot, cellToInsert, insertPosition, writer) {
    const { cell, isAnchor } = tableSlot;

    // If the slot is occupied by a cell in a selected table - remove it.
    // The slot of this cell will be either:
    // - Replaced by a pasted table cell.
    // - Spanned by a previously pasted table cell.
    if (isAnchor) {
      writer.remove(cell);
    }

    // There is no cell to insert (might be spanned by other cell in a pasted table) - advance to the next content table slot.
    if (!cellToInsert) {
      return null;
    }

    writer.insert(cellToInsert, insertPosition);

    return cellToInsert;
  }
}

// CONCATENATED MODULE: ./node_modules/@ckeditor/ckeditor5-table/src/table.js
/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/table
 */

/**
 * The table plugin.
 *
 * For a detailed overview, check the {@glink features/table Table feature documentation}.
 *
 * This is a "glue" plugin that loads the following table features:
 *
 * * {@link module:table/tableediting~TableEditing editing feature},
 * * {@link module:table/tableselection~TableSelection selection feature},
 * * {@link module:table/tablekeyboard~TableKeyboard keyboard navigation feature},
 * * {@link module:table/tablemouse~TableMouse mouse selection feature},
 * * {@link module:table/tableclipboard~TableClipboard clipboard feature},
 * * {@link module:table/tableui~TableUI UI feature}.
 *
 * @extends module:core/plugin~Plugin
 */

export default class table_Table extends plugin_Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [
      tableediting_TableEditing,
      tableui_TableUI,
      tableselection_TableSelection,
      tablemouse_TableMouse,
      tablekeyboard_TableKeyboard,
      tableclipboard_TableClipboard,
      widget_Widget,
    ];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "Table";
  }
}

/**
 * The configuration of the table feature. Used by the table feature in the `@ckeditor/ckeditor5-table` package.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				table: ... // Table feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface TableConfig
 */

/**
 * The configuration of the {@link module:table/table~Table} feature.
 *
 * Read more in {@link module:table/table~TableConfig}.
 *
 * @member {module:table/table~TableConfig} module:core/editor/editorconfig~EditorConfig#table
 */

/**
 * Number of rows and columns to render by default as table heading when inserting new tables.
 *
 * You can configure it like this:
 *
 *		const tableConfig = {
 *			defaultHeadings: {
 *				rows: 1,
 *				columns: 1
 *			}
 *		};
 *
 * Both rows and columns properties are optional defaulting to 0 (no heading).
 *
 * @member {Object} module:table/table~TableConfig#defaultHeadings
 */
