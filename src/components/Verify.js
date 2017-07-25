import React, { Component } from 'react'

import { playerNameLocations } from '../constants'

class Verify extends Component {
  constructor(props) {
    super(props)
    this.state = {
      names: props.names,
      currentName: 0,
      scoreboardCanvas: props.scoreboardCanvas,
      currentInput: props.names[0].text
    }

    this.handleNext = this.handleNext.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  updateCanvas() {
    const scale = 3
    const { currentName, scoreboardCanvas } = this.state
    const { canvas } = this.refs
    const context = canvas.getContext('2d')
    const location = playerNameLocations[currentName]

    canvas.width = location.width * scale
    canvas.height = location.height * scale
    context.drawImage(
      scoreboardCanvas,
      scoreboardCanvas.width * location.x,
      scoreboardCanvas.height * location.y,
      location.width,
      location.height,
      0,
      0,
      location.width * scale,
      location.height * scale
    )
  }

  componentDidMount() {
    this.updateCanvas()
    this.refs.input.focus()
  }

  componentDidUpdate() {
    this.updateCanvas()
    this.refs.input.focus()
  }

  handleNext() {
    const { currentName, names } = this.state

    if (currentName + 1 < names.length) {
      this.setState(prevState => {

        prevState.names[currentName].text = this.state.currentInput
        prevState.currentName++
        prevState.currentInput = prevState.names[prevState.currentName].text

      })
    } else {
      this.props.confirmNames(names)
    }
  }

  handleInputChange(event) {
    this.setState({
      currentInput: event.target.value
    })
  }

  render() {
    return (
      <div className="verify">
        <h1>Confirm player {this.state.currentName + 1}</h1>
        <div>
          <canvas
            ref="canvas"
          />
        </div>
        <input
          type="text"
          ref="input"
          value={this.state.currentInput}
          onChange={this.handleInputChange}
          onKeyPress={
            event => {
              if (event.key === 'Enter')
                this.handleNext()
            }
          }
        />
        <button
          onClick={this.handleNext}
        >
          Next
        </button>
      </div>
    )
  }
}

export default Verify
