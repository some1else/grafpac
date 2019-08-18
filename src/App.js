import React, { PureComponent } from "react"
import { ForceGraph, ForceGraphNode, ForceGraphLink } from "react-vis-force"
// import { primes } from "./util"
import Color from "color"

import {
  data as seedData,
  logGraph,
  grow,
  findLooseEdges,
  VERTEX_COUNT,
} from "./Graph"

import "./App.css"

function hexColorFor(id) {
  const color = Color(`hsl(${id % 360}, 100%, 50%)`)
  return color.hex()
}

class App extends PureComponent {
  state = { ...seedData, animate: false }

  growGraph = () => {
    const { edges, vertices } = this.state

    if (vertices.length >= VERTEX_COUNT) {
      clearInterval(this.interval)
      this.setState({ animate: true })
      logGraph({ edges, vertices })
    }

    let newState = grow({ edges, vertices })

    // console.log("loose ends:", findLooseEdges(newState).length)

    this.setState(newState)
  }

  componentDidMount() {
    const { vertices, edges } = this.state
    this.interval = setInterval(this.growGraph, 0)
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
              // alphaDecay: 0.0001,
              alphaDecay: 0.01,
              // velocityDecay: 0.5,
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
                // fill={primes.indexOf(id) === -1 ? "lightgray" : "cyan"}
                fill={hexColorFor(id)}
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
