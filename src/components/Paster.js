import React, { Component } from 'react'

class Paster extends Component {
  constructor(props)  {
    super(props)
    this.state = {
      imageSource: null
    }

    this.handlePaste = this.handlePaste.bind(this)
  }

  handlePaste(event) {
    const { clipboardData } = event
    if (clipboardData && clipboardData.items) {
      Array.from(clipboardData.items).forEach(item => {
        if (item.type.includes('image')) {
          this.setState({
            imageSource: URL.createObjectURL(item.getAsFile())
          })
        }
      })
    }
  }

  componentDidMount() {
    document.addEventListener('paste', this.handlePaste)
  }

  componentWillUnmount() {
    document.removeEventListener('paste', this.handlePaste)
  }

  render() {
    if (this.state.imageSource) {
      return (
        <div className="paste-box pasted">
          <h2>You pasted this image</h2>
          <img src={this.state.imageSource} alt="" />
          <div className="options">
            <span>Paste another or</span>
            <button
              onClick={() => this.props.handleGotImage(this.state.imageSource)}
            >
              Next
            </button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="paste-box">
          <h1>Paste an image of the scoreboard</h1>
        </div>
      )
    }
  }
}

export default Paster
