import React, { Component } from 'react';
import { Card, Table, Button, Modal, Input, notification, Progress } from 'antd';
import io from 'socket.io-client';
import { getFiles, deleteFile, renameFile, getDisk, persistFile } from '../utils/api';
import { fmtBytes } from '../utils/util';
import config from '../utils/config';

class Nas extends Component {
  constructor(props) {
    super(props);

    this.state = { files: [], disk: {}, file: '', percent: 0 };

    this.syncFiles = () => {
      Promise.all([getFiles(), getDisk()]).then(([files, disk]) => this.setState({ files, disk }));
    };

    this.io = io(config.SERVER);

    this.io.on('progress', ({ file, percent }) => this.setState({ file, percent }));
  }

  componentDidMount() {
    this.syncFiles();
  }

  componentWillUnmount() {
    this.io.close();
  }

  handleRename = (path, name) => {
    Modal.confirm({
      content: (
        <Input
          defaultValue={name}
          onChange={e => {
            this._name = e.target.value;
          }}
        />
      ),
      maskClosable: true,
      onOk: () => {
        if (this._name && this._name !== name) {
          renameFile(path, this._name).then(this.syncFiles);
        }
      },
    });
  };

  handleDelete = (path, purge) => {
    const content = purge ? 'Purge ?' : `Delete ${path} ?`;

    Modal.confirm({
      content,
      maskClosable: true,
      onOk: () => deleteFile(path, purge).then(this.syncFiles),
    });
  };

  handlePersist = path => {
    Modal.confirm({
      content: `Persist ${path} ?`,
      maskClosable: true,
      onOk: () => {
        this.setState({ file: path.split('/').pop(), percent: 0 }, () => {
          persistFile(path).then(({ desc }) => {
            if (desc) notification.error({ message: desc.toString() });
          });
        });
      },
    });
  };

  render() {
    const { files, disk, file, percent } = this.state;
    const { available: ava, total } = disk;

    const diskSize = ava ? ` (${fmtBytes(ava, 2)}/${fmtBytes(total, 2)})` : '';

    const columns = [
      {
        title: 'name',
        dataIndex: 'name',
        render: (val, { path }) => <a href={`/nas/${path}`}>{val}</a>,
      },
      { title: 'path', dataIndex: 'path' },
      { title: 'size', dataIndex: 'size', align: 'right', render: val => fmtBytes(val) },
      {
        title: 'opt',
        align: 'center',
        render: (_, { path, name }) => (
          <>
            <Button onClick={() => this.handleRename(path, name)} style={{ marginRight: 10 }}>
              Rename
            </Button>
            <Button onClick={() => this.handleDelete(path)} style={{ marginRight: 10 }}>
              Delete
            </Button>
            <Button onClick={() => this.handlePersist(path)}>Persist</Button>
          </>
        ),
      },
    ];

    return (
      <Card
        title={`Nexus File System${diskSize}`}
        bordered={false}
        extra={
          <>
            <Button type="primary" onClick={this.syncFiles} style={{ marginRight: 10 }}>
              sync
            </Button>
            <Button type="danger" onClick={() => this.handleDelete('', true)}>
              purge
            </Button>
          </>
        }
      >
        {file && (
          <>
            <div>UPLOADING {file}</div>
            <Progress style={{ marginBottom: 10 }} percent={parseInt(percent * 100, 10)} />
          </>
        )}
        <Table rowKey="path" pagination={false} dataSource={files} columns={columns} />
      </Card>
    );
  }
}

export default Nas;
