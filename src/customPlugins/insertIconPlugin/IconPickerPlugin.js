// iconPickerPlugin.js

import {
  ButtonView,
  Plugin,
  addToolbarToDropdown,
  createDropdown,
} from "../../reqCkeditor.service";
import { showModal } from "./roughnessModal";
import { emitter } from "../utils";
import InsertIconCommand from "./InsertIconCommand";
import "../styles/styles.css";
import { insertIconList } from "./iconLists";
import { showBaseModal } from "./complexSvgModal";
import { insertSymbol } from "../icons/insertSymbols";
// import IconPlugin from "../iconPlugin/IconPlugin";

export class IconPickerPlugin extends Plugin {
  static get pluginName() {
    return "IconPickerPlugin";
  }

  init() {
    const editor = this.editor;

    const schema = editor.model.schema;

    // Расширение элемента imageInline для поддержки новых атрибутов
    schema.extend( 'imageInline', {
        allowAttributes: [ "data-json", "id", "data-id"]
    } );

    this._setupConversion();

    editor.commands.add("insertIcon", new InsertIconCommand(editor));
    editor.ui.componentFactory.add("iconPickerButton", (locale) => {
      const command = editor.commands.get("insertIcon");
      const buttons = insertIconList.map((icon) => {
        const listItem = new ButtonView();

        listItem.set({
          label: icon.label,
          icon: icon.icon,
          class: icon.iconName
        });

        function insertIconFc(svgEl, iconName, svgValues) {
          const insertIconCmd = editor.commands.get("insertIcon");

          if (insertIconCmd) {
            insertIconCmd.execute({
                    iconName,
                    icon: svgEl,
                    svgValues,
                  }
            );
          }
          editor.editing.view.focus();
          emitter.off("insertIcon", insertIconFc);
        }

        listItem.on("execute", () => {
          if (icon.isRoughness) {
            showModal();
          } else if (icon.isComplexSymbol) {
            showBaseModal(icon.icon, icon.iconName);
          } else {
            insertIconFc(icon.icon, icon.iconName);
            return;
          }
          emitter.on("insertIcon", insertIconFc);
          // dropdown.hide();
        });
        listItem.delegate("execute").to(editor, "lala");
        return listItem;
      });

      const toolbarDropdown = createDropdown(locale);
      toolbarDropdown.buttonView.set({
        icon: insertSymbol,
        class: "icon-picker-button",
      });
      toolbarDropdown.class = "toolbar-insert-symbol";
      addToolbarToDropdown(toolbarDropdown, buttons);
      //   toolbarDropdown.render();
      toolbarDropdown.bind("isOn", "isEnabled").to(command, "value", "isEnabled");
      return toolbarDropdown;
    });
  }

  _setupConversion() {
		const editor = this.editor;
		const t = editor.t;
		const conversion = editor.conversion;
		const imageUtils = editor.plugins.get( 'ImageUtils' );

    function createImageViewElement(writer, imageType, modelElement) {
      const emptyElement = writer.createEmptyElement("img");
      const id = modelElement ? modelElement.getAttribute('data-id') || modelElement.getAttribute('id') : undefined;
      const container =
        imageType === "imageBlock"
          ? writer.createContainerElement("figure", { class: "image" })
          : writer.createContainerElement(
              "span",
              { class: "image-inline", id },
              { isAllowedInsideAttributeElement: true }
            );

      writer.insert(writer.createPositionAt(container, 0), emptyElement);

      return container;
    }

    function downcastImageAttribute(imageUtils, imageType, attributeKey) {
      return (dispatcher) => {
        dispatcher.on(`attribute:${attributeKey}:${imageType}`, converter);
      };

      function converter(evt, data, conversionApi) {
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
          return;
        }

        const viewWriter = conversionApi.writer;
        const element = conversionApi.mapper.toViewElement(data.item);
        const img = imageUtils.findViewImgElement(element);

        viewWriter.setAttribute(
          data.attributeKey,
          data.attributeNewValue || "",
          img
        );
      }
    }

    function downcastSrcsetAttribute( imageUtils, imageType ) {
      return dispatcher => {
        dispatcher.on( `attribute:srcset:${ imageType }`, converter );
      };
    
      function converter( evt, data, conversionApi ) {
        if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
          return;
        }
    
        const writer = conversionApi.writer;
        const element = conversionApi.mapper.toViewElement( data.item );
        const img = imageUtils.findViewImgElement( element );
    
        if ( data.attributeNewValue === null ) {
          const srcset = data.attributeOldValue;
    
          if ( srcset.data ) {
            writer.removeAttribute( 'srcset', img );
            writer.removeAttribute( 'sizes', img );
    
            if ( srcset.width ) {
              writer.removeAttribute( 'width', img );
            }
          }
        } else {
          const srcset = data.attributeNewValue;
    
          if ( srcset.data ) {
            writer.setAttribute( 'srcset', srcset.data, img );
            // Always outputting `100vw`. See https://github.com/ckeditor/ckeditor5-image/issues/2.
            writer.setAttribute( 'sizes', '100vw', img );
    
            if ( srcset.width ) {
              writer.setAttribute( 'width', srcset.width, img );
            }
          }
        }
      }
    }

    function getImgViewElementMatcher( editor, matchImageType ) {
      if ( editor.plugins.has( 'ImageInlineEditing' ) !== editor.plugins.has( 'ImageBlockEditing' ) ) {
        return {
          name: 'img',
          attributes: {
            src: true
          }
        };
      }
    
      const imageUtils = editor.plugins.get( 'ImageUtils' );
    
      return element => {
        // Convert only images with src attribute.
        if ( !imageUtils.isInlineImageView( element ) || !element.hasAttribute( 'src' ) ) {
          return null;
        }
    
        // The <img> can be standalone, wrapped in <figure>...</figure> (ImageBlock plugin) or
        // wrapped in <figure><a>...</a></figure> (LinkImage plugin).
        const imageType = element.findAncestor( imageUtils.isBlockImageView ) ? 'imageBlock' : 'imageInline';
    
        if ( imageType !== matchImageType ) {
          return null;
        }
    
        return { name: true, attributes: [ 'src' ] };
      };
    }

		conversion.for( 'dataDowncast' )
			.elementToElement( {
				model: 'imageInline',
				view: ( modelElement, { writer } ) => writer.createEmptyElement( 'img' )
			} );

      conversion.for("editingDowncast").elementToElement({
        model: "imageInline",
        view: (modelElement, { writer }) =>
          imageUtils.toImageWidget(
            createImageViewElement(writer, "imageInline", modelElement),
            writer,
            t("image widget")
          ),
      });

		conversion.for( 'downcast' )
      .add(downcastImageAttribute(imageUtils, "imageInline", "data-id"))
    .add(downcastImageAttribute(imageUtils, "imageInline", "src"))
    .add(downcastImageAttribute(imageUtils, "imageInline", "alt"))
    .add(downcastImageAttribute(imageUtils, "imageInline", "data-json"))
			.add( downcastSrcsetAttribute( imageUtils, 'imageInline' ) );

		// More image related upcasts are in 'ImageEditing' plugin.
            conversion.for("upcast").elementToElement({
              view: getImgViewElementMatcher(editor, "imageInline"),
              model: (viewImage, { writer }) =>
                writer.createElement("imageInline", {
                  src: viewImage.getAttribute("src"),
                  "data-json": viewImage.getAttribute("data-json"),
                  "data-id": viewImage.getAttribute("data-id"),
                }),
            });
	}
}
