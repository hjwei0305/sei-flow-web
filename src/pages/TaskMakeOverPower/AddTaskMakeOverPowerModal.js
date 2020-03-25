import { constants } from "@/utils";
import React, {Component} from 'react';
import {Form, Input, Modal, DatePicker, Button, Col, Row, Divider} from 'antd';
import {seiLocale} from 'sei-utils';
import { FileUpload } from 'seid';
import AnyOneSelected from './TaskMakeOverPowerSelected';
import moment from 'moment';

const {seiIntl} = seiLocale;
const {baseUrl} = constants;

const FormItem = Form.Item;


class AddTaskMakeOverPowerModal extends Component {
  selectedOne = null;

  constructor(props) {
    super(props);
    this.state = {
      endValue: null,
      startValue: null,
      modalVisible: false,
      confirmLoading: false,
      selectUserModal: false,
      selectedOneId: "",
      selectedOneCode: "",
      selectedOneName: ""
    }
  }

  selectAnyOne = () => {
    this.setState({selectUserModal: true});
  }

  handleClose = () => {
    this.props.form.resetFields();
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  //设置开始日期不能选择的时间
  disabledStartDate = startValue => {
    const {endValue} = this.state
    if (!startValue || !endValue) {
      return false
    }
    return startValue.valueOf() > endValue.valueOf()
  }

  //设置结束不能选择的时间
  disabledEndDate = endValue => {
    const {startValue} = this.state
    if (!endValue || !startValue) {
      return false
    }
    return endValue.valueOf() < startValue.valueOf()
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    })
  }

  onStartChange = value => {
    this.onChange('startValue', value)
  }

  onEndChange = value => {
    this.onChange('endValue', value)
  }


  okHandle = () => {
    this.props.form.setFieldsValue({
      'powerUserId': this.selectedOne.id,
      'powerUserAccount': this.selectedOne.code,
      'powerUserName': this.selectedOne.userName
    });
    this.setState({
      selectUserModal: false
    });
  }


  render() {
    const formItemLayout = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 14
      },
    };

    const {confirmLoading, modalVisible, handleOk, handleCancel, defaultValue, isAdd} = this.props;
    const {getFieldDecorator} = this.props.form;
    let title = seiIntl.get({key: 'flow_000031', desc: '编辑'});
    let FormValue = defaultValue;
    if (isAdd) {
      title = seiIntl.get({key: 'flow_000039', desc: '新增'});
      FormValue = {}
    }
    const dateFormat = 'YYYY-MM-DD';
    const uploadProps = {
      domain: baseUrl,
      // action: 'http://dsei.changhong.com:80/edm-service/upload',
      // previewUrl:'http://dsei.changhong.com:80/edm-service/preview',
      // downloadUrl:'http://dsei.changhong.com:80/edm-service/download?docId=',
      defaultFileList: [],
      disabled:!isAdd,
      onChange: (status) => {
        console.log(status);
      },
      onRemove: (file) => {
        console.log(file);
      }
    };
    return (
      <div>
        <Modal title={title}
               visible={modalVisible}
               onOk={handleOk}
               onCancel={handleCancel}
               width={600}
               afterClose={this.handleClose}
               confirmLoading={confirmLoading}
               maskClosable={false}
        >
          <FormItem
            style={{display: "none"}}
            label="id">
            {getFieldDecorator('id', {
              initialValue: FormValue.id ? FormValue.id : "",
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="powerUserId">
            {getFieldDecorator('powerUserId', {
              initialValue: FormValue.powerUserId ? FormValue.powerUserId : "",
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="powerUserAccount">
            {getFieldDecorator('powerUserAccount', {
              initialValue: FormValue.powerUserAccount ? FormValue.powerUserAccount : "",
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="openStatus">
            {getFieldDecorator('openStatus', {
              initialValue: FormValue.openStatus ? FormValue.openStatus : true,
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000292', desc: '代理用户'})}>
            <Row gutter={10}>
              <Col span={15}>
                {getFieldDecorator('powerUserName', {
                  initialValue: FormValue.powerUserName ? FormValue.powerUserName : "",
                  rules: [{required: true, message: seiIntl.get({key: 'flow_000211', desc: '请选择代理用户!'})}]
                })(
                  <Input disabled style={{width: "100%"}}/>
                )}
              </Col>
              <Col span={9}>
                <Button disabled={!isAdd} type="primary" onClick={this.selectAnyOne}>{seiIntl.get({
                  key: 'flow_000214',
                  desc: '选择代理用户'
                })}</Button>
              </Col>
            </Row>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000263', desc: '开始日期'})}>
            {getFieldDecorator('powerStartDate', {
              initialValue: FormValue.powerStartDate ? moment(FormValue.powerStartDate, dateFormat) : this.state.startValue,
              rules: [{required: true, message: seiIntl.get({key: 'flow_000212', desc: '请选择开始日期!'}), type: 'object'}
              ]
            })(
              <DatePicker
                disabledDate={this.disabledStartDate}
                format="YYYY-MM-DD"
                onChange={this.onStartChange}
                style={{width: "100%"}}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000264', desc: '结束日期'})}>
            {getFieldDecorator('powerEndDate', {
              initialValue: FormValue.powerEndDate ? moment(FormValue.powerEndDate, dateFormat) : this.state.endValue,
              rules: [{required: true, message: seiIntl.get({key: 'flow_000213', desc: '请选择结束日期!'}), type: 'object'}
              ]
            })(
              <DatePicker
                disabledDate={this.disabledEndDate}
                format="YYYY-MM-DD"
                onChange={this.onEndChange}
                style={{width: "100%"}}/>
            )}
          </FormItem>
          <Divider> {seiIntl.get({key: 'flow_000293', desc: '授权文件'})}</Divider>
          <FileUpload   {...uploadProps} />
        </Modal>
        <Modal
          title={`指定代理人`}
          bodyStyle={{maxHeight: "720px", overflow: "auto"}}
          width={window.innerWidth * 0.8}
          visible={this.state.selectUserModal}
          onOk={this.okHandle}
          onCancel={() => {
            this.setState({selectUserModal: false});
          }}
          destroyOnClose={true}
          maskClosable={false}
        >
          <AnyOneSelected type='radio' selectChange={(row) => this.selectedOne = row}/>
        </Modal>
      </div>
    );
  }
}

AddTaskMakeOverPowerModal = Form.create()(AddTaskMakeOverPowerModal);
export default AddTaskMakeOverPowerModal;
