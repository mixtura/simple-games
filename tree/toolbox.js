let inputType = {
  value: "value",
  range: "range",
  array: "array",
  checkbox: "checkbox"
}

function constructValue(toolbox, type, key) {
  switch(type) {
    case inputType.value:
      return Number.parseFloat(toolbox.querySelector(`[name="${key}"]`).value);
    
    case inputType.array:
      return Array
        .from(toolbox.querySelectorAll(`[name~="${key}"]`))
        .map(el => constructValue(toolbox, inputType.value, el.getAttribute("name")));
    
    case inputType.checkbox:
      return !!toolbox.querySelector(`[name="${key}"`).checked;

    case inputType.range:
      return {};
  }
}

function constructValues(toolbox, schema) {
  let values = {};
  
  Object
    .keys(schema)
    .forEach(k => values[k] = constructValue(toolbox, schema[k], k));

  return values;
}

function populateValues(toolbox, schema, values) {
  let keys = Object.keys(schema);

  for(let key of keys) {
    populateValue(toolbox, schema[key], key, values[key]);
  }
}

function populateValue(toolbox, type, key, value) {
  switch(type) {
    case inputType.value:
      toolbox.querySelector(`[name="${key}"]`).value = value;
      break;
    
    case inputType.array:
      let container = toolbox.querySelector(`[data-arr="${key}"]`);
      let elementValues = value;
      let inputsHtml = elementValues.map((_, index) => 
        createInputHtml(`${key} ${index}`, inputType.value)).join('');

      container.innerHTML = inputsHtml;

      elementValues.forEach((val, index) => 
        populateValue(toolbox, inputType.value, `${key} ${index}`, val));

      break;
    
    case inputType.checkbox:
      toolbox.querySelector(`[name="${key}"]`).checked = value;
      break;

    case inputType.range:
      break;
  }
}

function createInputHtml(key, type, data) {    
  switch(type) {
    case inputType.value:
      return `<input type="number" name="${key}" step="0.1">`;
    case inputType.range:
      return `<input type="range" min="${data.min}" max="${data.max}" name="${key}">`;
    case inputType.checkbox:
      return `<input type="checkbox" name="${key}">`;
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

function createToolboxElement(schema) {
  let refreshButtonHtml = "<input type='button' value='Refresh' name='refresh'>";
  let fieldsHtml = Object
    .keys(schema)
    .map(k => `
      ${createLabelHtml(k)}<br>
      ${createInputHtml(k, schema[k])}<br>`)
    .join('');

  let toolboxEl = document.createElement("div");

  toolboxEl.style = "position: fixed";
  toolboxEl.innerHTML = `<fieldset> ${fieldsHtml} </fieldset> ${refreshButtonHtml}`;
  
  return toolboxEl;
}

function bindEvents(toolbox, onValuesChange) {
  toolbox.addEventListener("change", onValuesChange);
  toolbox.querySelector("[name=refresh]").addEventListener("click", onValuesChange);

  Array
    .from(toolbox.querySelectorAll("[name=remove-arr-el]"))
    .forEach(el => el.addEventListener("click", () => {
      let container = toolbox.querySelector(`[data-arr='${el.getAttribute("data-key")}']`);
      let elToRemove = container.children[container.children.length - 1];

      container.removeChild(elToRemove);

      onValuesChange();
    }));

  Array
    .from(toolbox.querySelectorAll("[name=add-arr-el]"))
    .forEach(el => el.addEventListener("click", () => {
      let container = toolbox.querySelector(`[data-arr='${el.getAttribute("data-key")}']`);
      let elToAdd = container.children[container.children.length - 1].cloneNode();

      let attr = elToAdd.getAttribute("name").split(' ');
      let name = attr[0];
      let index = Number.parseInt(attr[1]);

      elToAdd.setAttribute("name", `${name} ${index + 1}`);

      container.appendChild(elToAdd.cloneNode());

      onValuesChange();
    }));
}

function createToolbox(schema, initialValues, onUpdate) {
  let toolbox = createToolboxElement(schema);

  populateValues(toolbox, schema, initialValues);

  let onValuesChange = () => onUpdate(constructValues(toolbox, schema)); 

  bindEvents(toolbox, onValuesChange);

  onValuesChange();

  return toolbox;
}