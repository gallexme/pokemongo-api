import {S2} from 's2-geometry'

/**
 * Provides cell IDs of nearby cells based on the given coords and radius
 * @param {number} lat
 * @param {number} lng
 * @param {number} [radius=3]
 * @returns {array}
 * @static
 */
const getCellIDs = (lat, lng, radius) => {
  if (typeof radius === 'undefined') radius = 3

  var origin = S2.S2Cell.FromLatLng({
    lat: lat,
    lng: lng
  }, 15)
  var cells = []

  cells.push(origin.toHilbertQuadkey()) // middle block

  for (var i = 1; i < radius; i++) {
    // cross in middle
    cells.push(S2.S2Cell.FromFaceIJ(origin.face, [origin.ij[0], origin.ij[1] - i], origin.level)
      .toHilbertQuadkey())
    cells.push(S2.S2Cell.FromFaceIJ(origin.face, [origin.ij[0], origin.ij[1] + i], origin.level)
      .toHilbertQuadkey())
    cells.push(S2.S2Cell.FromFaceIJ(origin.face, [origin.ij[0] - i, origin.ij[1]], origin.level)
      .toHilbertQuadkey())
    cells.push(S2.S2Cell.FromFaceIJ(origin.face, [origin.ij[0] + i, origin.ij[1]], origin.level)
      .toHilbertQuadkey())

    for (var j = 1; j < radius; j++) {
      cells.push(S2.S2Cell.FromFaceIJ(origin.face, [origin.ij[0] - j, origin.ij[1] - i], origin.level)
        .toHilbertQuadkey())
      cells.push(S2.S2Cell.FromFaceIJ(origin.face, [origin.ij[0] + j, origin.ij[1] - i], origin.level)
        .toHilbertQuadkey())
      cells.push(S2.S2Cell.FromFaceIJ(origin.face, [origin.ij[0] - j, origin.ij[1] + i], origin.level)
        .toHilbertQuadkey())
      cells.push(S2.S2Cell.FromFaceIJ(origin.face, [origin.ij[0] + j, origin.ij[1] + i], origin.level)
        .toHilbertQuadkey())
    }
  }

  return cells.map((cell) => {
    return S2.toId(cell)
  })
}
export {
  getCellIDs,
}