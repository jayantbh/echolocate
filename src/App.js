import React, { Component } from 'react';
import Websocket from 'react-websocket';
import ReactMapboxGl, { Layer, Feature, Marker, Popup } from "react-mapbox-gl";
import './App.css';
import '../node_modules/mapbox-gl/dist/mapbox-gl.css';
import Logo from './logo.svg';

import MAPBOX_PUBLIC_KEY from './mapbox-key';

import { serializeResponse } from './helpers/processWebsocketServerResponse';
import { centerOfAPolygon } from './helpers/utils';

const Map = ReactMapboxGl({
  accessToken: MAPBOX_PUBLIC_KEY
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      track: null,
      tweets: [],
      limit: 10,
      map: {
        zoom: [2],
        center: [0,20]
      }
    }
  }
  handleResponse(payload) {
    const { data, type } = serializeResponse(payload);

    switch(type) {
      case 'connection_start':
        this.setState({ track: data.track });
        break;

      case 'twitter_error':
        console.error(data);
        break;

      case 'twitter_response':
        this.setState({ count: this.state.count + 1});

        if (data.coordinates || data.place) {
          const tweets = this.state.tweets.slice();
          let { text, coordinates, place, user: { location } } = data;
          let { full_name, bounding_box } = place;
          coordinates = coordinates ? coordinates.coordinates : null;

          let point = coordinates || centerOfAPolygon(bounding_box.coordinates[0]);
          tweets.push({ text, full_name, point });
          this.setState({ tweets });
          break;
        }

      default: return;
    }
  }
  lastFewTweets = () => this.state.tweets.slice(-1 * this.state.limit)
  websocketUrl = () => {
    try {
      if (window.location.hostname === 'localhost') return `ws://${window.location.hostname}:8888/`;
      else return `ws://${window.location.search.split('=')[1]}/`;
    } catch (e) {
      alert('WebSocket URL could not be obtained. Use `?ws=<websocket url>` to specify WebSocket connection.');
    }
  }
  render() {
    return (
      <div>
        <Websocket
          url={this.websocketUrl()}
          onMessage={(payload) => this.handleResponse(payload)}
        />
        <Map
          style="mapbox://styles/jayantbhawal/cj9yiw8tw7nmi2rlu2nnqzndd"
          center={this.state.map.center}
          zoom={this.state.map.zoom}
          containerStyle={{
            height: "80vh",
            width: "100vw"
          }}
          >
            {
              this.lastFewTweets().map((tweet, i) =>
                <Popup
                  key={i}
                  className="tweet-popup"
                  coordinates={tweet.point}>
                  <span>{tweet.text}</span>
                </Popup>
              )
            }
        </Map>
        <h3>Tweets processed: {this.state.count}</h3>
        <pre><code>{JSON.stringify(this.state.tweets, null, '\t')}</code></pre>
      </div>
    );
  }
}

export default App;
