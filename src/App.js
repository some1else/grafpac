import React, { PureComponent } from "react"
import { ForceGraph, ForceGraphNode, ForceGraphLink } from "react-vis-force"
// import { primes } from "./util"
import Color from "color"

import seedData from "./seedData.json"

import { logGraph, grow, findLooseEdges } from "./Graph"

import "./App.css"

const VERTEX_COUNT = 1024 / 4

function hexColorFor(id) {
  const color = Color(`hsl(${id % 360}, 100%, 50%)`)
  return color.hex()
}

class App extends PureComponent {
  state = { ...seedData, animate: false }

  growGraph = () => {
    const { edges, vertices } = this.state

    if (vertices.length === VERTEX_COUNT / 4) {
      this.setState({ ...this.state, animate: true })
      clearInterval(this.interval)

      setTimeout(() => {
        this.interval = setInterval(this.growGraph, 30)
      }, 6000)
    }

    if (vertices.length === Math.floor(VERTEX_COUNT / 3)) {
      clearInterval(this.interval)

      setTimeout(() => {
        this.interval = setInterval(this.growGraph, 30)
      }, 7000)
    }

    if (vertices.length === VERTEX_COUNT / 2) {
      clearInterval(this.interval)

      setTimeout(() => {
        this.interval = setInterval(this.growGraph, 30)
      }, 8000)
    }

    if (vertices.length === Math.floor(VERTEX_COUNT / 1.1)) {
      clearInterval(this.interval)

      setTimeout(() => {
        this.interval = setInterval(this.growGraph, 8)
      }, 38000)
    }

    if (vertices.length >= VERTEX_COUNT) {
      clearTimeout(this.interval)

      logGraph({ edges, vertices })
    }

    // debugger

    let newState = grow({ edges, vertices }, { test: true })

    // console.log("loose ends:", findLooseEdges(newState).length)

    this.setState(newState.graph)
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
              alphaDecay: 0.00001,
              velocityDecay: 0.375,
              strength: {
                charge: (1 / this.state.vertices.length) * -10000,
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
                // cx={Math.random() * window.innerWidth}
                // cy={Math.random() * window.innerHeight}
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
