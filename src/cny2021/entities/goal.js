import Entity from '../entity'
import { PLAYER_ACTIONS, TILE_SIZE, VICTORY_TIMER } from '../constants'

class Goal extends Entity {
  constructor (app, col = 0, row = 0) {
    super(app)
    
    this.colour = '#cc4'
    this.size = TILE_SIZE * 2
    this.solid = false
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2
  }
  
  onCollision (target, collisionCorrection) {
    if (target !== this._app.hero) return null
    
    const goal = this
    const hero = target
    
    // Pull hero to the centre
    const distX = goal.x - hero.x
    const distY = goal.y - hero.y
    const angleToGoal = Math.atan2(distY, distX)
    const distanceToGoal = Math.sqrt(distX * distX + distY * distY)
    
    hero.speedX = Math.cos(angleToGoal) * Math.min(distanceToGoal, hero.movementSpeed)
    hero.speedY = Math.sin(angleToGoal) * Math.min(distanceToGoal, hero.movementSpeed)
    
    if (!this._app.victory) {
      this._app.victory = true
      this._app.victoryCountdown = VICTORY_TIMER
    }
  }
}
  
export default Goal