import writeGood from "write-good";
import uuid from "uuid/v4";

const flatten = arrayOfArrays => [].concat.apply([], arrayOfArrays);

export const analyze = textElements => {
  const analyzers = [runWriteGood];

  const suggestions = flatten(
    analyzers.map(analyzer => analyzer(textElements)).filter(s => s.length > 0)
  );

  return Promise.all(suggestions).then(suggestions => {
    return {
      suggestions: suggestions,
    };
  });
};

const createSuggestion = (
  {
    id,
    description,
    context,
    startIndex,
    endIndex,
    element,
    replacement,
    color,
  }
) => {
  return {
    id,
    description,
    context,
    startIndex,
    endIndex,
    element,
    replacement,
    color,
  };
};

const runWriteGood = textElements => {
  return flatten(
    textElements.map(element => {
      const results = writeGood(element.text);
      return results.map(result => {
        return Promise.resolve(
          createSuggestion({
            id: uuid(),
            description: result.reason,
            context: element.text,
            startIndex: result.index,
            endIndex: result.index + result.offset,
            element: element,
            replacement: null,
            color: "#ff0000",
          })
        );
      });
    })
  );
};
