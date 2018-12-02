import React, { Component } from 'react';
import { Card, Button } from 'antd';
import { updateAddress, getAddress, getPing, updateConfig } from '../utils/api';
import PingInfo from './PingInfo';
import ConfigInfo from './ConfigInfo';

class Pac extends Component {
  state = {
    loading: true,
    updating: false,
    address: {},
    currentHost: '',
    pingInfo: [],
  };

  componentDidMount() {
    getAddress().then(address => this.setState({ address, loading: false }));
  }

  updateAddress = () => {
    // it's fast, do not need show loading
    updateAddress().then(address => this.setState({ address }));
  };

  handlePing = () => {
    this.setState({ updating: true }, () => {
      getPing().then(({ currentHost, pingInfo }) =>
        this.setState({ currentHost, pingInfo, updating: false })
      );
    });
  };

  switchServer = (cur, min) => {
    this.setState({ updating: true }, () => {
      updateConfig(cur, min).then(({ currentHost }) => {
        this.setState({ currentHost, updating: false });
      });
    });
  };

  render() {
    const { loading, updating, address, currentHost, pingInfo } = this.state;

    return (
      <Card
        title="Nexus Pac System"
        bordered={false}
        loading={loading}
        extra={
          <>
            <Button
              type="primary"
              loading={updating}
              onClick={this.handlePing}
              style={{ marginRight: 10 }}
            >
              ping
            </Button>
          </>
        }
      >
        <Card title="Pac Config Info">
          <ConfigInfo updating={updating} address={address} updateAddress={this.updateAddress} />
        </Card>
        <Card
          title="Server Ping Info"
          loading={updating}
          style={{ marginTop: 16, display: pingInfo.length ? 'block' : 'none' }}
        >
          {pingInfo.map(info => (
            <PingInfo current={currentHost} info={info} handleSwitch={this.switchServer} />
          ))}
        </Card>
      </Card>
    );
  }
}

export default Pac;
