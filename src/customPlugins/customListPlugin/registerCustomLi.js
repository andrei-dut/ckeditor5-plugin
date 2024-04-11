import { toWidgetEditable } from "../../ckeditor";

const elementName = "paragraphLi";

function createParagraphLi(data, { writer }) {
  console.log("createParagraphLi", data, { writer });


  const div = writer.createEditableElement( 'div', { class: 'nested' } );

  const _widget = toWidgetEditable( div, writer, { label: 'label for editable' } );

  const _p =   writer.createContainerElement( 'p', { class: 'test' }, [
    _widget
    // writer.createContainerElement( 'span', { class: 'li-number' }, { renderUnsafeAttributes: [ 'foo' ] } ),
    
    // writer.createContainerElement( 'span', { class: 'content' }, { renderUnsafeAttributes: [ 'foo' ] } ),

  ] );


  // writer.createContainerElement( 'p', { class: 'foo bar baz' } );

  // Create element with specific options.

  // if (data && data.text) {
  //   writer.insertText(data.text, _p);
  // }

  // writer.setCustomProperty("customLink", true, linkElement);

  // return _p;
  return _widget;

  // const div = writer.createEditableElement( 'div', { class: 'nested' } );

  // return toWidgetEditable( div, writer, { label: 'label for editable' } );

}

export function registerCustomLi(editor) {


    if (!editor.model.schema.isRegistered(elementName)) {
        editor.model.schema.register(elementName, {
            isObject: true,
            // isInline: true,
            allowWhere: "$text",
            allowChildren: ["$text"],
            allowAttributes: ["data-key", "data-name", "data-icon", "resizedWidth"],
          });
    }

    editor.conversion.for("dataDowncast").elementToElement({
      model: elementName,
      // view: createParagraphLi,
      view: ( modelItem, { writer } ) => {
        return writer.createContainerElement( 'div', { class: 'nested', contenteditable: false } );
      }
    });
  

    editor.conversion.for("editingDowncast").elementToElement({
      model: elementName,
      view: (data, conversionApi) => {
        console.log(data);
        return createParagraphLi(
          {  },
          conversionApi
        );
      },
    });

    editor.conversion.for("upcast").elementToElement({
      view: {
        name: "a",
        attributes: {
          href: true,
        },
      },
      model: {
        key: elementName,
        value: (viewElement) => {
          const href = viewElement.getAttribute("href");
          const _text = viewElement.getAttribute("data-text");
  
          const text =
            viewElement.getChildren()?.find?.((el) => el.data)?.data || _text ||  href;
  
          return { href, text };
        },
      },
      converterPriority: "high",
    });

    


  


}

  
