import React, { Component, findDOMNode } from 'react'
import { connect } from 'react-redux'
import { store } from './index'
import immutable, { Map } from 'immutable'
import d3 from 'd3'

@connect((state) => ({
  graphState : transformToNodesAndLinks(state.get('graph'))
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
        <ForceDirectedGraph />
      </div>
    )
  }
}

function transformToNodesAndLinks (graph) {
  let nodesAndLinks = immutable.fromJS({nodes: [], links: []})
  nodesAndLinks = loopThoroughMap(graph, nodesAndLinks)
  return nodesAndLinks
}

function loopThoroughMap(source, result, deepCoun = 0, lastNodeIndex = 0, nodeCounter = {counter: 0}){
  source.forEach((item, index) => {
    console.log(deepCoun + "!!!!")
    console.log(index)
    result = result.update('nodes', nodes => nodes.push({ name: index }))
    if(nodeCounter.counter != 0){
      result = result.update('links', links => links.push({ source: lastNodeIndex, target: nodeCounter.counter }))
    }
    nodeCounter.counter++
    result = loopThoroughMap(item, result, deepCoun + 1, nodeCounter.counter - 1, nodeCounter)
  })
  return result
}

@connect((state) => ({
  nodesAndLinks : transformToNodesAndLinks(state.get('graph'))
}))
class ForceDirectedGraph extends Component {
  componentDidMount() {
    d3.select(findDOMNode(this)).
      append('svg').
      attr('id', 'graph').
      attr('width', '320').
      attr('height', '220')
    this.componentDidUpdate()
  }

  componentDidUpdate() {
    const { nodesAndLinks } = this.props
    let svg = d3.select('#graph'),
      nodes = nodesAndLinks.get('nodes').toJS(),
      links = nodesAndLinks.get('links').toJS(),
      force = d3.layout.force().
        linkDistance(100).
        charge(-200).
        nodes(nodes).
        size([320, 220]).
        links(links).start()

    let link = svg.selectAll('.link').data(links).
      enter().append('line').attr('class', 'link')

    let node = svg.selectAll('.node').data(nodes).
      enter().
      append('g').attr('class', 'node')

    node.append('circle').attr('r', 30).
      attr('fill', 'rgb(134, 255, 134)')

    node.append('text').
      attr("dx", d => -d.name.length * 3).
      attr("dy", ".2em").
      text(d => d.name)

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x })
        .attr("y1", function(d) { return d.source.y })
        .attr("x2", function(d) { return d.target.x })
        .attr("y2", function(d) { return d.target.y })

      node.attr("transform",
        function(d) { return "translate(" + d.x + "," + d.y + ")" })

    })
  }

  render() {
    return (
      <div></div>
    )
  }
}

let initialGraphState = immutable.fromJS({
  graph: {
    color: {
      red: {
        roses: {},
        sun: {}
      },
      orange: {
        mandarin: {
          monkey: {}
        }
      }
    }
  }
})

let whatWeWant = immutable.fromJS({
  graph: {
    color: {
      red: {
        roses: {}
      },
      orange: {
        mandarin: {
          monkey: {},
          greatApe: {}
        }
      }
    }
  }
})

export function graphReducer(state = initialGraphState, action = {}) {
  switch (action.type) {
    case 'addConcept':
      return state.setIn(action.payload.to.concat(action.payload.add), Map())
    case 'deleteConcept':
      return state.deleteIn(action.payload.delete)
    case 'moveConcept':
      let movedConcept = state.getIn(action.payload.moveFrom)
      state = state.deleteIn(action.payload.moveFrom)
      let updateKeyPath = action.payload.moveTo.
        concat([action.payload.moveFrom[action.payload.moveFrom.length - 1]])
      return state.updateIn(updateKeyPath, () => movedConcept)
    case 'moveAndRenameConcept':
      let movedAndRenamedConcept = state.getIn(action.payload.renamedMoveFrom)
      state = state.deleteIn(action.payload.renamedMoveFrom)
      return state.mergeIn(action.payload.renamedMoveTo, movedAndRenamedConcept)
    default:
      return state
  }
}
