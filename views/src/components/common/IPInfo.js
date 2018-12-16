import React from 'react';
import { List } from 'antd';
import { isIP } from '../../utils/util';
import { Color } from './Color';

const IPInfo = ({ s, t, i }) => {
  return (
    <List.Item>
      <Color.WhatBlue str="start" />
      <span style={{ width: 160 }}>{s}</span>
      <Color.WhatBlue str="end" />
      <span style={{ width: 160 }}>{t}</span>
      {isIP(i) ? <Color.Green str="ip" /> : <Color.LivingCoral str="error" />}
      <span>{i}</span>
    </List.Item>
  );
};

export default IPInfo;
