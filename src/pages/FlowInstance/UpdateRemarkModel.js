/**
 * @description 节点跳转弹窗
 * @author 何灿坤
 */

import React, {Component} from 'react'
import {Col, Form, Input, Modal} from 'antd';
import {seiLocale} from 'sei-utils';
import {searchListByKey} from "../../utils/common";

const {seiIntl} = seiLocale;
const FormItem = Form.Item;
const {TextArea} = Input;

class UpdateRemarkModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      confirmLoading: false,
      selectJumpNodeInfo: []
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

    const {confirmLoading, modalVisible, handleOk, handleCancel, defaultValue} = this.props;
    const {getFieldDecorator} = this.props.form;
    let title = seiIntl.get({key: 'flow_000334', desc: '修改说明'});

    return (
      <div>
        <Modal title={title}
               visible={modalVisible}
               onOk={handleOk}
               onCancel={handleCancel}
               width={650}
               bodyStyle={{minHeight: 280}}
               afterClose={this.handleClose}
               confirmLoading={confirmLoading}
               maskClosable={false}
               destroyOnClose
        >
          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000047', desc: '流程名称'})}>
            {getFieldDecorator('flowName', {
              initialValue: defaultValue.flowName ? defaultValue.flowName : ""
            })(
              <Input disabled/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000132', desc: '业务单号'})}>
            {getFieldDecorator('businessCode', {
              initialValue: defaultValue.businessCode ? defaultValue.businessCode : ""
            })(
              <Input disabled/>
            )}
          </FormItem>

          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000105', desc: '工作说明'})}>
            {getFieldDecorator('updateRemark', {
              initialValue: defaultValue.businessModelRemark ? defaultValue.businessModelRemark : "",
              rules: [{required: true, message: seiIntl.get({key: 'flow_000335', desc: '请填写工作说明!'}), whitespace: true}]
            })(
              <TextArea rows={6} autoSize={false}/>
            )}
          </FormItem>
        </Modal>
      </div>
    );
  }
}

UpdateRemarkModel = Form.create()(UpdateRemarkModel);
export default UpdateRemarkModel;
