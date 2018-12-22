import React, { Component } from 'react';
import { Card, Table, Button, Modal, Input, notification, Progress, List } from 'antd';
import io from 'socket.io-client';
import { getFiles, deleteFile, renameFile, getDisk, persistFile, getQueue } from '../utils/api';
import { fmtBytes } from '../utils/util';
import config from '../utils/config';
import { Uploaded } from './common';

class Nas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      disk: {},
      queue: [],
      file: '',
      percent: 0,
      selectedRow: '',
    };

    this.syncFiles = () => {
      Promise.all([getFiles(), getDisk(), getQueue()]).then(([files, disk, queue]) =>
        this.setState({ files, disk, queue })
      );
    };

    this.io = io(config.SERVER);

    this.io.on('progress', ({ file, percent }) => this.setState({ file, percent }));

    this.io.on('done', file => {
      const queue = this.state.queue.slice();

      queue.push(file);
      this.setState({ queue });
    });
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

  handlePersist = () => {
    const { selectedRow } = this.state;

    Modal.confirm({
      content: `Persist ${selectedRow} ?`,
      maskClosable: true,
      onOk: () => {
        this.setState({ file: selectedRow.split('/').pop(), percent: 0, selectedRow: '' }, () => {
          persistFile(selectedRow).then(({ desc }) => {
            if (desc) notification.error({ message: desc.toString() });
          });
        });
      },
    });
  };

  rowSelection = uploaded => ({
    type: 'radio',
    onChange: selectedRowKeys => {
      this.setState({ selectedRow: selectedRowKeys[0] });
    },
    getCheckboxProps: ({ name, path }) => ({
      disabled: uploaded.map(x => x.id).includes(name),
      name: path,
    }),
  });

  columns = () => [
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
        </>
      ),
    },
  ];

  render() {
    const { files, disk, queue, file, percent, selectedRow } = this.state;
    const { available: ava, total } = disk;

    const diskSize = ava ? ` (${fmtBytes(ava, 2)}/${fmtBytes(total, 2)})` : '';
    const uploaded = queue.filter(x => x.state === 'done');

    return (
      <Card
        title={`Nexus File System${diskSize}`}
        bordered={false}
        extra={
          <>
            <Button type="primary" style={{ marginRight: 10 }} onClick={this.syncFiles}>
              sync
            </Button>
            <Button
              type="primary"
              style={{ marginRight: 10 }}
              disabled={!selectedRow}
              onClick={this.handlePersist}
            >
              Persist
            </Button>
            <Button type="danger" onClick={() => this.handleDelete('', true)}>
              purge
            </Button>
          </>
        }
      >
        {uploaded.length > 0 && <Uploaded files={uploaded} />}
        {file && (
          <List
            size="small"
            bordered
            style={{ marginBottom: 10 }}
            header={<div>UPLOADING {file}</div>}
          >
            <List.Item>
              <Progress percent={+(percent * 100).toFixed(2)} />
            </List.Item>
          </List>
        )}
        <Table
          rowKey="path"
          rowSelection={this.rowSelection(uploaded)}
          pagination={false}
          dataSource={files}
          columns={this.columns()}
        />
      </Card>
    );
  }
}

export default Nas;
