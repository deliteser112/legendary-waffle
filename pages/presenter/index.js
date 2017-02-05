/* globals FormData */
const html = require('choo/html')
const _ = require('lodash')
const modal = require('../../elements/modal')
const button = require('../../elements/button')
const timerDisplay = require('../../elements/timer')
const { startButtonView } = require('../../elements/presenter-controls')
const { speedSliderView } = require('../../elements/runtime-controls')
const gameView = require('../../elements/game/index')
const gameStatsView = require('../../elements/game-stats')
const pageLayout = require('../../elements/page-layout')
const prepfight = require('action-overlay')('prepfight').view
const initialState = require('./initial-state')

const DEV_MODE = true

module.exports = function (state, prev, send) {
  let presenter = state.presenter
  let game = state.game
  let clock = state.clock

  if (presenter.groupId === null) {
    if (DEV_MODE) {
      send('presenter:joinGroup', { groupId: 'asd' })
      send('presenter:_testMode')
    }
    return joinGroupDialog({
      onJoinGroup: (groupId) => {
        send('presenter:joinGroup', { groupId })
      }
    })
  }

  const gameHtml = gameView({
    state: game,
    progress: clock.progress
  })

  const gameStatsHtml = gameStatsView({
    gamePoints: game.current.gamePoints,
    resources: game.current.resources
  })

  const timerHtml = html`
    <div style="position: absolute; z-index: 90; right: 20px; bottom: 20px; overflow: hidden">
      ${timerDisplay({ seconds: presenter.time })}
    </div>
  `

  const prepfightHtml = prepfight(state, prev, send)

  const disconnectButtonHtml = button({
    label: 'Exit',
    onClick: () => send('presenter:disconnect')
  })

  const startButtonHtml = startButtonView({
    isRunning: presenter.gameActive,
    onStart: () => send('presenter:startMatch', 2),
    onStop: () => send('presenter:stopMatch')
  })

  const speedSliderHtml = speedSliderView({
    min: 100,
    max: 1000,
    intervalDuration: clock.intervalDuration,
    onChange: (value) => send('clock:setIntervalDuration', { intervalDuration: value })
  })

  const clientsListHtml = clientsList({
    clients: presenter.clients,
    playerNumbers: presenter.playerNumbers
  })

  return pageLayout({
    id: 'presenter-page',
    context: [state, prev, send],
    onload: init,
    header: {
      left: [
        disconnectButtonHtml,
        startButtonHtml,
        speedSliderHtml
      ],
      right: []
    },
    panels: [
      [
        gameHtml,
        gameStatsHtml,
        prepfightHtml,
        clientsListHtml,
        timerHtml
      ]
    ]
  })

  function init () {
    send('clock:stop')
    send('game:loadGameState', { loadState: initialState.game })
    send('prepfight:setLeft', { img: '../../assets/img/robot/robot_rick_right.png' })
    send('prepfight:setRight', { img: '../../assets/img/cyborg/cyborg_rick_left.png' })
    send('prepfight:setVS', { img: 'http://vignette2.wikia.nocookie.net/mortalkombat/images/6/64/Vs.png/revision/latest?cb=20150319161124&path-prefix=de' })
    send('prepfight:setDurations', { up: 1000, down: 1000, stay: 1500 })
  }
}

function joinGroupDialog ({ onJoinGroup }) {
  const buttonHTML = button({
    label: 'submit'
  })

  return modal(html`
    <div>
      <p>To continue please enter a rather unique name for your group or create one!!</p>
      <form onsubmit=${handleSubmit}>
          <input type="text" name="groupId" autofocus>
          ${buttonHTML}
      </form>
    </div>
  `)

  function handleSubmit (evt) {
    const formData = new FormData(evt.target)
    const groupId = formData.get('groupId')

    evt.preventDefault()

    onJoinGroup(groupId)
  }
}

function clientsList ({ clients, playerNumbers }) {
  return html`
    <div class="clientList">
      <h3>Clients</h3>
      <ul>
        ${Object.keys(clients).map(clientToLi)}
      </ul>
    </div>
  `

  function clientToLi (key) {
    let isPlayer = false
    if (_.valuesIn(playerNumbers).indexOf(key) >= 0) {
      isPlayer = true
    }
    return html`<li>${clients[key].username} ${isPlayer ? 'p' : ''}</li>`
  }
}

