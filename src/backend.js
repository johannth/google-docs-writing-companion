/* global Logger:false DocumentApp:false HtmlService:false */
/* exported onInstall */

// eslint-next
const onOpen = e => {
  Logger.log("onOpen");
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem("Open", "showSidebar")
    .addToUi();
};

const onInstall = e => {
  Logger.log("onInstall");
  onOpen(e);
};

const showSidebar = () => {
  const ui = HtmlService.createHtmlOutputFromFile("Sidebar").setTitle(
    "Writing Companion"
  );
  DocumentApp.getUi().showSidebar(ui);
};

const focusOnElement = elementId => {
  const activeDocument = DocumentApp.getActiveDocument();
  const namedRange = activeDocument.getNamedRangeById(elementId);
  const elements = namedRange.getRange().getRangeElements();
  const element = elements[0].getElement();
  const position = activeDocument.newPosition(element, 0);
  activeDocument.setCursor(position); // Should probably rather use setSelection

  return { success: true };
};

const fixFromSuggestion = (elementId, startIndex, endIndex, replacement) => {
  const activeDocument = DocumentApp.getActiveDocument();
  const namedRange = activeDocument.getNamedRangeById(elementId);
  const elements = namedRange.getRange().getRangeElements();
  const element = elements[0].getElement();

  element.deleteText(startIndex, endIndex - 1);
  element.insertText(startIndex, replacement);

  return { success: true };
};

const clearHighlightedSuggestions = () => {
  const activeDocument = DocumentApp.getActiveDocument();
  const previousHighlights = activeDocument.getNamedRanges("suggestion");
  previousHighlights.forEach(namedRangeForHighlight => {
    Logger.log(namedRangeForHighlight);
    namedRangeForHighlight
      .getRange()
      .getRangeElements()
      .map(e => e.getElement())
      .forEach(element => {
        const attributes = {};
        attributes[DocumentApp.Attribute.BACKGROUND_COLOR] = null;

        element.setAttributes(attributes);
      });
    namedRangeForHighlight.remove();
  });
};

const highlightSuggestions = highlights => {
  const activeDocument = DocumentApp.getActiveDocument();

  clearHighlightedSuggestions();

  highlights.forEach(({ elementId, startIndex, endIndex, color }) => {
    const namedRange = activeDocument.getNamedRangeById(elementId);
    if (!namedRange) {
      return;
    }

    const elements = namedRange.getRange().getRangeElements();
    const element = elements[0].getElement();

    const attributes = {};
    attributes[DocumentApp.Attribute.BACKGROUND_COLOR] = color;

    element.setAttributes(startIndex, endIndex - 1, attributes);

    const rangeBuilder = activeDocument.newRange();
    rangeBuilder.addElement(element, startIndex, endIndex - 1);
    activeDocument.addNamedRange("suggestion", rangeBuilder.build());
  });

  return { success: true };
};

const getDocument = () => {
  const activeDocument = DocumentApp.getActiveDocument();
  const body = activeDocument.getBody();

  const tree = extractTree(body);
  const flatTree = flattenTree(tree);
  const onlyTextElements = flatTree.filter(
    e => e.getType() === DocumentApp.ElementType.TEXT
  );

  const elementsWithIds = addIdsToElements(activeDocument, onlyTextElements);
  return { document: elementsWithIds.map(serializeElement) };
};

const addIdsToElements = (activeDocument, elements) => {
  return elements.map(element => {
    const rangeBuilder = activeDocument.newRange();
    rangeBuilder.addElement(element);

    const namedRange = activeDocument.addNamedRange(
      "element",
      rangeBuilder.build()
    );
    const namedRangeId = namedRange.getId();
    return { id: namedRangeId, element };
  });
};

const typeToString = type => {
  switch (type) {
    case DocumentApp.ElementType.BODY_SECTION:
      return "bodySection";
    case DocumentApp.ElementType.PARAGRAPH:
      return "paragraph";
    case DocumentApp.ElementType.TEXT:
      return "text";
    default:
      return "unknown";
  }
};

const extractText = element => {
  switch (element.getType()) {
    case DocumentApp.ElementType.TEXT:
      return element.getText();
    default:
      return null;
  }
};

const serializeElement = ({ id, element }) => {
  const type = typeToString(element.getType());
  const attributes = element.getAttributes();
  const node = {
    id,
    type,
    attributes,
  };

  const text = extractText(element);
  if (text) {
    node.text = text;
  }
  return node;
};

const extractTree = element => {
  const node = {
    element: element,
  };
  if (element.getNumChildren) {
    const numChildren = element.getNumChildren();

    const children = [];

    for (var i = 0; i != numChildren; i++) {
      const child = element.getChild(i);
      const childNode = extractTree(child);

      children.push(childNode);
    }

    node["children"] = children;
  }

  return node;
};

const flattenArrayOfArrays = arrayOfArrays =>
  arrayOfArrays.reduce((accumulator, current) => accumulator.concat(current), [
  ]);

const flattenTree = node => {
  var list = [node.element];

  if (node.children) {
    const flattenedChildren = flattenArrayOfArrays(
      node.children.map(flattenTree)
    );

    list = list.concat(flattenedChildren);
  }

  return list;
};
