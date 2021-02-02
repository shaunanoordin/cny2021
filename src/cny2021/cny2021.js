import {
  GRID_WIDTH, GRID_HEIGHT, TILE_SIZE,
  PLAYER_ACTIONS, SHAPES,
  ACCEPTABLE_INPUT_DISTANCE_FROM_HERO,
} from './constants'
import Physics from './physics'

import Entity from './entity'
import Hero from './entities/hero'
import Goal from './entities/goal'
import Wall from './entities/wall'

class CNY2021 {
  constructor () {
    this.html = {
      main: document.getElementById('main'),
      canvas: document.getElementById('canvas'),
      interaction: document.getElementById('interaction'),
      buttonHome: document.getElementById('button-home'),
      buttonFullscreen: document.getElementById('button-fullscreen'),
    }
    
    this.interactionUI = false
    this.setInteractionUI(false)
    
    this.canvas2d = this.html.canvas.getContext('2d')
    this.canvasWidth = TILE_SIZE * GRID_WIDTH
    this.canvasHeight = TILE_SIZE * GRID_HEIGHT
    
    this.camera = {
      target: null,  // Target entity to follow. If null, camera is static.
      x: 0,
      y: 0,      
    }
    
    this.initialiseUI()
    
    this.initialised = false
    this.assets = {
      // ...
    }
    
    this.hero = null
    this.entities = []
    
    this.playerAction = PLAYER_ACTIONS.IDLE
    this.playerInput = {
      pointerStart: undefined,
      pointerCurrent: undefined,
      pointerEnd: undefined,
    }

    this.prevTime = null
    this.nextFrame = window.requestAnimationFrame(this.main.bind(this))
  }
  
  initialisationCheck () {
    // Assets check
    let allAssetsLoaded = true
    let numLoadedAssets = 0
    let numTotalAssets = 0
    Object.keys(this.assets).forEach((id) => {
      const asset = this.assets[id]
      allAssetsLoaded = allAssetsLoaded && asset.loaded
      if (asset.loaded) numLoadedAssets++
      numTotalAssets++
    })
    
    // Paint status
    this.canvas2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    this.canvas2d.textAlign = 'start'
    this.canvas2d.textBaseline = 'top'
    this.canvas2d.fillStyle = '#ccc'
    this.canvas2d.font = `1em monospace`
    this.canvas2d.fillText(`Loading ${numLoadedAssets} / ${numTotalAssets} `, TILE_SIZE, TILE_SIZE)
    
    if (allAssetsLoaded) {
      this.initialised = true
      this.loadLevel(0)
    }
  }
  
  /*
  Section: General Logic
  ----------------------------------------------------------------------------
   */
  
  main (time) {
    const timeStep = (this.prevTime) ? time - this.prevTime : time
    this.prevTime = time
    
    if (this.initialised) {
      this.play(timeStep)
      this.paint()
    } else {
      this.initialisationCheck()
    }
    
    this.nextFrame = window.requestAnimationFrame(this.main.bind(this))
  }
  
  play (timeStep) {
    if (!this.interactionUI) {
      this.entities.forEach(entity => entity.play(timeStep))
      this.checkCollisions(timeStep)
    }
  }
  
  paint () {
    const c2d = this.canvas2d
    const camera = this.camera
    
    // Camera Controls: focus the camera on the target entity, if any.
    if (camera.target) {
      camera.x = this.canvasWidth / 2 - camera.target.x
      camera.y = this.canvasHeight / 2 - camera.target.y
    }
    
    c2d.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    
    c2d.strokeStyle = 'rgba(128, 128, 128, 0.5)'
    c2d.lineWidth = 1
    
    // Draw grid
    for (let row = 0 ; row < GRID_HEIGHT ; row ++) {
      for (let col = 0 ; col < GRID_WIDTH ; col ++) {
        c2d.beginPath()
        c2d.rect(col * TILE_SIZE + camera.x, row * TILE_SIZE + camera.y, TILE_SIZE, TILE_SIZE)
        c2d.stroke()
      }
    }
    
    // Draw entities
    this.entities.forEach(entity => entity.paint())
    
    // Draw player input
    if (this.playerAction === PLAYER_ACTIONS.PULLING
        && this.hero
        && this.playerInput.pointerCurrent
       ) {
      
      const inputCoords = this.playerInput.pointerCurrent
      
      c2d.strokeStyle = '#888'
      c2d.lineWidth = TILE_SIZE / 8
      
      c2d.beginPath()
      c2d.moveTo(this.hero.x + camera.x, this.hero.y + camera.y)
      c2d.lineTo(inputCoords.x, inputCoords.y)
      c2d.stroke()
      c2d.beginPath()
      c2d.arc(inputCoords.x, inputCoords.y, ACCEPTABLE_INPUT_DISTANCE_FROM_HERO, 0, 2 * Math.PI)
      c2d.stroke()
      
      const arrowCoords = {
        x: this.hero.x - (inputCoords.x - this.hero.x) + camera.x,
        y: this.hero.y - (inputCoords.y - this.hero.y) + camera.y,
      }
      c2d.strokeStyle = '#e42'
      c2d.lineWidth = TILE_SIZE / 8
      
      c2d.beginPath()
      c2d.moveTo(this.hero.x + camera.x, this.hero.y + camera.y)
      c2d.lineTo(arrowCoords.x + camera.x, arrowCoords.y + camera.y)
      c2d.stroke()
    }
  }
  
  /*
  Section: UI and Event Handling
  ----------------------------------------------------------------------------
   */
  
  initialiseUI () {
    this.html.canvas.width = this.canvasWidth
    this.html.canvas.height = this.canvasHeight
    
    this.html.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this))
    this.html.canvas.addEventListener('pointermove', this.onPointerMove.bind(this))
    this.html.canvas.addEventListener('pointerup', this.onPointerUp.bind(this))
    this.html.canvas.addEventListener('pointercancel', this.onPointerUp.bind(this))
    
    // Prevent "touch and hold to open context menu" interaction on touchscreens.
    this.html.canvas.addEventListener('touchstart', stopEvent)
    this.html.canvas.addEventListener('touchmove', stopEvent)
    this.html.canvas.addEventListener('touchend', stopEvent)
    this.html.canvas.addEventListener('touchcancel', stopEvent)
    
    this.html.buttonHome.addEventListener('click', this.buttonHome_onClick.bind(this))
    this.html.buttonFullscreen.addEventListener('click', this.buttonFullscreen_onClick.bind(this))
    
    window.addEventListener('resize', this.updateUI.bind(this))
    this.updateUI()
  }
  
  updateUI () {
    // Fit the Interaction layer to the canvas
    const canvasBounds = this.html.canvas.getBoundingClientRect()
    this.html.interaction.style.width = `${canvasBounds.width}px`
    this.html.interaction.style.height = `${canvasBounds.height}px`
    this.html.interaction.style.top = '0'
    this.html.interaction.style.left = `${canvasBounds.left}px`
  }
  
  setInteractionUI (interactionUI) {
    this.interactionUI = interactionUI
    if (interactionUI) {
      this.html.interaction.style.visibility = 'visible'
    } else {
      this.html.interaction.style.visibility = 'hidden'
    }
  }
  
  onPointerDown (e) {
    const coords = getEventCoords(e, this.html.canvas)
    const camera = this.camera
    
    this.playerInput.pointerStart = undefined
    this.playerInput.pointerCurrent = undefined
    this.playerInput.pointerEnd = undefined
    
    if (this.hero) {
      const distX = this.hero.x - coords.x + camera.x
      const distY = this.hero.y - coords.y + camera.y
      const distFromHero = Math.sqrt(distX * distX + distY + distY)
      const rotation = Math.atan2(distY, distX)
      
      if (distFromHero < ACCEPTABLE_INPUT_DISTANCE_FROM_HERO) {
        this.playerAction = PLAYER_ACTIONS.PULLING
        this.playerInput.pointerStart = coords
        this.playerInput.pointerCurrent = coords
      }
    }
    
    return stopEvent(e)
  }
  
  onPointerMove (e) {
    const coords = getEventCoords(e, this.html.canvas)
    this.playerInput.pointerCurrent = coords
    
    if (this.playerAction === PLAYER_ACTIONS.PULLING) {
      // ...
    }
    
    return stopEvent(e)
  }
  
  onPointerUp (e) {
    const coords = getEventCoords(e, this.html.canvas)
    
    if (this.playerAction === PLAYER_ACTIONS.PULLING) {
      this.playerInput.pointerEnd = coords
      this.playerAction = PLAYER_ACTIONS.IDLE
      this.shoot()
    }
    
    return stopEvent(e)
  }
  
  buttonHome_onClick () {
    this.setInteractionUI(!this.interactionUI)
  }
  
  buttonFullscreen_onClick () {
    const isFullscreen = document.fullscreenElement
    if (!isFullscreen) {
      if (this.html.main.requestFullscreen) {
        this.html.main.className = 'fullscreen'
        this.html.main.requestFullscreen()
      }
    } else {
      document.exitFullscreen?.()
      this.html.main.className = ''
    }
    this.updateUI()
  }
  
  /*
  Section: Gameplay
  ----------------------------------------------------------------------------
   */
  
  resetLevel () {
    this.hero = undefined
    this.entities = []
    this.camera = {
      target: null, x: 0, y: 0,
    }
    this.playerAction = PLAYER_ACTIONS.IDLE
  }
  
  loadLevel (level = 0) {
    this.resetLevel()
    
    this.hero = new Hero(this, 7, 7)
    this.entities.push(this.hero)
    this.camera.target = this.hero
    
    this.entities.push(new Goal(this, 20, 7))
    
    this.entities.push(new Wall(this, 0, 0, 1, 15)) // West Wall
    this.entities.push(new Wall(this, 26, 0, 1, 15)) // East Wall
    this.entities.push(new Wall(this, 1, 0, 25, 1)) // North Wall
    this.entities.push(new Wall(this, 1, 14, 25, 1)) // South Wall
    
    // Rearrange: 
    this.entities.sort((a, b) => a.z - b.z)
  }
  
  shoot () {
    if (!this.hero || !this.playerInput.pointerCurrent) return
    
    const camera = this.camera
    
    const inputCoords = this.playerInput.pointerCurrent
    const directionX = this.hero.x - inputCoords.x + camera.x
    const directionY = this.hero.y - inputCoords.y + camera.y
    const dist = Math.sqrt(directionX * directionX + directionY * directionY)
    const rotation = Math.atan2(directionY, directionX)

    const MAX_PULL_DISTANCE = TILE_SIZE * 4
    const intendedMovement = dist / MAX_PULL_DISTANCE * this.hero.moveMaxSpeed
    const movementSpeed = Math.min(
      intendedMovement,
      this.hero.moveMaxSpeed
    )
    
    console.log('MOVEMENT SPEED: ', movementSpeed)
    console.log(`STARTING COORDS: ${this.hero.x}, ${this.hero.y}`)
    
    this.hero.speedX = Math.cos(rotation) * movementSpeed
    this.hero.speedY = Math.sin(rotation) * movementSpeed
  }
    
  /*
  Section: Misc
  ----------------------------------------------------------------------------
   */
  
  checkCollisions (timeStep) {
    for (let a = 0 ; a < this.entities.length ; a++) {
      let entityA = this.entities[a]
      
      for (let b = a + 1 ; b < this.entities.length ; b++) {
        let entityB = this.entities[b]
        let collisionCorrection = Physics.checkCollision(entityA, entityB)
        
        if (collisionCorrection) {
          entityA.onCollision(entityB, collisionCorrection.a)
          entityB.onCollision(entityA, collisionCorrection.b)
        }
      }
    }  
  }
}

function getEventCoords (event, element) {
  const xRatio = (element.width && element.offsetWidth) ? element.width / element.offsetWidth : 1
  const yRatio = (element.height && element.offsetHeight) ? element.height / element.offsetHeight : 1
  
  const x = event.offsetX * xRatio
  const y = event.offsetY * yRatio
  return { x, y }
}

function stopEvent (e) {
  if (!e) return false
  e.preventDefault && e.preventDefault()
  e.stopPropagation && e.stopPropagation()
  e.returnValue = false
  e.cancelBubble = true
  return false
}

export default CNY2021