import React from 'react';
import { Row, Col, Switch } from 'antd';
import Color from './Color';

const PingInfo = ({ current, ps, pingInfo, handleSwitch }) => {
  const { alive, avg } = pingInfo || {};

  return (
    <Row type="flex" style={{ minHeight: 30 }}>
      <Col xs={6} sm={4} md={3}>
        {current === ps ? (
          <Switch checked />
        ) : (
          <Switch checked={false} onClick={() => handleSwitch(ps)} />
        )}
      </Col>
      <Col xs={18} sm={8} md={12} lg={10} xl={6}>
        <Color.WhatBlue str="host" />
        {ps}
      </Col>
      {pingInfo && (
        <Col xs={{ offset: 6, span: 20 }} sm={{ offset: 0, span: 8 }} md={6}>
          {alive ? (
            <>
              <Color.LivingCoral str="ping" />
              {avg} ms
            </>
          ) : (
            <Color.Black str="RIP" />
          )}
        </Col>
      )}
    </Row>
  );
};

export default PingInfo;
