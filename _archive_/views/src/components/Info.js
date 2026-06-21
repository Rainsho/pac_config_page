import React, { Component } from 'react';
import { Card, Button, List } from 'antd';
import { getSDInfo } from '../utils/api';
import { IPInfo } from './common';

class Info extends Component {
  state = { info: [] };

  componentDidMount() {
    getSDInfo().then((info) => this.setState({ info }));
  }

  update = () => {
    getSDInfo().then((info) => this.setState({ info }));
  };

  flush = () => {
    getSDInfo(true).then((info) => this.setState({ info }));
  };

  render() {
    const { info } = this.state;

    return (
      <Card
        title={`Nexus IP Tracer`}
        bordered={false}
        extra={
          <>
            <Button onClick={this.update} style={{ marginRight: 10 }}>
              update
            </Button>
            <Button onClick={this.flush}>flush</Button>
          </>
        }
      >
        <List
          size="small"
          bordered
          rowKey="s"
          dataSource={info}
          renderItem={(item) => <IPInfo {...item} />}
        />
      </Card>
    );
  }
}

export default Info;
