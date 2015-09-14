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
  nodesAndLinks = graph.reduce(addNodesAndLinks(''), nodesAndLinks)
  return nodesAndLinks
}

function addNodesAndLinks (currentPath) {
  return (acc, next, concept) => {
    if(currentPath === '') currentPath = concept
    console.log(concept)
    acc = acc.update('nodes', nodes => nodes.push({ name: concept }))
    next.forEach((_, dep) => {
      acc = acc.update('links',
        links => links.push({ source: 0, target: 1 }))
      acc = next.reduce(addNodesAndLinks(currentPath+dep), acc)
    })
    return acc
  }
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
      attr("dy", ".35em").
      text(d => d.name)

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x })
        .attr("y1", function(d) { return d.source.y })
        .attr("x2", function(d) { return d.target.x })
        .attr("y2", function(d) { return d.target.y })

      node.attr("transform",
        function(d) { return "translate(" + d.x + "," + d.y + ")"; });

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
        roses: {}
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
          monkey: {}
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

