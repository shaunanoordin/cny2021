import { PLAYER_ACTIONS, IDLE_TIME_UNTIL_INSTRUCTIONS } from './constants'

import Hero from './entities/hero'
import Goal from './entities/goal'
import Wall from './entities/wall'
import Ball from './entities/ball'
import Coin from './entities/coin'
import Instructions from './entities/instructions'
import Splash from './entities/splash'

const HIGHSCORE_STORAGE_KEY = 'cny2021.levels.highscores'

export default class Levels {
  constructor (app) {
    this._app = app
    this.current = 1
    this.levelGenerators = [
      this.generate_level0.bind(this),
      this.generate_level1.bind(this),
    ]
    this.highScores = this.levelGenerators.map(() => undefined)
    
    this.loadHighScores()
  }
  
  reset () {
    const app = this._app
    app.hero = undefined
    app.instructions = null
    app.entities = []
    app.camera = {
      target: null, x: 0, y: 0,
    }
    app.playerAction = PLAYER_ACTIONS.IDLE
    app.victory = 0
    app.victoryCountdown = 0
    app.instructionsCountdown = IDLE_TIME_UNTIL_INSTRUCTIONS
    app.score = 0
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
  
  registerScore (score) {
    if (this.current < 0 || this.current >= this.levelGenerators.length) return
    
    if (
      this.highScores[this.current] === undefined
      || this.highScores[this.current] === null
      || this.highScores[this.current] < score
    ) {
      this.highScores[this.current] = score
    }
    
    this.saveHighScores()
  }
  
  saveHighScores () {
    const storage = window?.localStorage
    if (!storage) return
    storage.setItem(HIGHSCORE_STORAGE_KEY, JSON.stringify(this.highScores))
  }
  
  loadHighScores () {
    const storage = window?.localStorage
    if (!storage) return
    try {
      const str = storage.getItem(HIGHSCORE_STORAGE_KEY)
      this.highScores = (str) ? JSON.parse(str) : []
    } catch (err) {
      this.highScores = []
      console.error(err)
    }
  }
  
  generate_default () {
    const app = this._app
    
    app.hero = new Hero(app, 11, 3)
    app.entities.push(app.hero)
    app.camera.target = app.hero
    
    app.entities.push(new Goal(app, 19, 3))
    
    app.instructions = new Instructions(app, 5, 3)
    app.entities.push(app.instructions)
    
    app.entities.push(new Wall(app, 0, 0, 1, 7)) // West Wall
    app.entities.push(new Wall(app, 22, 0, 1, 7)) // East Wall
    app.entities.push(new Wall(app, 1, 0, 21, 1)) // North Wall
    app.entities.push(new Wall(app, 1, 6, 21, 1)) // South Wall
  }
  
  generate_level0 () {
    const app = this._app
    
    app.hero = new Hero(app, 11, 3)
    app.entities.push(app.hero)
    app.camera.target = app.hero
    
    app.entities.push(new Goal(app, 19, 3))
    
    app.instructions = new Instructions(app, 5, 3)
    app.entities.push(app.instructions)
    
    app.entities.push(new Wall(app, 0, 0, 1, 7)) // West Wall
    app.entities.push(new Wall(app, 22, 0, 1, 7)) // East Wall
    app.entities.push(new Wall(app, 1, 0, 21, 1)) // North Wall
    app.entities.push(new Wall(app, 1, 6, 21, 1)) // South Wall
    
    app.entities.push(new Splash(app, 11, -2.5, 0))
    app.entities.push(new Splash(app, 11, 8.5, 1))
    
    app.entities.push(new Coin(app, 3, 3))
    app.entities.push(new Coin(app, 15, 3))
  }
  
  generate_level1 () {
    const app = this._app
    
    app.hero = new Hero(app, 11, 3)
    app.entities.push(app.hero)
    app.camera.target = app.hero
    
    app.entities.push(new Goal(app, 19, 3))
    
    app.instructions = new Instructions(app, 5, 3)
    app.entities.push(app.instructions)
    
    app.entities.push(new Wall(app, 0, 0, 1, 7)) // West Wall
    app.entities.push(new Wall(app, 22, 0, 1, 7)) // East Wall
    app.entities.push(new Wall(app, 1, 0, 21, 1)) // North Wall
    app.entities.push(new Wall(app, 1, 6, 21, 1)) // South Wall
    
    app.entities.push(new Ball(app, 15, 1))
    app.entities.push(new Ball(app, 15, 3))
    app.entities.push(new Ball(app, 15, 5))
  }
  
}
