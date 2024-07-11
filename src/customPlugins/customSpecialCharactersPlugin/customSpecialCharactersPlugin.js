import {
  Plugin,
  createDropdown,
} from "../../ckeditor";
import { customSpecialCharactersItems } from "../vars";
import { CharacterGridView, CharacterInfoView, SpecialCharactersNavigationView } from "./csmSpChViews";


const ALL_SPECIAL_CHARACTERS_GROUP = "All";


export class CustomSpecialCharactersPlugin extends Plugin {


  static get pluginName() {
    return "CustomSpecialCharacters";
  }

  /**
   * @inheritDoc
   */
  constructor(editor) {
    super(editor);

    this._characters = new Map();

    this._groups = new Map();
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const t = editor.t;
            const specialcharacters =
            '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.5a7.47 7.47 0 0 1 4.231 1.31 7.268 7.268 0 0 1 2.703 3.454 7.128 7.128 0 0 1 .199 4.353c-.39 1.436-1.475 2.72-2.633 3.677h2.013c0-.226.092-.443.254-.603a.876.876 0 0 1 1.229 0c.163.16.254.377.254.603v.853c0 .209-.078.41-.22.567a.873.873 0 0 1-.547.28l-.101.006h-4.695a.517.517 0 0 1-.516-.518v-1.265c0-.21.128-.398.317-.489a5.601 5.601 0 0 0 2.492-2.371 5.459 5.459 0 0 0 .552-3.693 5.53 5.53 0 0 0-1.955-3.2A5.71 5.71 0 0 0 10 4.206 5.708 5.708 0 0 0 6.419 5.46 5.527 5.527 0 0 0 4.46 8.663a5.457 5.457 0 0 0 .554 3.695 5.6 5.6 0 0 0 2.497 2.37.55.55 0 0 1 .317.49v1.264c0 .286-.23.518-.516.518H2.618a.877.877 0 0 1-.614-.25.845.845 0 0 1-.254-.603v-.853c0-.226.091-.443.254-.603a.876.876 0 0 1 1.228 0c.163.16.255.377.255.603h1.925c-1.158-.958-2.155-2.241-2.545-3.678a7.128 7.128 0 0 1 .199-4.352 7.268 7.268 0 0 1 2.703-3.455A7.475 7.475 0 0 1 10 2.5z"/></svg>';
        

    const inputCommand = editor.commands.get("input");

    // Add the `specialCharacters` dropdown button to feature components.
    editor.ui.componentFactory.add("customSpecialCharacters", (locale) => {
      const dropdownView = createDropdown(locale);
      let dropdownPanelContent;

      dropdownView.buttonView.set({
        label: t("Special characters"),
        icon: specialcharacters,
        tooltip: true,
      });

      dropdownView.bind("isEnabled").to(inputCommand);

      // Insert a special character when a tile was clicked.
      dropdownView.on("execute", (evt, data) => {
        editor.execute("input", { text: data.character });
        editor.editing.view.focus();
      });

      dropdownView.on("change:isOpen", () => {
        if (!dropdownPanelContent) {
          dropdownPanelContent = this._createDropdownPanelContent(
            locale,
            dropdownView
          );

          dropdownView.panelView.children.add(
            dropdownPanelContent.navigationView
          );
          dropdownView.panelView.children.add(
            dropdownPanelContent.gridView
          );
          dropdownView.panelView.children.add(
            dropdownPanelContent.infoView
          );
        }

        dropdownPanelContent.infoView.set({
          character: null,
          name: null,
        });
      });

      return dropdownView;
    });

    if(customSpecialCharactersItems) {
      customSpecialCharactersItems.forEach(el => {
        this.addItems(el.groupName, el.items)
      })
    }

  }

  addItems(groupName, items) {
    if (groupName === ALL_SPECIAL_CHARACTERS_GROUP) {
      throw new Error(`special-character-invalid-group-name: The name "${ALL_SPECIAL_CHARACTERS_GROUP}" is reserved and cannot be used.`);
    }

    const group = this._getGroup(groupName);

    for (const item of items) {
      group.add(item.title);
      this._characters.set(item.title, item.character);
    }
  }

  getGroups() {
    return this._groups.keys();
  }

  getCharactersForGroup(groupName) {
    if (groupName === ALL_SPECIAL_CHARACTERS_GROUP) {
      return new Set(this._characters.keys());
    }

    return this._groups.get(groupName);
  }


  getCharacter(title) {
    return this._characters.get(title);
  }

  _getGroup(groupName) {
    if (!this._groups.has(groupName)) {
      this._groups.set(groupName, new Set());
    }

    return this._groups.get(groupName);
  }

  _updateGrid(currentGroupName, gridView) {
    // Updating the grid starts with removing all tiles belonging to the old group.
    gridView.tiles.clear();

    const characterTitles =
      this.getCharactersForGroup(currentGroupName);

    for (const title of characterTitles) {
      const character = this.getCharacter(title);

      gridView.tiles.add(gridView.createTile(character, title));
    }
  }

  _createDropdownPanelContent(locale, dropdownView) {
    const specialCharsGroups = [...this.getGroups()];
    // Add a special group that shows all available special characters.
    specialCharsGroups.unshift(ALL_SPECIAL_CHARACTERS_GROUP);

    const navigationView =
      new SpecialCharactersNavigationView(
        locale,
        specialCharsGroups
      );
    const gridView = new CharacterGridView(locale);
    const infoView = new CharacterInfoView(locale);

    gridView.delegate("execute").to(dropdownView);

    gridView.on("tileHover", (evt, data) => {
      infoView.set(data);
    });

    // Update the grid of special characters when a user changed the character group.
    navigationView.on("execute", () => {
      this._updateGrid(navigationView.currentGroupName, gridView);
    });

    // Set the initial content of the special characters grid.
    this._updateGrid(navigationView.currentGroupName, gridView);

    return { navigationView, gridView, infoView };
  }
}
