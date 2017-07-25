import React, { Component } from 'react'

class Loader extends Component {
  render() {
    return (
      <div className="loader">
        <h2>{this.props.heading}</h2>
        <h3>{this.props.subheading}</h3>
        <div className="progress-wrapper">
          <div
            className="progress-bar"
            style={{
              width: this.props.progress + '%'
            }}
          >
          </div>
        </div>
      </div>
    )
  }
}

export default Loader
