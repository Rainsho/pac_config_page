import React from 'react';
import { Tabs } from 'antd';
import config from '../utils/config';
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
    <TabPane key="ARIA2" tab="ARIA2">
      <iframe
        title="ARIA2"
        style={{ border: 'none', height: '100vh', width: '100vw' }}
        src={config.ARIA2_UI}
      />
    </TabPane>
  </Tabs>
);
