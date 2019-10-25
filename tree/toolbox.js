let inputType = {
    value: "value",
    range: "range",
    array: "array"
}

function populateValues(toolbox, schema, values) {
    let keys = Object.keys(schema);

    for(let key of keys) {
        populateValue(toolbox, schema[key], key, initialValues[key]);
    }
}

function populateValue(toolbox, schema, key, value) {
    switch(schema.type) {
        case inputType.value:
            toolbox.querySelector(`[name=${key}]`).value = value;
            break;
        
        case inputType.array:
            let container = toolbox.querySelector(`[data-arr=${key}]`);
            let elementValues = value;
            let inputsHtml = elementValues.map((_, index) => createInputHtml(key + index, schema.elementSchema)).join('');

            container.innerHTML = inputsHtml;

            elementValues.forEach((val, index) => populateValue(toolbox, schema.elementSchema, key + index, val));

            break;
        
        case inputType.range:
    }
}

function createInputHtml(key, paramSchema) {        
    switch(paramSchema.type) {
        case inputType.value:
            return `<input type="number" name="${key}">`;
        case inputType.range:
            return `<input type="range" min="${paramSchema.min}" max="${paramSchema.max}" name="${key}">`;
        case inputType.array:
            return `
                <span data-arr=${key}></span>
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

    return `<label>${name}:</label>`;
}

function createFieldHtml(labelHtml, inputHtml) {        
    let wrapperHtml = `${labelHtml}<br>${inputHtml}<br>`;

    return wrapperHtml;
}

function createToolboxElement(fields) {
    let element = document.createElement("div");

    element.style = "position: fixed";
    element.innerHTML = `<fieldset> ${fields.join('')} </fieldset>`;

    return element;
}

function createToolbox(schema, initialValues, onUpdate) {
    let fieldsHtml = Object.keys(schema).map(k => createFieldHtml(
        createLabelHtml(k),
        createInputHtml(k, schema[k])
    ));

    let toolbox = createToolboxElement(fieldsHtml);

    populateValues(toolbox, schema, initialValues);

    return toolbox;
}