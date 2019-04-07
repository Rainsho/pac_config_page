import React, { Component } from 'react';
import { Card, Table, Button, Modal, Input, notification, Progress, List, message } from 'antd';
import io from 'socket.io-client';
import {
  getFiles,
  deleteFile,
  renameFile,
  getDisk,
  persistFile,
  getQueue,
  cancelPersist,
} from '../utils/api';
import { fmtBytes, shorterText } from '../utils/util';
import config from '../utils/config';
import { Uploaded, Player } from './common';

class Nas extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      disk: {},
      queue: [],
      file: '',
      percent: 0,
      cancel: false,
      showVideo: false,
      videoSrc: '',
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

  handleTouchStart = e => {
    this.touchX = e.changedTouches[0].clientX;
  };

  handleTouchMove = e => {
    const { clientX } = e.changedTouches[0];

    // move right, do nothing
    if (clientX > this.touchX) return;

    if (this.touchX - clientX > 60) {
      e.target.style.color = '#d9d9d9';
    } else {
      e.target.style.color = '';
    }
  };

  handleTocuhEnd = (path, e) => {
    const { clientX } = e.changedTouches[0];

    if (this.touchX - clientX > 60) {
      const hide = message.loading(`Deleting ${path}`);

      deleteFile(path)
        .then(this.syncFiles)
        .then(hide)
        .then(() => message.success('Deleted!', 1));
    }
  };

  handlePersist = path => {
    Modal.confirm({
      content: `Persist ${path} ?`,
      maskClosable: true,
      onOk: () => {
        this.setState(
          {
            file: path.split('/').pop(),
            percent: 0,
            selectedRow: '',
            cancel: false,
          },
          () => {
            persistFile(path).then(({ desc }) => {
              if (desc) notification.error({ message: desc.toString() });
            });
          }
        );
      },
    });
  };

  handleCancel = fileName => {
    cancelPersist(fileName).then(({ code }) => {
      if (code === 200) this.setState({ cancel: true });
    });
  };

  handleVideo = path => {
    this.setState({
      showVideo: true,
      videoSrc: `${config.NAS_SERVER}nas/${path}`,
    });
  };

  closeVideo = () => {
    this.setState({ showVideo: false });
  };

  columns = uploaded => [
    {
      title: 'name',
      dataIndex: 'name',
      render: (val, { path }) => (
        <a href={`${config.NAS_SERVER}nas/${path}`} title={val}>
          {shorterText(val)}
        </a>
      ),
    },
    {
      title: 'path',
      dataIndex: 'path',
      render: (val, { path }) => (
        <div
          title={val}
          onTouchStart={this.handleTouchStart}
          onTouchMove={this.handleTouchMove}
          onTouchEnd={e => this.handleTocuhEnd(path, e)}
        >
          {shorterText(val)}
        </div>
      ),
    },
    { title: 'size', dataIndex: 'size', align: 'right', render: val => fmtBytes(val) },
    {
      title: 'opt',
      align: 'center',
      render: (_, { path, name }) => (
        <Button.Group>
          <Button icon="edit" onClick={() => this.handleRename(path, name)} />
          <Button
            icon="video-camera"
            disabled={!/\.mp4$/.exec(name)}
            onClick={() => this.handleVideo(path)}
          />
          <Button icon="delete" onClick={() => this.handleDelete(path)} />
          <Button
            icon="cloud-upload"
            disabled={uploaded.map(x => x.id).includes(name)}
            onClick={() => this.handlePersist(path)}
          />
        </Button.Group>
      ),
    },
  ];

  render() {
    const { files, disk, queue, file, percent, cancel, showVideo, videoSrc } = this.state;
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
              <Progress
                percent={percent * 100}
                format={per => (per === 100 ? '100%' : `${per.toFixed(2)}%`)}
              />
              <Button
                shape="circle"
                icon="close"
                size="small"
                disabled={!percent || percent >= 1 || cancel}
                style={{ marginLeft: 30 }}
                onClick={() => this.handleCancel(file)}
              />
            </List.Item>
          </List>
        )}
        <Table
          rowKey="path"
          pagination={false}
          dataSource={files}
          columns={this.columns(uploaded)}
        />
        <Modal
          width="90%"
          destroyOnClose
          centered
          footer={null}
          visible={showVideo}
          onCancel={this.closeVideo}
        >
          <Player src={videoSrc} />
        </Modal>
      </Card>
    );
  }
}

export default Nas;
