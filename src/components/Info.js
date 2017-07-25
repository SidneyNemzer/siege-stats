import React, { Component } from 'react'

import PlayerInfo from './PlayerInfo'

class Verify extends Component {
  render() {
    return (
      <div className="info">
        <div className="friendly">
          {
            this.props.names.slice(0, 5).map(
              name =>
                <PlayerInfo
                  name={name.text}
                  key={name.text}
                />
            )
          }
        </div>
        <div className="enemy">
          {
            this.props.names.slice(5).map(
              name =>
                <PlayerInfo
                  name={name.text}
                  key={name.text}
                />
            )
          }
        </div>
      </div>
    )
  }
}

export default Verify
