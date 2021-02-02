import Entity from '../entity'
import { PLAYER_ACTIONS } from '../constants'

class Hero extends Entity {
  constructor (app) {
    super(app)
    
    this.colour = '#c44'
  }
  
  paint () {
    this.colour = (this._app.playerAction === PLAYER_ACTIONS.PULLING)
      ? '#c44'
      : '#e42'
    super.paint()
  }
}
  
export default Hero