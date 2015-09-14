import React from 'react'
import App from './App'
import { exampleReducer } from './App'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

let store = createStore(exampleReducer)
exports.store = store
React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  document.getElementById('root'))
