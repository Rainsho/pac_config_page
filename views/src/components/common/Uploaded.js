import React from 'react';
import { List } from 'antd';
import Color from './Color';

const Uploaded = ({ files }) => {
  return (
    <List
      size="small"
      bordered
      style={{ marginBottom: 10 }}
      header={<div>UPLOADED</div>}
      dataSource={files}
      renderItem={({ id, time }) => (
        <List.Item>
          <Color.LivingCoral str="time" />
          <span style={{ width: 160 }}>{time}</span>
          <Color.WhatBlue str="file" />
          <span style={{ width: 160 }}>{id}</span>
        </List.Item>
      )}
    />
  );
};

export default Uploaded;
