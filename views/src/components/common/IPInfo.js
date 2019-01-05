import React from 'react';
import { List, Row, Col } from 'antd';
import { isIP } from '../../utils/util';
import Color from './Color';

const IPInfo = ({ s, t, i }) => {
  return (
    <List.Item>
      <Row type="flex" style={{ width: '100%' }}>
        <Col xs={24} sm={8} xl={6}>
          <Col span={4}>
            <Color.WhatBlue str="start" />
          </Col>
          <Col span={20}>
            <span>{s}</span>
          </Col>
        </Col>
        <Col xs={24} sm={8} xl={6}>
          <Col span={4}>
            <Color.WhatBlue str="end" />
          </Col>
          <Col span={20}>
            <span>{t}</span>
          </Col>
        </Col>
        <Col xs={24} sm={8} xl={6}>
          <Col span={4}>
            {isIP(i) ? <Color.Green str="ip" /> : <Color.LivingCoral str="error" />}
          </Col>
          <Col span={20}>
            <span>{i}</span>
          </Col>
        </Col>
      </Row>
    </List.Item>
  );
};

export default IPInfo;
