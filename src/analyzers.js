const flatten = arrayOfArrays => [].concat.apply([], arrayOfArrays);

export const analyze = textElements => {
  const analyzers = [randomSuggestions];

  const suggestions = flatten(
    analyzers.map(analyzer => analyzer(textElements))
  );

  return Promise.resolve({
    suggestions: suggestions,
  });
};

const createSuggestion = (
  { id, description, context, startIndex, endIndex, replacement, color }
) => {
  return { id, description, context, startIndex, endIndex, replacement, color };
};

const randomSubset = (arr, size) => {
  const shuffled = arr.slice(0);
  var i = arr.length;
  var temp;
  var index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
};

const randomSuggestions = textElements => {
  const randomTextElements = randomSubset(textElements, 5);
  return randomTextElements.map((element, i) => {
    const randomStartIndex = Math.floor(Math.random() * element.text.length);
    const randomEndIndex = Math.min(randomStartIndex + 15, element.text.length);

    return createSuggestion({
      id: i,
      description: "You should delete this part",
      context: element.text,
      startIndex: randomStartIndex,
      endIndex: randomEndIndex,
      element: element,
      replacement: "",
      color: "#ff0000",
    });
  });
};
