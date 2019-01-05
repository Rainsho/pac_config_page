import React from 'react';
import { Row, Col, Switch } from 'antd';
import Color from './Color';

const PingInfo = ({ current, info, handleSwitch }) => {
  const { host, avg } = info;

  return (
    <Row type="flex" style={{ minHeight: 30 }}>
      <Col xs={6} sm={4} xl={3}>
        {current === host ? (
          <Switch checked />
        ) : (
          <Switch onClick={() => handleSwitch(current, host)} />
        )}
      </Col>
      <Col xs={16} sm={8} xl={6}>
        <Color.WhatBlue str="host" />
        {host}
      </Col>
      <Col xs={{ offset: 6, span: 20 }} sm={{ offset: 0, span: 8 }} xl={6}>
        <Color.LivingCoral str="avg_ping" />
        {avg} ms
      </Col>
    </Row>
  );
};

export default PingInfo;
