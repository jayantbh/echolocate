import React, { Component } from 'react';
import './InfoBox.css';
import { serializeResponse } from '../helpers/processWebsocketServerResponse';

const websocketUrl = () => {
  try {
    if (window.location.hostname === 'localhost') return `ws://${window.location.hostname}:8888/`;
    else return `ws://${window.location.search.split('=')[1]}/`;
  } catch (e) {
    alert('WebSocket URL could not be obtained. Use `?ws=<websocket url>` to specify WebSocket connection.');
  }
}

export let ws;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      limit: 20
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
    this.props.onConnection(ws);
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
        const count = this.state.count + 1;
        this.setState({ count });
        this.props.onResponse({ data, type, count });
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
      <div className="info-box">
        <table className="info-box-content">
          <thead>
            <tr>
              <th colSpan="2">Info</th>
            </tr>
          </thead>
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
    );
  }
}

export default App;
