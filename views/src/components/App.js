import React, { Component } from 'react';
import { Card, Table, Button, Modal, Input } from 'antd';
import { getFiles, deleteFile, renameFile } from '../utils/api';

class App extends Component {
  state = { files: [] };

  syncFiles = () => getFiles().then(files => this.setState({ files }));

  componentDidMount() {
    this.syncFiles();
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

  render() {
    const { files } = this.state;

    const columns = [
      { title: 'name', dataIndex: 'name' },
      { title: 'path', dataIndex: 'path' },
      { title: 'size', dataIndex: 'size' },
      {
        title: 'opt',
        align: 'center',
        render: (_, { path, name }) => (
          <>
            <Button onClick={() => this.handleRename(path, name)} style={{ marginRight: 10 }}>
              Rename
            </Button>
            <Button onClick={() => this.handleDelete(path)}>Delete</Button>
          </>
        ),
      },
    ];

    return (
      <Card
        title="Nexus File System"
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
        <Table rowKey="path" pagination={false} dataSource={files} columns={columns} />
      </Card>
    );
  }
}

export default App;
