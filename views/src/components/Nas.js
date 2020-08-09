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
import { Uploaded, Player, Dragger } from './common';

const LEFT_DELETE_PIXEL = 120;

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
      selectedFiles: [],
    };

    this.syncFiles = () => {
      Promise.all([getFiles(), getDisk(), getQueue()]).then(([files, disk, queue]) =>
        this.setState({ files, disk, queue })
      );
    };

    this.io = io(config.API_SERVER);

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

    if (this.touchX - clientX > LEFT_DELETE_PIXEL) {
      e.target.style.color = '#d9d9d9';
    } else {
      e.target.style.color = '';
    }
  };

  handleTocuhEnd = (path, e) => {
    const { clientX } = e.changedTouches[0];

    if (this.touchX - clientX > LEFT_DELETE_PIXEL) {
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

  handleBatchDelete = () => {
    const { selectedFiles } = this.state;
    const content = `Delete [${selectedFiles.join(', ')}] ?`;

    Modal.confirm({
      content,
      maskClosable: true,
      onOk: () =>
        Promise.all(selectedFiles.map(x => deleteFile(x, false)))
          .then(this.syncFiles)
          .then(() => this.setState({ selectedFiles: [] })),
    });
  };

  handleBatchPersist = () => {
    const { selectedFiles } = this.state;
    const content = `Persist [${selectedFiles.join(', ')}] ?`;

    Modal.confirm({
      content,
      maskClosable: true,
      onOk: () =>
        Promise.all(selectedFiles.map(persistFile))
          .then(responses => {
            const desc = responses
              .map(x => x.desc)
              .filter(Boolean)
              .join(',');

            if (desc) notification.error({ message: desc.toString() });
          })
          .then(() => this.setState({ selectedFiles: [] })),
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
    const {
      files,
      disk,
      queue,
      file,
      percent,
      cancel,
      showVideo,
      videoSrc,
      selectedFiles,
    } = this.state;
    const { available: ava, total } = disk;

    const diskSize = ava ? ` (${fmtBytes(ava, 2)}/${fmtBytes(total, 2)})` : '';
    const uploaded = queue.filter(x => x.state === 'done');
    const rowSelection = {
      selectedRowKeys: selectedFiles,
      onChange: selectedRowKeys => {
        this.setState({ selectedFiles: selectedRowKeys });
      },
    };

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
              type="danger"
              style={{ marginRight: 10 }}
              onClick={() => this.handleDelete('', true)}
            >
              purge
            </Button>
            <Button
              style={{ marginRight: 10 }}
              disabled={selectedFiles.length === 0}
              onClick={this.handleBatchDelete}
            >
              delete
            </Button>
            <Button disabled={selectedFiles.length === 0} onClick={this.handleBatchPersist}>
              persist
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
        <Dragger io={this.io} />
        <Table
          rowKey="path"
          pagination={false}
          dataSource={files}
          columns={this.columns(uploaded)}
          rowSelection={rowSelection}
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
