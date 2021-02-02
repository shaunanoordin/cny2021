import Entity from '../entity'
import { PLAYER_ACTIONS, TILE_SIZE } from '../constants'

class Goal extends Entity {
  constructor (app, col = 0, row = 0) {
    super(app)
    
    this.colour = '#cc4'
    this.size = TILE_SIZE * 3
    this.solid = false
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2
  }
}
  
export default Goal