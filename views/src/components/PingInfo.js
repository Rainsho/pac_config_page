import React from 'react';
import { Tag, Row, Col } from 'antd';

const PingInfo = ({ current, info, handleSwitch }) => {
  const { host, avg } = info;

  return (
    <Row type="flex" style={{ minHeight: 30 }}>
      <Col sm={4} lg={2}>
        {current === host ? (
          <Tag color="#87d068">current</Tag>
        ) : (
          <Tag color="#2db7f5" onClick={() => handleSwitch(current, host)}>
            switch
          </Tag>
        )}
      </Col>
      <Col sm={8} lg={4}>
        host {host}
      </Col>
      <Col xs={24} sm={8} lg={4}>
        avg_ping {avg} ms
      </Col>
    </Row>
  );
};

export default PingInfo;
