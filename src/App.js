import React, { Component, findDOMNode } from 'react'

export default class App extends Component {
  render() {
    return (
      <div>
        Hello world!
      </div>
    )
  }
}


let anAction =  { type: "Something happened!", payload: "I said hello"}

import { createStore } from 'redux';

function exampleReducer (initialState = {}, action = {}) {
  switch (action.type) {
    case 'Something happened!':
      console.log(action.payload)
      return initialState.something = action.payload
    default:
      return initialState
  }
}
let store = createStore(exampleReducer);
store.dispatch(anAction)