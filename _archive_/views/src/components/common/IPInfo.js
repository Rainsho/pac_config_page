import React from 'react';
import { List, Row, Col } from 'antd';
import { isIP } from '../../utils/util';
import Color from './Color';

const mainSize = { xs: 24, sm: 8, xl: 6 };
const textSize = { md: { offset: 2, span: 18 }, lg: { offset: 0, span: 20 } };

const IPInfo = ({ s, t, i }) => {
  return (
    <List.Item>
      <Row type="flex" style={{ width: '100%' }}>
        <Col {...mainSize}>
          <Col span={4}>
            <Color.WhatBlue str="start" />
          </Col>
          <Col {...textSize}>
            <span>{s}</span>
          </Col>
        </Col>
        <Col {...mainSize}>
          <Col span={4}>
            <Color.WhatBlue str="end" />
          </Col>
          <Col {...textSize}>
            <span>{t}</span>
          </Col>
        </Col>
        <Col {...mainSize}>
          <Col span={4}>
            {isIP(i) ? <Color.Green str="ip" /> : <Color.LivingCoral str="error" />}
          </Col>
          <Col {...textSize}>
            <span>{i}</span>
          </Col>
        </Col>
      </Row>
    </List.Item>
  );
};

export default IPInfo;
