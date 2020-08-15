import React, { PureComponent, createRef } from 'react';
import { Card, Button, Input, message } from 'antd';
import { getPings, getAriports, updateAirport, flushAirports } from '../utils/api';
import { PingInfo } from './common';

class Pac extends PureComponent {
  state = {
    loading: true,
    updating: false,
    current: null,
    servers: [],
    pingInfos: {},
  };

  el = createRef(null);

  componentDidMount() {
    this.getServers();
  }

  getServers = () => {
    getAriports().then(({ current, servers }) =>
      this.setState({ current, servers, loading: false })
    );
  };

  handlePing = () => {
    this.setState({ updating: true }, () => {
      getPings().then((pings = []) => {
        const pingInfos = pings.reduce((info, res) => Object.assign(info, { [res.ps]: res }), {});
        this.setState({ pingInfos, updating: false });
      });
    });
  };

  switchServer = ps => {
    if (this.state.updating) return;

    this.setState({ updating: true }, () => {
      updateAirport(ps).then(({ current }) => {
        this.setState({ current, updating: false });
      });
    });
  };

  flushConfig = () => {
    const vmess = (this.el.current.state.value || '').trim();

    if (!vmess) return;

    this.setState({ updating: true }, () => {
      flushAirports(vmess).then(({ servers }) => {
        message.success(`updated ${servers.length} servers`);
        this.setState({ updating: false, servers });
      });
    });
  };

  render() {
    const { loading, updating, current, servers, pingInfos } = this.state;

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
        <Card title="Airports Info" style={{ display: servers.length ? 'block' : 'none' }}>
          {servers.map(({ ps }) => (
            <PingInfo
              key={ps}
              current={current}
              ps={ps}
              pingInfo={pingInfos[ps]}
              handleSwitch={this.switchServer}
            />
          ))}
        </Card>
        <Card title="Update List" style={{ marginTop: 16 }}>
          <Button
            type="danger"
            loading={updating}
            onClick={this.flushConfig}
            style={{ marginBottom: 10 }}
          >
            update list
          </Button>
          <Input.TextArea
            ref={this.el}
            placeholder="base64:vmess"
            autoSize={{ minRows: 3, maxRows: 10 }}
          />
        </Card>
      </Card>
    );
  }
}

export default Pac;
