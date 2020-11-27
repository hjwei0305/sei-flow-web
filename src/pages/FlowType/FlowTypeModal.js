/**
 * @description 流程类型编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Row ,InputNumber} from 'antd';
import SearchTable from "@/components/SearchTable";
import {seiLocale} from 'sei-utils';
import {commonUtils,} from '@/utils';
import {businessModelConfig,} from '@/utils/CommonComponentsConfig';

const {checkCode} = commonUtils;
const {seiIntl} = seiLocale;
const FormItem = Form.Item;
const {TextArea} = Input;

class FlowTypeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      confirmLoading: false,
    }
  }

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
        span: 14
      },
    };

    const {confirmLoading, modalVisible, handleOk, handleCancel, defaultValue, isAdd, businessMode} = this.props;
    const {getFieldDecorator} = this.props.form;
    let title = seiIntl.get({key: 'flow_000031', desc: '编辑'});
    let FormValue = defaultValue;
    if (isAdd) {
      title = seiIntl.get({key: 'flow_000039', desc: '新增'});
      FormValue = {}
    }
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
          <Row><FormItem
            style={{display: "none"}}
            label="id">
            {getFieldDecorator('id', {
              initialValue: FormValue.id ? FormValue.id : "",
            })(
              <Input/>
            )}
          </FormItem></Row>
          <Row><FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000054', desc: '业务实体'})}>
            {getFieldDecorator('businessModel.id', {
              initialValue: businessMode ? businessMode.id : "",
              rules: [{required: true, message: seiIntl.get({key: 'flow_000093', desc: '请选择业务实体!'})}]
            })(
              <SearchTable config={businessModelConfig} initValue={false} disabled={true}/>
            )}
          </FormItem></Row>
          <Row><FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000021', desc: '代码'})}>
            {getFieldDecorator('code', {
              initialValue: FormValue.code ? FormValue.code : "",
              rules: [{
                required: true,
                message: seiIntl.get({key: 'flow_000094', desc: '请输入代码!'}),
                whitespace: true
              },{max: 60, message: seiIntl.get({key: 'flow_000218', desc: '代码最大长度为60'})}, {validator: checkCode}]
            })(
              <Input/>
            )}
          </FormItem></Row>
          <Row><FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000022', desc: '名称'})}>
            {getFieldDecorator('name', {
              initialValue: FormValue.name ? FormValue.name : "",
              rules: [{required: true, message: seiIntl.get({key: 'flow_000042', desc: '请填写名称!'}), whitespace: true} , {max: 80, message: seiIntl.get({key: 'flow_000219', desc: '名称最大长度为80'})}]
            })(
              <Input/>
            )}
          </FormItem></Row>
          <Row><FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000177', desc: '排序'})}>
            {getFieldDecorator('version', {
              initialValue: FormValue.version >= 0 ? FormValue.version : "",
              rules: [{required: true, message: seiIntl.get({key: 'flow_000178', desc: '请填写排序!'})}]
            })(
              <InputNumber precision={0} min={0} style={{width: "100%"}}/>
            )}
          </FormItem></Row>
          {/*<Row><FormItem*/}
          {/*  {...formItemLayout}*/}
          {/*  label={seiIntl.get({key: 'flow_000095', desc: '提交任务地址'})}>*/}
          {/*  {getFieldDecorator('completeTaskServiceUrl', {*/}
          {/*    initialValue: FormValue.completeTaskServiceUrl ? FormValue.completeTaskServiceUrl : "",*/}
          {/*  })(*/}
          {/*    <Input/>*/}
          {/*  )}*/}
          {/*</FormItem></Row>*/}
          <Row><FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000096', desc: '表单明细URL'})}>
            {getFieldDecorator('businessDetailServiceUrl', {
              initialValue: FormValue.businessDetailServiceUrl ? FormValue.businessDetailServiceUrl : "",
            })(
              <Input/>
            )}
          </FormItem></Row>
          <Row><FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000097', desc: '表单URL'})}>
            {getFieldDecorator('lookUrl', {
              initialValue: FormValue.lookUrl ? FormValue.lookUrl : "",
            })(
              <Input/>
            )}
          </FormItem></Row>
          <Row><FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000037', desc: '描述'})}>
            {getFieldDecorator('depict', {
              initialValue: FormValue.depict ? FormValue.depict : "",
              rules: [{required: true, message: seiIntl.get({key: 'flow_000044', desc: '请填写描述!'})}, {max: 255, message: seiIntl.get({key: 'flow_000220', desc: '描述最大长度为255'})}]
            })(
              <TextArea rows={4} autosize={false}/>
            )}
          </FormItem></Row>
        </Modal>
      </div>
    );
  }
}

FlowTypeModal = Form.create()(FlowTypeModal);
export default FlowTypeModal;
