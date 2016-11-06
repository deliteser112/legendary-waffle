const gameEngine = require('./game-engine')

module.exports = gameEngine.init({
  tiles: [
    [2, 1, 2, 3, 2, 0, 0, 0, 0, 0],
    [2, 1, 2, 1, 2, 0, 0, 0, 0, 0],
    [2, 1, 2, 1, 2, 0, 0, 0, 0, 0],
    [2, 1, 1, 1, 2, 0, 0, 0, 0, 0],
    [2, 2, 2, 1, 2, 0, 0, 0, 0, 0],
    [2, 2, 2, 1, 2, 2, 2, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 2, 0, 0, 0],
    [1, 2, 2, 1, 2, 1, 2, 0, 0, 0],
    [1, 2, 2, 1, 2, 1, 2, 2, 2, 0],
    [1, 2, 3, 1, 2, 1, 1, 3, 2, 0]
  ],
  entities: [
    getRobot({ id: 'robot', x: 1, y: 0 }),
    getGem({ x: 3, y: 0 }),
    getGem({ x: 7, y: 9 }),
    getGem({ x: 2, y: 9 })
  ]
})

function getRobot ({ id, x, y }) {
  return {
    id: 'robot',
    position: { x, y, rotation: 0 },
    sprite: { type: 'ROBOT_0' }
  }
}

function getGem ({x, y}) {
  return {
    position: { x, y },
    item: { type: 'gem' },
    sprite: { type: 'GEM' }
  }
}
