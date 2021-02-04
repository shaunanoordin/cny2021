import { PLAYER_ACTIONS } from './constants'

import Hero from './entities/hero'
import Goal from './entities/goal'
import Wall from './entities/wall'
import Ball from './entities/ball'

export default class Levels {
  constructor (app) {
    this._app = app
  }
  
  reset () {
    const app = this._app
    app.hero = undefined
    app.entities = []
    app.camera = {
      target: null, x: 0, y: 0,
    }
    app.playerAction = PLAYER_ACTIONS.IDLE
    app.victory = 0
    app.victoryCountdown = 0
  }
  
  load (level = 0) {
    const app = this._app
    
    this.reset()
    
    app.hero = new Hero(app, 5, 7)
    app.entities.push(app.hero)
    app.camera.target = app.hero
    
    app.entities.push(new Goal(app, 16, 7))
    
    app.entities.push(new Wall(app, 0, 0, 1, 15)) // West Wall
    app.entities.push(new Wall(app, 26, 0, 1, 15)) // East Wall
    app.entities.push(new Wall(app, 1, 0, 25, 1)) // North Wall
    app.entities.push(new Wall(app, 1, 14, 25, 1)) // South Wall
    app.entities.push(new Wall(app, 10, 4, 1, 7)) // Middle Wall
    
    app.entities.push(new Ball(app, 10, 2))
    app.entities.push(new Ball(app, 10, 12))
    
    // Rearrange: 
    app.entities.sort((a, b) => a.z - b.z)
  }
  
}
