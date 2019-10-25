let inputType = {
    value: "value",
    range: "range",
    array: "array"
}

function createToolbox(paramsSchema) {
    let keys = Object.keys(paramsSchema);
    let fields = keys.map(k => createFieldHtml(
        createLabelHtml(k),
        createInputHtml(k, paramsSchema[k])
    ));

    let toolbox = createToolbox(fields);

    return toolbox;

    function createInputHtml(key, paramSchema) {        
        switch(paramSchema.type) {
            case inputType.value:
                return `<input type="number" name="${key}">`;
            case inputType.range:
                return `<input type="range" min="${paramSchema.min}" max="${paramSchema.max}" name="${key}">`;
            case inputType.array:
                return `
                    <span data-arr=${key}>${createInputHtml(key, paramSchema.arrElement)}</span>
                    <input type="button" value="+" name="add-arr-el" data-key="${key}">
                    <input type="button" value="-" name="remove-arr-el" data-key="${key}">`
        }
    }

    function createLabelHtml(key) {
        // split by camel style
        let name = key
            .split(/([A-Z][a-z]+)/)
            .join(' ');

        // make first letter upper case
        name = name.substring(0, 1).toUpperCase() + name.substring(1, name.length); 

        return `<label>${name}:</lable>`;
    }

    function createFieldHtml(labelHtml, inputHtml) {        
        let wrapperHtml = `${labelHtml}<br>${inputHtml}<br>`;

        return wrapperHtml;
    }

    function createToolbox(fields) {
        let element = document.createElement("div");

        element.style = "position: fixed";
        element.innerHTML = `<fieldset> ${fields.join('')} </fieldset>`;

        return element;
    }
}