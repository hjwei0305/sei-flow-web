/**
 * @description 不同意原因配置右边编辑弹窗
 * @author 何灿坤
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Row, InputNumber} from 'antd';
import {commonUtils} from '@/utils';
import {flowTypeAllConfig} from "@/utils/CommonComponentsConfig";
import SearchTable from "@/components/SearchTable";
import {seiLocale} from 'sei-utils';

const {checkCode} = commonUtils;
const {seiIntl} = seiLocale;
const FormItem = Form.Item;

class EditRightModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initValue: false,
      initValueName: false
    }
  }

  componentWillMount() {
    this.props.onRef(this);
  };

  handleClose = () => {
    this.props.form.resetFields();
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  render() {
    const formItemLayout = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 15
      },
    };

    const {confirmLoading, modalVisible, handleOk, handleCancel, defaultValue, isAdd, flowType} = this.props;
    const {getFieldDecorator} = this.props.form;
    let title = seiIntl.get({key: 'flow_000221', desc: '编辑不同意原因'});
    let FormValue = defaultValue;


    if (isAdd) {
      title = seiIntl.get({key: 'flow_000222', desc: '新增不同意原因'});
      FormValue = {};
    }
    return (
      <div>
        <Modal title={title}
               visible={modalVisible}
               onOk={handleOk}
               onCancel={handleCancel}
               width={500}
               afterClose={this.handleClose}
               confirmLoading={confirmLoading}
               maskClosable={false}
        >
          <Row>
            <FormItem
              style={{display: "none"}}
              label="id">
              {getFieldDecorator('id', {
                initialValue: FormValue.id ? FormValue.id : null,
              })(
                <Input/>
              )}
            </FormItem>
            <FormItem
              style={{display: "none"}}
              label="status">
              {getFieldDecorator('status', {
                initialValue: FormValue.status ? FormValue.status : true,
              })(
                <Input/>
              )}
            </FormItem>
            <FormItem
              style={{display: "none"}}
              label="flowTypeName">
              {getFieldDecorator('flowTypeName', {
                initialValue: flowType ? flowType.name : "",
              })(
                <Input/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={seiIntl.get({key: 'flow_000056', desc: '流程类型'})}>
              {getFieldDecorator('flowTypeId', {
                initialValue: flowType ? flowType.id : "",
                rules: [{required: true, message: seiIntl.get({key: 'flow_000093', desc: 'flow_000217!'})}]
              })(
                <SearchTable config={flowTypeAllConfig} initValue={false} disabled={true}/>
              )}
            </FormItem>
            <FormItem
              label={seiIntl.get({key: 'flow_000021', desc: '代码'})}
              {...formItemLayout}
            >
              {getFieldDecorator('code', {
                initialValue: FormValue.code ? FormValue.code : null,
                rules: [{required: true, message: seiIntl.get({key: 'flow_000094', desc: '请输入代码!'}), whitespace: true}
                  , {max: 60, message: seiIntl.get({key: 'flow_000218', desc: '代码最大长度为60'})}, {validator: checkCode}
                ]
              })(
                <Input/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={seiIntl.get({key: 'flow_000022', desc: '名称'})}>
              {getFieldDecorator('name', {
                initialValue: FormValue.name ? FormValue.name : "",
                rules: [{required: true, message: seiIntl.get({key: 'common_000013', desc: '请填写名称!'}), whitespace: true}
                  , {max: 80, message: seiIntl.get({key: 'flow_000219', desc: '名称最大长度为80'})}
                ]
              })(
                <Input/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={seiIntl.get({key: 'flow_000037', desc: '描述'})}>
              {getFieldDecorator('depict', {
                initialValue: FormValue.depict ? FormValue.depict : "",
                rules: [{
                  required: false,
                  message: seiIntl.get({key: 'common_000311', desc: '请填写描述!'}),
                  whitespace: true
                }
                  , {max: 255, message: seiIntl.get({key: 'flow_000220', desc: '描述最大长度为255'})}
                ]
              })(
                <Input.TextArea rows={3}/>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={seiIntl.get({key: 'flow_000177', desc: '排序'})}>
              {getFieldDecorator('rank', {
                initialValue: FormValue.rank ? FormValue.rank : 0,
              })(
                <InputNumber precision={0} min={0} style={{width: "100%"}}/>
              )}
            </FormItem>
          </Row>
        </Modal>
      </div>
    );
  }
}

EditRightModal = Form.create()(EditRightModal);
export default EditRightModal;
