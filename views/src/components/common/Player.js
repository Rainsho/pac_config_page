import React, { Component } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

class Player extends Component {
  defaultOptions(src) {
    return {
      autoplay: true,
      controls: true,
      playbackRates: [0.5, 0.8, 1, 1.2, 2],
      sources: [{ src, type: 'video/mp4' }],
    };
  }

  componentDidMount() {
    this.player = videojs(this.el, this.defaultOptions(this.props.src));
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  render() {
    return (
      <div style={{ width: '100%' }} data-vjs-player>
        <video ref={el => (this.el = el)} className="video-js" />
      </div>
    );
  }
}

export default Player;
