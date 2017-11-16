import React, { Component } from 'react';
import ReactMapboxGl, { Popup } from "react-mapbox-gl";
import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';

import './TweetMap.css';
import MAPBOX_PUBLIC_KEY from '../mapbox-key';

const Map = ReactMapboxGl({
  accessToken: MAPBOX_PUBLIC_KEY
});

export default class TweetMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style: 'mapbox://styles/jayantbhawal/cj9yiw8tw7nmi2rlu2nnqzndd',
      zoom: [2],
      center: [0,20],
      containerStyle: {
        height: "100vh",
        width: "100vw"
      },
      currentZoom: 2
    }
  }
  handleZoom(e) {
    e.preventDefault();
    console.log(e.deltaY, this.state.currentZoom)
    this.setState({ zoom: [this.state.currentZoom + (-1 * e.deltaY/3)] })
    // this.setState({ zoom: [4] })
  }
  handleMapZoom(e) {
    this.setState({ currentZoom: e.style.z })
  }
  handleHover(e, point) {
    this.setState({ center: point })
  }
  render() {
    return (
      <div>
        <Map
          style={this.state.style}
          center={this.state.center}
          zoom={this.state.zoom}
          onZoom={(e) => this.handleMapZoom(e)}
          containerStyle={this.state.containerStyle}
          >
            {
              this.props.tweets.map((tweet, i) =>
                <Popup
                  key={i}
                  className="tweet-popup"
                  coordinates={tweet.point}
                  onMouseEnter={(e) => this.handleHover(e, tweet.point)}
                  onScroll={(e) => this.handleZoom(e)}
                  onWheel={(e) => this.handleZoom(e)}
                >
                  <span>{tweet.text}</span>
                </Popup>
              )
            }
        </Map>
      </div>
    );
  }
}
