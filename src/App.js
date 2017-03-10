/* global google:false */

import React, { Component } from 'react';
import './App.css';
import { exampleDocument } from './exampleDocument';

const getDocument = () => {
  return new Promise(function(resolve, reject) {
    if (process.env.NODE_ENV === 'production') {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .getDocument();
    } else {
      resolve(exampleDocument);
    }
  });
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

const analyze = textElements => {
  const randomTextElements = randomSubset(textElements, 5);
  const randomNonsensicalSuggestions = randomTextElements.map((element, i) => {
    return {
      id: i,
      description: 'You should delete this sentence',
      context: element.text,
      element: element
    };
  });

  return Promise.resolve({
    suggestions: randomNonsensicalSuggestions
  });
};

const printElement = prefix => element => {
  if (element.text) {
    console.log(prefix, element.id, element.type, element.text);
  } else {
    console.log(prefix, element.id, element.type);
  }
};

const runAnalysis = () => {
  return getDocument()
    .then(document => {
      console.log(JSON.stringify(document));
      return analyze(document.document);
    })
    .catch(error => {
      alert(error);
    });
};

const focusOnElement = element => {
  return new Promise(function(resolve, reject) {
    if (process.env.NODE_ENV === 'production') {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)
        .focusOnElement(element.id);
    } else {
      resolve({ success: true });
    }
  });
};

const Suggestion = (handleLinkTo, handleFixIt) => suggestion => {
  return (
    <div key={suggestion.id}>
      <p>{suggestion.description}</p>
      <p>
        <a onClick={() => handleLinkTo(suggestion.id)}>{suggestion.context}</a>
      </p>
      <p><a onClick={() => handleFixIt(suggestion.id)}>Fix it!</a></p>
    </div>
  );
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      analysis: null
    };

    this.handleAnalyzeButtonPress = this.handleAnalyzeButtonPress.bind(this);
    this.handleFixIt = this.handleFixIt.bind(this);
    this.handleLinkTo = this.handleLinkTo.bind(this);
  }

  getSuggestion(suggestionId) {
    return this.state.analysis &&
      this.state.analysis.suggestions.filter(s => s.id === suggestionId)[0];
  }

  handleFixIt(suggestionId) {
    console.log('handleFixIt', suggestionId);
  }

  handleLinkTo(suggestionId) {
    const suggestion = this.getSuggestion(suggestionId);
    console.log(suggestion);

    focusOnElement(suggestion.element).then(result => {
      console.log(result);
    });
  }

  handleAnalyzeButtonPress() {
    runAnalysis().then(result => {
      this.setState({ analysis: result });
    });
  }

  render() {
    const suggestions = this.state.analysis &&
      this.state.analysis.suggestions || [];
    return (
      <div className="sidebar">
        <div id="suggestions">
          {suggestions.map(Suggestion(this.handleLinkTo, this.handleFixIt))}
        </div>
        <div className="block" id="button-bar">
          <button onClick={this.handleAnalyzeButtonPress}>Analyze</button>
        </div>
      </div>
    );
  }
}

export default App;
