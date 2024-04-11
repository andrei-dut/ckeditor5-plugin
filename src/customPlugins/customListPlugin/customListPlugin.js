import { ButtonView, Plugin } from "../../ckeditor";
import { registerCustomLi } from "./registerCustomLi";



export default class CustomListPlugin extends Plugin {
    init() {

        const editor = this.editor;
        registerCustomLi(editor)

        // let paragraphCounter = 1;

        editor.ui.componentFactory.add('customList', locale => {
            const button = new ButtonView(locale);

            button.set({
                label: 'Numbered List',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 7H6V5H4V7ZM4 11H6V9H4V11ZM4 15H6V13H4V15ZM10 5V7H20V5H10ZM10 9V11H20V9H10ZM10 13V15H20V13H10ZM6 19V17H4V19H6ZM8 17H18V19H8V17ZM22 3V21H2V3H22Z"/></svg>',
                tooltip: true
            });

            button.on('execute', () => {
                const model = this.editor.model;
                const selection = model.document.selection;
                editor.model.change(writer => {
                    // const position = selection.getFirstPosition();
                    const paragraph = writer.createElement('paragraphLi');

                    // Создание первого спана для номера параграфа
                    // const numberSpan = writer.createContainerElement( 'span', { class: 'placeholder' }, { renderUnsafeAttributes: [ 'foo' ] } );
                    // writer.setAttribute('data-paragraph-number', paragraphCounter.toString(), numberSpan);
                    // writer.insertText(paragraphCounter.toString(), numberSpan);

                    // // Создание второго спана для содержимого параграфа
                    // const contentSpan = writer.createElement('span');
                    // writer.insertText(' ', contentSpan);

                    // writer.append(numberSpan, paragraph);
                    // writer.append(contentSpan, paragraph);
                    // writer.append(paragraph, position);

console.log(paragraph);

      model.insertContent(paragraph, selection);


                    // paragraphCounter++;
                });
            });

            return button;
        });
    }
}
