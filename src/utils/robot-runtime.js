const _ = require('lodash')
const uid = require('uid')
const esper = require('esper.js')

class RobotRuntime {

  constructor () {
    this.robots = {}
  }

  connect (send) {
    this.send = send
  }

  spawnRobot ({ spawnerId, api, code }) {
    const id = uid()

    this.send('game:spawner.spawn', {
      target: spawnerId,
      data: { id }
    }, _.noop)

    this.robots[id] = new Robot({ id, api, code, send: this.send })
  }

  triggerEvent (name, args) {
    _.forEach(this.robots, (robot) => robot.triggerEvent(name, args))
  }

  step () {
    _.forEach(this.robots, (robot, id) => robot.step())
  }
}

class Robot {

  constructor ({ id, api, code, send }) {
    this.id = id
    this.send = send
    this.completedTurn = true
    this.terminatedMain = false

    // initialize engine
    this.mainEngine = this.currentEngine = new esper.Engine()
    this.mainEngine.load(code)

    this.addAPI(api)
  }

  addAPI ({ namespace, actions }) {
    this.namespace = namespace
    this.mainEngine.addGlobal(namespace, this.getAPIObject(actions))
  }

  // turns action definitions in functions which can be called by the Robot code
  getAPIObject (actions) {
    return _.reduce(actions, (api, method, name) => {
      api[name] = (...params) => {
        const [action, data] = method.apply(null, params)

        this.send(action, { target: this.id, data }, _.noop)

        this.completedTurn = true
      }

      return api
    }, {})
  }

  triggerEvent (name, args) {
    if (this.handlesEvent()) {
      return
    }

    const eventHandlerName = `on${_.capitalizeFirstLetter(name)}`

    // skip if robot program has no event handler
    if (!_.isFunction(this.currentEngine.globalScope.get(this.namespace).native[eventHandlerName])) {
      return
    }

    // create separate engine which shares all the state with the main engine
    // the code of the engine just calls the event handler
    this.currentEngine = this.currentEngine.fork()
    this.currentEngine.load(`${this.namespace}.${eventHandlerName}.apply(null, ${JSON.stringify(args)})`)
  }

  step () {
    if (this.terminatedMain && !this.handlesEvent()) {
      return
    }

    this.completedTurn = false
    let completed = false

    do {
      completed = this.currentEngine.step()
    } while (!completed && !this.completedTurn)

    if (completed) {
      if (this.handlesEvent()) {
        this.currentEngine = this.mainEngine
        return
      }

      this.terminatedMain = true
    }
  }

  handlesEvent () {
    return this.mainEngine !== this.currentEngine
  }
}

module.exports = new RobotRuntime()
