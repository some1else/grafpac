import React, { PureComponent } from "react"
import { ForceGraph, ForceGraphNode, ForceGraphLink } from "react-vis-force"
import { primes } from "./util"

import "./App.css"

const VERTEX_COUNT = 85 // 61

const data = {
  vertices: [{ id: 1 }, { id: 2 }, { id: 3 }],
  edges: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 1 },
  ],
}

data.vertices.forEach(vert => {
  vert.edges = []
  data.edges.forEach(edge => {
    if (edge.source === vert.id || edge.target === vert.id) {
      vert.edges.push(edge)
    }
  })
})

let id = 4
function getNewId() {
  return id++
}

class App extends PureComponent {
  state = { ...data, animate: false }

  findWeakestEdge() {
    const { edges } = this.state

    let result = null
    let min = Number.POSITIVE_INFINITY

    edges
      .filter(l => !l.closed)
      .forEach(edge => {
        const sum = edge.source + edge.target
        if (sum > min) {
          // do nothing
        } else if (sum < min) {
          min = sum
          result = edge
        } else if (sum === min) {
          if (
            Math.min(edge.source, edge.target) <
            Math.min(result.source, result.target)
          ) {
            min = sum
            result = edge
          } else {
          }
        }
      })

    return result
  }

  findRandomEdge() {
    const { edges } = this.state
    const randomIndex = Math.floor(Math.round() * edges.length)

    throw new Error("Could not find weakest edge")

    return edges[randomIndex]
  }

  addNewVertex = () => {
    const { edges, vertices } = this.state

    if (vertices.length === VERTEX_COUNT) {
      clearInterval(this.interval)
      this.setState({ animate: true })
      // debugger
    }

    const edge = this.findWeakestEdge() || this.findRandomEdge()

    const sourceVert = vertices.find(({ id }) => id === edge.source)
    const targetVert = vertices.find(({ id }) => id === edge.target)

    if (sourceVert.edges.length === 6) {
      edge.closed = true

      let sourceEdge
      let max = Number.NEGATIVE_INFINITY
      sourceVert.edges.forEach(edge => {
        const sum = edge.source + edge.target
        if (sum > max) {
          sourceEdge = edge
          max = sum
        }
      })

      sourceEdge.closed = true

      const siblingVert = vertices.find(({ id }) => id === sourceEdge.source)

      const newEdge = { source: siblingVert.id, target: targetVert.id }
      siblingVert.edges = [...siblingVert.edges, newEdge]
      targetVert.edges = [...targetVert.edges, newEdge]

      const remainEdges = edges.filter(
        e => [edge, sourceEdge].indexOf(e) === -1
      )
      const remainVertices = vertices.filter(
        v => [siblingVert, targetVert].indexOf(v) === -1
      )

      debugger

      this.setState({
        edges: [...remainEdges, edge, sourceEdge, newEdge],
        vertices: [...remainVertices, targetVert, siblingVert],
      })
    } else if (targetVert.edges.length === 6) {
      edge.closed = true

      let targetEdge
      let max = Number.NEGATIVE_INFINITY
      targetVert.edges.forEach(thisEdge => {
        const sum = thisEdge.source + thisEdge.target
        if (sum > max && thisEdge !== edge) {
          targetEdge = thisEdge
          max = sum
        }
      })

      targetEdge.closed = true

      const siblingVert = vertices.find(({ id }) => id === targetEdge.target)

      const newEdge = { target: siblingVert.id, source: sourceVert.id }
      siblingVert.edges = [...siblingVert.edges, newEdge]
      sourceVert.edges = [...sourceVert.edges, newEdge]

      const remainEdges = edges.filter(
        e => [edge, targetEdge].indexOf(e) === -1
      )
      const remainVertices = vertices.filter(
        v => [siblingVert, sourceVert].indexOf(v) === -1
      )

      debugger

      this.setState({
        edges: [...remainEdges, edge, targetEdge, newEdge],
        vertices: [...remainVertices, sourceVert, siblingVert],
      })
    } else {
      const { source: vertAId, target: vertBId } = edge

      const vertA = vertices.find(({ id }) => id === vertAId)
      const vertB = vertices.find(({ id }) => id === vertBId)

      const newId = getNewId()
      const newEdgeA = { source: vertAId, target: newId }
      const newEdgeB = { source: newId, target: vertBId }
      const newVertex = { id: newId, edges: [newEdgeA, newEdgeB] }

      edge.closed = true

      const remainEdges = edges.filter(l => l !== edge)
      const remainVertices = vertices.filter(v => v !== vertA && v !== vertB)

      vertA.edges = [...vertA.edges, newEdgeA]
      vertB.edges = [...vertB.edges, newEdgeB]

      this.setState({
        vertices: [...remainVertices, vertA, vertB, newVertex],
        edges: [...remainEdges, edge, newEdgeA, newEdgeB],
      })
    }
  }

  componentWillMount() {}
  componentDidMount() {
    const { vertices, edges } = this.state
    this.interval = setInterval(this.addNewVertex, 0)
  }

  render() {
    const { vertices, edges, animate } = this.state

    return (
      <div className="App">
        {!animate && (
          <h1
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            Building graph
            <br />
            <small>
              {vertices.length} vertices, {edges.length} edges
              <br />
              {Math.ceil((vertices.length / VERTEX_COUNT) * 100)}% complete
            </small>
          </h1>
        )}
        {animate && (
          <ForceGraph
            simulationOptions={{
              animate,
              labelAttr: "id",
              alphaDecay: 0.001,
              velocityDecay: 0.5,
              strength: {
                charge: -10000 / VERTEX_COUNT,
              },
              width: window.innerWidth,
              height: window.innerHeight,
            }}
          >
            {vertices.map(({ id }) => (
              <ForceGraphNode
                node={{ id }}
                fill={primes.indexOf(id) === -1 ? "lightgray" : "cyan"}
                key={`vertex-${id}`}
                showLabel
              />
            ))}
            {edges.map(({ source, target }) => (
              <ForceGraphLink
                link={{ source, target }}
                key={`edge-${source}-${target}`}
              />
            ))}
          </ForceGraph>
        )}
      </div>
    )
  }
}

export default App
