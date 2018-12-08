import React from 'react';
import { List, Button } from 'antd';

const ConfigInfo = ({ updating, address, updateAddress }) => {
  const { onServer, onFile } = address;

  return (
    <List.Item>
      <List.Item.Meta title="当前服务器IP" description={onServer} />
      <List.Item.Meta title="当前PAC配置IP" description={onFile} />
      <List.Item.Meta
        title="可用配置"
        description={
          onServer === onFile ? (
            `http://${onFile}/static/new.pac`
          ) : (
            <Button loading={updating} onClick={updateAddress}>
              更新配置
            </Button>
          )
        }
      />
    </List.Item>
  );
};

export default ConfigInfo;
