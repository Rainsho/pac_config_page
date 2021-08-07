import React from 'react';
import { Tabs } from 'antd';
import config from '../utils/config';
import Nas from './Nas';
import Info from './Info';

const TabPane = Tabs.TabPane;

export default () => (
  <Tabs tabBarStyle={{ margin: 10 }}>
    <TabPane key="NAS" tab="NAS">
      <Nas />
    </TabPane>
    <TabPane key="DROPPY" tab="DROPPY">
      <iframe
        title="DROPPY"
        style={{ border: 'none', height: '100vh', width: '100vw' }}
        src={config.DROPPY_PAGE}
      />
    </TabPane>
    <TabPane key="ARIA2" tab="ARIA2">
      <iframe
        title="ARIA2"
        style={{ border: 'none', height: '100vh', width: '100vw' }}
        src={config.ARIA2_PAGE}
      />
    </TabPane>
    <TabPane key="INFO" tab="INFO">
      <Info />
    </TabPane>
  </Tabs>
);
