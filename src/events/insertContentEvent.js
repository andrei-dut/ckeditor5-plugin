import WidgetResize from "@ckeditor/ckeditor5-widget/src/widgetresize";

export async function insertContentEvent(editor) {
  editor.model.on("insertContent", (event, [modelElement]) => {

    const registerResizer = async () => {
      const mapper = editor.editing.mapper;
      const domConverter = editor.editing.view.domConverter;
      let viewElement = mapper.toViewElement(modelElement);
      const isNameIcon = modelElement.name === 'icon';
      const isSvgRoughness =  modelElement.getAttribute ? modelElement.getAttribute("data-key") === "svg-roughness" : null;

      if(!viewElement && !(isNameIcon && isSvgRoughness)) return

      let attempts = 0;
      const maxAttempts = 100;

      while (!viewElement && attempts < maxAttempts) {

        await new Promise((resolve) =>
          setTimeout(() => {
            viewElement = mapper.toViewElement(modelElement);
            attempts++;
            resolve();
          }, attempts < 20 ? 10 : 200)
        );
      }

      // console.log(viewElement, modelElement);

      // const parentView = viewElement.parent;

      // if(parentView) {
      //   parentView._setStyle( 'display', 'flex' );       
      //   parentView._setStyle( 'align-items', 'center' );       
      // }

      
      if(modelElement.parent) {

        console.log(4, modelElement.parent, modelElement.parent.getStyle?.('display'));
        
      }

      const resizer = editor.plugins.get(WidgetResize).attachTo({
        modelElement,
        viewElement,
        editor,
        unit: "px",
        getHandleHost(domWidgetElement) {
          return domWidgetElement;
        },
        getResizeHost() {
          console.log("getResizeHost");
          // Return the model image element parent to avoid setting an inline element (<a>/<span>) as a resize host.
          return domConverter.mapViewToDom(
            mapper.toViewElement(modelElement.parent)
          );
        },
        // TODO consider other positions.
        isCentered() {
          return false;
        },

        onCommit(newValue) {
          editor.model.change((writer) => {
            const model = editor.model;
            const selection = model.document.selection;

            const selectedElement = selection.getSelectedElement();
            if (selectedElement.name === "icon") {
              writer.setAttribute("resizedWidth", newValue, selectedElement);
            }
          });

          // editor.execute( 'resizeImage', { width: newValue } );
        },
      });
      resizer.bind( 'isEnabled' ).to( this );
    };

    registerResizer();
  }, { priority: "highest" });
}
