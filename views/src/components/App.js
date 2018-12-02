import React from 'react';
import { Tabs } from 'antd';
import Nas from './Nas';
import Pac from './Pac';

const TabPane = Tabs.TabPane;

export default () => (
  <Tabs tabBarStyle={{ margin: 10 }}>
    <TabPane key="NAS" tab="NAS">
      <Nas />
    </TabPane>
    <TabPane key="PAC" tab="PAC">
      <Pac />
    </TabPane>
  </Tabs>
);
