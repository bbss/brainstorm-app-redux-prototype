import React, { Component, findDOMNode } from 'react'
import { store } from './index'
import { connect } from 'react-redux'

@connect((state) => ({
  state: state
}))
export default class App extends Component {
  render() {
    const { state } = this.props
    return (
      <div>
        {state}
        Hello world!
      </div>
    )
  }
}


let anAction =  { type: "Something happened!", payload: "I said hello"}

export function exampleReducer (initialState = {}, action = {}) {
  switch (action.type) {
    case 'Something happened!':
      console.log(action.payload)
      return initialState.something = action.payload
    default:
      return initialState
  }
}
