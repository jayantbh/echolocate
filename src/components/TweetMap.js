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
      initialized: false
    }
  }
  render() {
    return (
      <div>
        <Map
          style={this.state.style}
          center={this.state.center}
          zoom={this.state.zoom}
          onZoom={(e) => console.log(e.style.z)}
          containerStyle={this.state.containerStyle}
          >
            {
              this.props.tweets.map((tweet, i) =>
                <Popup
                  key={i}
                  className="tweet-popup"
                  coordinates={tweet.point}
                  onScroll={e => console.log(e.deltaY)}
                  onWheel={e => console.log(e.deltaY, e.deltaX)}
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
