import Entity from '../entity'
import { SHAPES, TILE_SIZE } from '../constants'

class Wall extends Entity {
  constructor (app, col = 0, row = 0, width = 1, height = 1) {
    super(app)
    
    this.colour = '#888'
    this.solid = true
    this.movable = false
    this.x = col * TILE_SIZE
    this.y = row * TILE_SIZE
    
    this.shape = SHAPES.POLYGON
    this.shapePolygonPath = [
      0, 0,
      width * TILE_SIZE, 0,
      width * TILE_SIZE, height * TILE_SIZE,
      0, height * TILE_SIZE
    ]
  }
}
  
export default Wall