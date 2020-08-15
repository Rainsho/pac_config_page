import React from 'react';
import { Tag } from 'antd';

export default class Color {
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

  // just seems nice with LivingCoral
  static WhatBlue = Color.tag('#34e1e6');

  static Black = Color.tag('#000');
}
