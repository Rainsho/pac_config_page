import React from 'react';
import { List, Tag } from 'antd';
import { isIP } from '../../utils/util';

class Color {
  static tag(color) {
    return ({ str, ...prop }) => (
      <Tag color={color} {...prop}>
        {str}
      </Tag>
    );
  }

  // it's 2019 PANTONE Color
  // god know what it is...
  static LivingCoral = Color.tag('#fe6f61');

  static Green = Color.tag('#87d068');

  static Red = Color.tag('#f50');
}

const IPInfo = ({ s, t, i }) => {
  return (
    <List.Item>
      <Color.LivingCoral str="start" />
      <span style={{ marginRight: 10 }}>{s}</span>
      <Color.LivingCoral str="end" />
      <span style={{ marginRight: 10 }}>{t}</span>
      {isIP(i) ? <Color.Green str="ip" /> : <Color.Red str="error" />}
      <span>{i}</span>
    </List.Item>
  );
};

export default IPInfo;
