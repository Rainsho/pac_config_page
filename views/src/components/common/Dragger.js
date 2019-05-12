import React, { PureComponent } from 'react';
import { Upload, Icon, message, Progress, List } from 'antd';
import config from '../../utils/config';

const uploadProps = {
  multiple: true,
  showUploadList: false,
  action: `${config.SERVER}fs/upload`,
  onChange(info) {
    const status = info.file.status;

    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

class Dragger extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      uploadInfo: {},
    };

    this.props.io.on('upload', ({ file, percent }) => {
      this.setState(pre => ({
        uploadInfo: Object.assign({}, pre.uploadInfo, { [file]: percent }),
      }));
    });
  }

  render() {
    const pairs = Object.entries(this.state.uploadInfo);

    return (
      <div style={{ marginBottom: 10 }}>
        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
        </Upload.Dragger>
        {pairs.length > 0 && (
          <List
            bordered
            size="small"
            itemLayout="horizontal"
            style={{ marginTop: 10 }}
            dataSource={pairs}
            renderItem={([file, percent]) => (
              <List.Item>
                <List.Item.Meta
                  title={`UPLOADING ${file}`}
                  description={
                    <Progress
                      key={file}
                      percent={percent * 100}
                      format={per => (per === 100 ? '100%' : `${per.toFixed(2)}%`)}
                    />
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    );
  }
}

export default Dragger;
