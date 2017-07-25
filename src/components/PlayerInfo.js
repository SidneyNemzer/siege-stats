import React, { Component } from 'react'

class PlayerInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      level: null,
      loading: true,
      error: null
    }
  }

  componentDidMount() {
    fetch(`https://api.r6stats.com/api/v1/players/${this.props.name}?platform=uplay`)
      .then(response => response.json())
      .then(data => {
        const { player, errors } = data
        if (player) {
          this.setState({
            level: player.stats.progression.level,
            loading: false
          })
        } else {
          if (errors) {
            if (errors.find(error => error.reference === 'player_not_found')) {
              this.setState({
                loading: false,
                error: 'Player not found'
              })
            } else {
              this.setState({
                loading: false,
                error: errors[0].detail
              })
            }
          } else {
            this.setState({
              loading: false,
              error: 'Unexpected JSON: ' + data
            })
          }
        }
      }).catch(error => {
        this.setState({
          error: error.toString(),
          loading: false
        })
      })

  }

  render() {
    if (this.state.loading) {
      return (
        <div>
          <h3>{this.props.name}</h3>
          <span>Loading...</span>
        </div>
      )
    } else if (this.state.error) {
      return (
        <div>
          <h3>{this.props.name}</h3>
          <pre className="error">Error: {this.state.error}</pre>
        </div>
      )
    } else {
      return (
        <div>
          <h3>{this.props.name}</h3>
          <span>{this.state.level}</span>
        </div>
      )
    }
  }
}

export default PlayerInfo
