import React, { Component } from 'react';
import './App.css';

import TweetMap from './components/TweetMap';

import { serializeResponse } from './helpers/processWebsocketServerResponse';
import { centerOfAPolygon } from './helpers/utils';

const websocketUrl = () => {
  try {
    if (window.location.hostname === 'localhost') return `ws://${window.location.hostname}:8888/`;
    else return `ws://${window.location.search.split('=')[1]}/`;
  } catch (e) {
    alert('WebSocket URL could not be obtained. Use `?ws=<websocket url>` to specify WebSocket connection.');
  }
}

let ws;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      track: '',
      tweets: [],
      limit: 10,
      arrayLimit: 10000
    }
    this.openConnection();
  }
  openConnection() {
    const socket = new WebSocket(websocketUrl());

    socket.addEventListener('message', ({ data }) => this.handleResponse(data));
    socket.addEventListener('open', () => this.setState({ isConnected: true }));
    socket.addEventListener('close', () => { 
      this.setState({ isConnected: false });

      setTimeout(() => {
        this.openConnection();
      }, 2000);
    });

    ws = socket;
  }
  handleResponse(payload) {
    const { data, type } = serializeResponse(payload);

    switch(type) {
      case 'connection_start':
        this.setState({ isConnected: data.connected });
        break;

      case 'twitter_error':
        console.error(data);
        break;

      case 'twitter_response':
        this.setState({ count: this.state.count + 1});

        if (data.coordinates || data.place) {
          const tweets = this.state.tweets.slice(-1 * this.state.arrayLimit);
          let { text, coordinates, place } = data;
          let { full_name, bounding_box } = place;
          coordinates = coordinates ? coordinates.coordinates : null;

          let point = coordinates || centerOfAPolygon(bounding_box.coordinates[0]);
          tweets.push({ text, full_name, point });
          this.setState({ tweets });
        }
        break;

      default: return;
    }
  }
  lastFewTweets = () => this.state.tweets.slice(-1 * this.state.limit)

  updateTrackingTerm(e, form) {
    e.preventDefault();
    const value = e.currentTarget['tracking-term'].value;

    ws.send(JSON.stringify({ type: 'tracking_term', data: value }));
    this.setState({ track: value });
  }

  render() {
    return (
      <div>
        <TweetMap tweets={this.lastFewTweets()} />
        <div className="overlay-interface">
          <div className="info-box">
            <div className="info-box-header">Info</div>
            <table className="info-box-content">
              <tbody>
                <tr>
                  <td>Connection status:</td>
                  <td>{this.state.isConnected ? 'Connected' : 'Disconnected'}</td>
                </tr>
                <tr>
                  <td>Tweets processed:</td>
                  <td>{this.state.count}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <form className="tracking-term-component" onSubmit={(e, form) => this.updateTrackingTerm(e, form)}>
            <label htmlFor="tracking-term" className="tracking-term-label">Search Term</label>
            <div className="tracking-term-input">
              <input id="tracking-term"
                name="tracking-term"
                placeholder="Enter tracking term here..."
                value={this.state.track}
                onInput={({ target: { value } }) => this.setState({ track: value })}
              />
              <button className="update-term-button" type="submit">➤</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default App;
