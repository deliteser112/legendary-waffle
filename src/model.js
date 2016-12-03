const reducers = require('./reducers')
const effects = require('./effects')
const robotRuntime = require('./utils/robot-runtime')

const initialState = {
  robot: { x: 0, y: 0 },
  gameSpeed: 500,
  code: '',
  workspace: ''
}

module.exports = {
  state: initialState,
  effects,
  reducers,
  subscriptions: [
    (send, done) => {
      robotRuntime.connect(send)
    }
  ]
}
