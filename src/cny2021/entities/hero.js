import Entity from '../entity'
import { PLAYER_ACTIONS, TILE_SIZE } from '../constants'

class Hero extends Entity {
  constructor (app, col = 0, row = 0) {
    super(app)
    
    this.colour = '#c44'
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2
    this.z = 100
  }
  
  paint () {
    this.colour = (this._app.playerAction === PLAYER_ACTIONS.PULLING)
      ? '#c44'
      : '#e42'
    super.paint()
  }
}
  
export default Hero