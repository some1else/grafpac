export const VERTEX_COUNT = 420 / 8

export const MAX_EDGES = 6

export const data = {
  vertices: [
    { id: 1, edges: [1, 2] },
    { id: 2, edges: [1, 3] },
    { id: 3, edges: [2, 3] },
  ],
  edges: [
    { id: 1, source: 1, target: 2, weight: 3 },
    { id: 2, source: 3, target: 1, weight: 4 },
    { id: 3, source: 2, target: 3, weight: 5 },
  ],
}

const ids = {
  edges: 4,
  vertices: 4,
}

export function getNewId(scope) {
  return (ids[scope] += 1)
}

export function grow(graph) {
  graph = addNewVertex(graph, { meta: Math.random() })
  graph = sanitizeGraph(graph)
  return graph
}

export function logGraph(graph) {
  const string = JSON.stringify(graph)
  console.log(string)
}

export function findWeakestEdge(edges, excludeEdges = []) {
  let weakest = null
  let min = Number.POSITIVE_INFINITY

  edges
    .filter(edge => excludeEdges.indexOf(edge) === -1)
    .filter(edge => !edge.closed)
    .forEach(edge => {
      const sum = edge.source + edge.target
      if (sum < min) {
        min = sum
        weakest = edge
      } else if (sum === min) {
        if (
          Math.min(edge.source, edge.target) <
          Math.min(weakest.source, weakest.target)
        ) {
          min = sum
          weakest = edge
        }
      }
    })

  return weakest
}

export function createVertex({ edges = [], data = {}, id: newId }) {
  const id = newId || getNewId("vertices")
  return { id, edges, data }
}

export function createEdge({ source, target, id: newId }) {
  const id = newId || getNewId("edges")
  return { id, source, target, weight: source + target }
}

export function addNewVertex({ edges, vertices }, data = {}) {
  if (vertices.length === 3) {
    const vert = vertices.find(vert => !vert.data)
    if (vert) {
      vert.data = data
      const remainVertices = vertices.filter(v => v != vert)
      return {
        vertices: [...remainVertices, vert],
        edges: [...edges],
      }
    }
  }

  const edge = findWeakestEdge(edges)

  const { source: vertAId, target: vertBId } = edge

  const vertA = findById(vertices, vertAId)
  const vertB = findById(vertices, vertBId)

  const newVertex = createVertex({ data })

  const newEdgeA = createEdge({
    source: vertAId,
    target: newVertex.id,
  })

  const newEdgeB = createEdge({
    source: newVertex.id,
    target: vertBId,
  })

  newVertex.edges = [newEdgeA.id, newEdgeB.id]

  const remainEdges = edges.filter(l => l !== edge)
  const remainVertices = vertices.filter(v => v !== vertA && v !== vertB)

  vertA.edges = [...vertA.edges, newEdgeA.id]
  vertB.edges = [...vertB.edges, newEdgeB.id]

  edge.closed = true

  return {
    vertices: [...remainVertices, vertA, vertB, newVertex],
    edges: [...remainEdges, edge, newEdgeA, newEdgeB],
  }
}

export function sanitizeGraph(graph) {
  if (graph.vertices.length < 4) return graph

  const looseEdges = []
  let done = false

  while (!done) {
    const edge = findWeakestEdge(graph.edges, looseEdges)
    const sourceVert = findById(graph.vertices, edge.source)
    const targetVert = findById(graph.vertices, edge.target)
    if (sourceVert.edges.length === MAX_EDGES) {
      graph = closeLastEdgeWithSource(graph, edge, sourceVert, targetVert)
    } else if (targetVert.edges.length === MAX_EDGES) {
      graph = closeLastEdgeWithTarget(graph, edge, targetVert, sourceVert)
    } else {
      done = true
    }
  }

  return graph
}

export function closeLastEdgeWithTarget(
  { edges, vertices },
  edge,
  targetVert,
  sourceVert
) {
  edge.closed = true

  // find strongest edge connected to the targetVert
  let targetEdge
  let max = Number.NEGATIVE_INFINITY
  const targetEdges = edges.filter(e => targetVert.edges.indexOf(e.id) > -1)
  targetEdges.forEach(thisEdge => {
    const sum = thisEdge.source + thisEdge.target
    if (sum > max && thisEdge !== edge) {
      targetEdge = thisEdge
      max = sum
    }
  })
  targetEdge.closed = true

  const siblingVert = findById(vertices, targetEdge.target)

  const newEdge = createEdge({
    target: siblingVert.id,
    source: sourceVert.id,
  })
  siblingVert.edges = [...siblingVert.edges, newEdge.id]
  sourceVert.edges = [...sourceVert.edges, newEdge.id]

  const remainEdges = edges.filter(e => [edge, targetEdge].indexOf(e) === -1)
  const remainVertices = vertices.filter(
    v => [siblingVert, sourceVert].indexOf(v) === -1
  )

  return {
    edges: [...remainEdges, edge, targetEdge, newEdge],
    vertices: [...remainVertices, sourceVert, siblingVert],
  }
}

export function closeLastEdgeWithSource(
  { edges, vertices },
  edge,
  sourceVert,
  targetVert
) {
  edge.closed = true

  // foind strongest edge connected to sourceVert
  let sourceEdge
  let max = Number.NEGATIVE_INFINITY
  const sourceEdges = edges.filter(e => sourceVert.edges.indexOf(e.id) > -1)
  sourceEdges.forEach(edge => {
    const sum = edge.source + edge.target
    if (sum > max) {
      sourceEdge = edge
      max = sum
    }
  })

  sourceEdge.closed = true

  const siblingVert = findById(vertices, sourceEdge.source)

  const newEdge = createEdge({
    source: siblingVert.id,
    target: targetVert.id,
  })
  siblingVert.edges = [...siblingVert.edges, newEdge.id]
  targetVert.edges = [...targetVert.edges, newEdge.id]

  const remainEdges = edges.filter(e => [edge, sourceEdge].indexOf(e) === -1)
  const remainVertices = vertices.filter(
    v => [siblingVert, targetVert].indexOf(v) === -1
  )

  return {
    edges: [...remainEdges, edge, sourceEdge, newEdge],
    vertices: [...remainVertices, targetVert, siblingVert],
  }
}

export function findById(collection, targetId) {
  return collection.find(({ id }) => id === targetId)
}

export function findLooseEdges({ edges, vertices }) {
  if (edges.length === 0) return 0

  const looseEdges = []
  let done = false

  while (!done) {
    const weakestEdge = findWeakestEdge(edges, looseEdges)
    const sourceVert = findById(vertices, weakestEdge.source)
    const targetVert = findById(vertices, weakestEdge.target)
    const isLooseEnd =
      sourceVert.edges.length === MAX_EDGES ||
      targetVert.edges.length === MAX_EDGES
    if (isLooseEnd) {
      looseEdges.push(weakestEdge)
    } else {
      done = true
    }
  }

  return looseEdges
}

// export function reduceToWeakestEdge(edges) {
//   return edges.reduce(
//     (weakest, edge) => {
//       const min = weakest.source + weakest.target
//       const sum = edge.source + edge.target
//       if (
//         sum < min ||
//         (sum === min &&
//           Math.min(edge.source, edge.target) <
//             Math.min(weakest.source, weakest.target))
//       ) {
//         weakest = edge
//       }
//       return weakest
//     },
//     { source: Number.POSITIVE_INFINITY, target: Number.POSITIVE_INFINITY }
//   )
// }
