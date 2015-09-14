import React, { Component, findDOMNode } from 'react'
import { store } from './index'
import { connect } from 'react-redux'
import immutable, { Map } from 'immutable'


@connect((state) => ({
  graphState: state
}))
export default class App extends Component {
  render() {
    const { graphState } = this.props
    let graphStateIsWhatWeWant = graphState.equals(whatWeWant)

    return (
      <div>
        <textarea readOnly style={ {
        width: '50%', height: '50%',
        background: (graphStateIsWhatWeWant ? 'rgba(30, 255, 30, 0.5)'
        : 'orange')
        } } value={JSON.stringify(graphState.toJS(), null, 4)} />
        <textarea readOnly style={ {
        width: '50%', height: '50%',
        background: 'rgba(30, 255, 30, 0.5)'
        } } value={JSON.stringify(whatWeWant.toJS(), null, 4)} />
      </div>
    )
  }
}

let initialGraphState = immutable.fromJS({
  color: {
    orange: {
      roses: {}
    },
    red: {}
  }
})

let whatWeWant = immutable.fromJS({
  color: {
    red: {
      roses: {}
    }
  }
})

let moveAndRenameOrange =
{ type: 'moveAndRenameConcept', payload: { to: ['color', 'orange'], add: ['color', 'red'] } }

store ? store.dispatch(moveAndRenameOrange) : null

export function graphReducer (state = initialGraphState, action = {}) {
  switch (action.type) {
    case 'moveAndRenameConcept':

      let movedAndRenamedConcept = state.getIn(action.payload.add)
      state = state.deleteIn(action.payload.add)
      return state.mergeIn(action.payload.to, movedAndRenamedConcept)
    case 'addConcept':
      return state.setIn(action.payload.to.concat(action.payload.add), Map())
    default:
      return state
  }
}
