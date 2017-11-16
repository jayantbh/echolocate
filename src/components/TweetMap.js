import React, { Component } from 'react';
import ReactMapboxGl, { Marker } from "react-mapbox-gl";

import '../../node_modules/mapbox-gl/dist/mapbox-gl.css';

import './TweetMap.css';
import logo from '../twitter.svg';

import MAPBOX_PUBLIC_KEY from '../mapbox-key';

const Map = ReactMapboxGl({
  accessToken: MAPBOX_PUBLIC_KEY
});

export default class TweetMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      style: 'mapbox://styles/jayantbhawal/cj9yiw8tw7nmi2rlu2nnqzndd',
      zoom: [1],
      center: [0,20],
      maxBounds: [[-180, -60], [180, 80]],
      containerStyle: {
        height: "100vh",
        width: "100vw"
      },
      popupLimit: 7
    }
  }
  centerOnPoint(point, zoom) {
    this.setState({ center: point, zoom: [zoom] });
  }
  handlePopupAutoShow(el, tweet) {
    if (!el) return;
    const show = this.props.tweets.slice(-1 * this.state.popupLimit).includes(tweet);
    setTimeout(() => {
      el.classList.toggle('active', show)
    }, 300);
  }
  handleMarkerAddition(el) {
    if (!el) return;
    setTimeout(() => {
      el.classList.remove('shrink');
    }, 100);
  }
  render() {
    return (
      <div>
        <Map
          style={this.state.style}
          center={this.state.center}
          zoom={this.state.zoom}
          maxBounds={this.state.maxBounds}
          containerStyle={this.state.containerStyle}
          >
            {
              this.props.tweets.map((tweet, i) => {
                return (
                  <Marker
                    key={tweet.count}
                    coordinates={tweet.point}
                    anchor="bottom"
                    className="marker-component"
                    onClick={() => this.centerOnPoint(tweet.point, 11)}
                  >
                    <div className="twitter-marker shrink" ref={(el) => this.handleMarkerAddition(el)}>
                      <img src={logo} alt="marker"/>
                    </div>
                    <div className="twitter-marker--content" ref={(el) => this.handlePopupAutoShow(el, tweet)}><span>{tweet.text}</span></div>
                  </Marker>
                );
              })
            }
        </Map>
      </div>
    );
  }
}
