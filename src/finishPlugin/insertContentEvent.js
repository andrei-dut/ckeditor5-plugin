
export async function insertContentEvent(editor) {
  editor.model.on(
    "insertContent",
    (event, [modelElement]) => {

      const registerResizer = async () => {
        const mapper = editor.editing.mapper;
        const domConverter = editor.editing.view.domConverter;
        let viewElement = mapper.toViewElement(modelElement);
        const isNameIcon = modelElement.name === "iconSvg";
        const key = modelElement.getAttribute && modelElement.getAttribute("data-key")
        const isSvgRoughness = key === "svg-roughness" || key === "symbol";

        let attempts = 0;
        let intervalId;
        if (!viewElement && !(isNameIcon && isSvgRoughness)) return;

        try {
console.log(modelElement);
        await new Promise(
          (resolve, reject) =>
            (intervalId = setInterval(
              () => {
                viewElement = mapper.toViewElement(modelElement);
                attempts++;
                if(attempts > 100) reject('Not found viewElement');
                if(viewElement) resolve();
              },
              attempts < 20 ? 10 : 200
            ))
        );
        clearInterval(intervalId);


        // const parentView = viewElement.parent;

        // if(parentView) {
        //   parentView._setStyle( 'display', 'flex' );
        //   parentView._setStyle( 'align-items', 'center' );
        // }

        // if (modelElement.parent) {
        //   console.log(
        //     4,
        //     modelElement.parent,
        //     modelElement.parent.getStyle.("display")
        //   );
        // }

        if (!viewElement) return;
 console.log('WidgetResize',editor.plugins.get("WidgetResize"));
        const resizer = editor.plugins.get("WidgetResize").attachTo({
          modelElement,
          viewElement,
          editor,
          unit: "px",
          getHandleHost(domWidgetElement) {
            return domWidgetElement;
          },
          getResizeHost() {
            const parent = modelElement.parent;
            const parEl  = mapper.toViewElement(parent);
            return domConverter.mapViewToDom(parEl);
          },
          isCentered() {
            return false;
          },

          onCommit(newValue) {
            editor.model.change((writer) => {
              const model = editor.model;
              const selection = model.document.selection;

              const selectedElement = selection.getSelectedElement();
              if (selectedElement?.name === "iconSvg") {
                writer.setAttribute("resizedWidth", newValue, selectedElement);
              }
            });

            // editor.execute( 'resizeImage', { width: newValue } );
          },
        });
        resizer.bind("isEnabled").to(this);
      } catch (error) {
        clearInterval(intervalId);
          console.log(error);
      }

      };

      registerResizer();
    },
    { priority: "highest" }
  );
}
