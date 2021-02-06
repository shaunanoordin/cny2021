import Entity from '../entity'
import { PLAYER_ACTIONS, TILE_SIZE } from '../constants'

class Hero extends Entity {
  constructor (app, col = 0, row = 0) {
    super(app)
    
    this.colour = '#000'
    this.x = col * TILE_SIZE + TILE_SIZE / 2
    this.y = row * TILE_SIZE + TILE_SIZE / 2
    this.z = 100
  }
  
  paint () {
    const app = this._app
    
    this.colour = (app.playerAction === PLAYER_ACTIONS.PULLING)
      ? '#e42'
      : '#c66'
    super.paint()
    
    const c2d = app.canvas2d
    const camera = app.camera
    const animationSpritesheet = app.assets.hero
    
    if (animationSpritesheet) {
      const SPRITE_SIZE = 64
      let SPRITE_OFFSET_X = 0
      let SPRITE_OFFSET_Y = 0

      const srcSizeX = SPRITE_SIZE
      const srcSizeY = SPRITE_SIZE
      let srcX = 0
      let srcY = 0

      const tgtSizeX = SPRITE_SIZE
      const tgtSizeY = SPRITE_SIZE
      const tgtX = Math.floor(this.x + camera.x) - srcSizeX / 2 + SPRITE_OFFSET_X
      const tgtY = Math.floor(this.y + camera.y) - srcSizeY / 2 + SPRITE_OFFSET_Y

      /*switch (entity.direction) {
        case DIRECTIONS.SOUTH: srcX = SPRITE_SIZE * 0; break;
        case DIRECTIONS.NORTH: srcX = SPRITE_SIZE * 1; break;
        case DIRECTIONS.EAST: srcX = SPRITE_SIZE * 2; break;
        case DIRECTIONS.WEST: srcX = SPRITE_SIZE * 3; break;
      }

      switch (entity.animationName) {
        case 'move-1': srcY = SPRITE_SIZE * 1; break;
        case 'move-2': srcY = SPRITE_SIZE * 2; break;
        case 'move-3': srcY = SPRITE_SIZE * 3; break;
        case 'attack-windup': srcY = SPRITE_SIZE * 4; break;
        case 'attack-active': srcY = SPRITE_SIZE * 5; break;
        case 'attack-winddown': srcY = SPRITE_SIZE * 5; break;
        case 'dash': srcY = SPRITE_SIZE * 1; break;
      }*/

      c2d.drawImage(animationSpritesheet.img, srcX, srcY, srcSizeX, srcSizeY, tgtX, tgtY, tgtSizeX, tgtSizeY)
    }
  }
}
  
export default Hero