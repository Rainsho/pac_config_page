import React from 'react';
import { Row, Col, Switch } from 'antd';
import Color from './Color';

const PingInfo = ({ current, info, handleSwitch }) => {
  const { host, avg } = info;

  return (
    <Row type="flex" style={{ minHeight: 30 }}>
      <Col sm={4} lg={2}>
        {current === host ? (
          <Switch checked />
        ) : (
          <Switch onClick={() => handleSwitch(current, host)} />
        )}
      </Col>
      <Col sm={8} lg={4}>
        <Color.WhatBlue str="host" />
        {host}
      </Col>
      <Col xs={24} sm={8} lg={4}>
        <Color.LivingCoral str="avg_ping" />
        {avg} ms
      </Col>
    </Row>
  );
};

export default PingInfo;
