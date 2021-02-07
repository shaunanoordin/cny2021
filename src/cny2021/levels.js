import { PLAYER_ACTIONS } from './constants'

import Hero from './entities/hero'
import Goal from './entities/goal'
import Wall from './entities/wall'
import Ball from './entities/ball'
import Instructions from './entities/instructions'

export default class Levels {
  constructor (app) {
    this._app = app
    this.current = 1
    this.levelGenerators = [
      this.generate_level0.bind(this),
      this.generate_level1.bind(this),
    ]
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
    this.current = level
    
    this.reset()
    
    if (this.levelGenerators[level]) {
      this.levelGenerators[level]()
    } else {
      this.generate_default()
    }
    
    // Rearrange: 
    app.entities.sort((a, b) => a.z - b.z)
  }
  
  reload () {
    this.load(this.current)
  }
  
  generate_default () {
    const app = this._app
    
    app.hero = new Hero(app, 5, 3)
    app.entities.push(app.hero)
    app.camera.target = app.hero
    
    app.entities.push(new Goal(app, 13, 3))
    
    app.entities.push(new Wall(app, 0, 0, 1, 7)) // West Wall
    app.entities.push(new Wall(app, 16, 0, 1, 7)) // East Wall
    app.entities.push(new Wall(app, 1, 0, 15, 1)) // North Wall
    app.entities.push(new Wall(app, 1, 6, 15, 1)) // South Wall
  }
  
  generate_level0 () {
    const app = this._app
    
    app.hero = new Hero(app, 5, 3)
    app.entities.push(app.hero)
    app.camera.target = app.hero
    
    app.entities.push(new Goal(app, 13, 3))
    
    app.entities.push(new Instructions(app, 5, 3))
    
    app.entities.push(new Wall(app, 0, 0, 1, 7)) // West Wall
    app.entities.push(new Wall(app, 16, 0, 1, 7)) // East Wall
    app.entities.push(new Wall(app, 1, 0, 15, 1)) // North Wall
    app.entities.push(new Wall(app, 1, 6, 15, 1)) // South Wall
  }
  
  generate_level1 () {
    const app = this._app
    
    app.hero = new Hero(app, 5, 3)
    app.entities.push(app.hero)
    app.camera.target = app.hero
    
    app.entities.push(new Goal(app, 13, 3))
    
    app.entities.push(new Wall(app, 0, 0, 1, 7)) // West Wall
    app.entities.push(new Wall(app, 16, 0, 1, 7)) // East Wall
    app.entities.push(new Wall(app, 1, 0, 15, 1)) // North Wall
    app.entities.push(new Wall(app, 1, 6, 15, 1)) // South Wall
    
    app.entities.push(new Ball(app, 7, 1))
    app.entities.push(new Ball(app, 7, 3))
    app.entities.push(new Ball(app, 7, 5))
  }
  
}
