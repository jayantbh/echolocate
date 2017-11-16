import React, { Component } from 'react';
import './App.css';

import TweetMap from './components/TweetMap';
import InfoBox from './components/InfoBox';

import { centerOfAPolygon } from './helpers/utils';

let WS;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      track: '',
      tweets: [],
      limit: 20,
      arrayLimit: 10000
    }
  }
  handleResponse({ data, type, count }) {
    if (data.coordinates || data.place) {
      const tweets = this.state.tweets.slice(-1 * this.state.arrayLimit);
      let { text, coordinates, place } = data;
      let { full_name, bounding_box } = place;
      coordinates = coordinates ? coordinates.coordinates : null;

      let point = coordinates || centerOfAPolygon(bounding_box.coordinates[0]);
      tweets.push({ text, full_name, point, count });
      this.setState({ tweets });
    }
  }
  lastFewTweets = () => this.state.tweets.slice(-1 * this.state.limit)

  updateTrackingTerm(e, form) {
    e.preventDefault();
    const value = e.currentTarget['tracking-term'].value;

    WS.send(JSON.stringify({ type: 'tracking_term', data: value }));
    this.setState({ track: value });
  }

  render() {
    return (
      <div>
        <TweetMap tweets={this.lastFewTweets()} />
        <div className="overlay-interface">
          <InfoBox onConnection={(ws) => WS = ws} onResponse={(...args) => this.handleResponse(...args)}/>
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
