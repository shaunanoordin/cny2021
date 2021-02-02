import Entity from '../entity'
import { PLAYER_ACTIONS } from '../constants'

class Goal extends Entity {
  constructor (app) {
    super(app)
    
    this.colour = '#cc4'
  }
}
  
export default Goal