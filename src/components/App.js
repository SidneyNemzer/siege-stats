/* global Tesseract */

import React, { Component } from 'react'
import { mapPromiseSync } from '../util'
import { playerNameLocations } from '../constants'
import '../style/App.css';

import Paster from './Paster'
import Loader from './Loader'
import Verify from './Verify'
import Info from './Info'

/* Stages of application
1. paste -- ask user to paste an image
2. scan -- 'read' the image, looking for all 12 names
3. verify -- ask user to confirm each player name, correcting the name if necessary
4. info -- display info for each player (asyncronously loading info before displaying)
 */

 const progressStatus = {
   initialize: [
     'load image',
     'loading tesseract core',
     'initializing tesseract',
     'loading eng.traineddata'
   ],
   running: [
     'initializing api',
     'recognizing text'
   ]
 }

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stage: 'paste',
      imageSource: null,
      progress: null,
      lastProgress: null
    }

    this.handleConfirmNames = this.handleConfirmNames.bind(this)
  }

  progress(data) {
    if (progressStatus.initialize.includes(data.status)) {
      this.setState(prevState => {
        prevState.progress[data.status] = data.progress
        prevState.progress.initialize =
          progressStatus.initialize.reduce((accum, status) =>
            accum + (prevState.progress[status] || 0),
            0
          )
        prevState.lastProgress = data.status
        return prevState
      })
    } else if (progressStatus.running.includes(data.status)) {
      this.setState(prevState => {
        prevState.progress[data.status] = data.progress
        if (prevState.lastProgress === 'recognizing text' && data.status === 'initializing api') {
          prevState.progress.nameIndex++
          prevState.progress['initializing api'] = data.progress
          prevState.progress['recognizing text'] = 0
          prevState.lastProgress = 'initializing api'
        } else {
          prevState.progress[data.status] = data.progress
          prevState.lastProgress = data.status
        }
        prevState.progress.currentName =
          progressStatus.running.reduce((accum, status) =>
            accum + (prevState.progress[status] || 0),
            0
          )
        return prevState
      })
    } else {
      console.warn(`Ignoring status "${data.status}"`)
    }
  }

  scanImage() {
    this.setState({
      progress: {
        initialize: 0,
        currentName: 0,
        nameIndex: 0
      }
    }, () => {
      this.progress({
        status: 'load image',
        progress: 0
      })
      const nameScale = 15
      const scoreboardCanvas = document.createElement('canvas')
      scoreboardCanvas.width = 1920
      scoreboardCanvas.height = 1080
      const context = scoreboardCanvas.getContext('2d')
      const scoreboardImage = new Image()
      scoreboardImage.addEventListener('load', () => {
        this.progress({
          status: 'load image',
          progress: 0.5
        })
        const newWidth = scoreboardImage.width / scoreboardImage.height * scoreboardCanvas.height
        context.drawImage(scoreboardImage, 0, 0, newWidth, scoreboardCanvas.height)
        this.progress({
          status: 'load image',
          progress: 1
        })

        const subCanvas = document.createElement('canvas')
        const subContext = subCanvas.getContext('2d')

        mapPromiseSync(location => {
          subCanvas.width = location.width * nameScale
          subCanvas.height = location.height * nameScale
          subContext.drawImage(
            scoreboardCanvas,
            scoreboardCanvas.width * location.x,
            scoreboardCanvas.height * location.y,
            location.width,
            location.height,
            0,
            0,
            location.width * nameScale,
            location.height * nameScale
          )
          return new Promise(resolve =>
            Tesseract.recognize(subCanvas, {
              tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_.-'
            }).progress(packet => {
              this.progress(packet)
            })
              .then(result => resolve(result))
          )
        }, playerNameLocations).then(names => {
          console.log(names)
          return names
        }).then(names => {
          this.setState({
            names,
            stage: 'verify',
            scoreboardCanvas
          })
        })

      })
      scoreboardImage.src = this.state.imageSource
    })
  }

  handleGotImage(imageSource) {
    this.setState(
      {
        stage: 'scan',
        imageSource,
        progress: {}
      },
      this.scanImage
    )
  }

  handleConfirmNames(newNames) {
    this.setState({
      names: newNames,
      stage: 'info'
    })
  }

  renderStage() {
    const { state } = this
    switch(state.stage) {
      case 'paste':
        return (
          <Paster
            handleGotImage={this.handleGotImage.bind(this)}
          />
        )

      case 'scan':
        const numPlayers = playerNameLocations.length
        const initializeStages = progressStatus.initialize.length
        const runningStages = progressStatus.running.length
        const completedPlayers = state.progress.nameIndex
        const currentPlayer =
          completedPlayers
            ? completedPlayers
            : 1
        const progress =
          (state.progress.initialize + (state.progress.currentName / runningStages) + completedPlayers) / (initializeStages + numPlayers)

        const subheading =
          state.progress.initialize
            ? state.progress.initialize < progressStatus.initialize.length
              ? 'Initializing...'
              : ('Reading player ' + (currentPlayer + 1))
            : 'Initializing...'

        return (
          <Loader
            heading="Reading names..."
            subheading={subheading}
            progress={progress * 100}
          />
        )

      case 'verify':
        return (
          <Verify
            names={this.state.names}
            scoreboardCanvas={this.state.scoreboardCanvas}
            confirmNames={this.handleConfirmNames}
          />
        )

      case 'info':
        return (
          <Info
            names={this.state.names}
          />
        )

      default:
        return (
          <div>
            Unknown stage: {this.state.stage}
          </div>
        )
    }
  }

  render() {
    return (
      <div className="App">
        {this.renderStage()}
      </div>
    );
  }
}

export default App;
