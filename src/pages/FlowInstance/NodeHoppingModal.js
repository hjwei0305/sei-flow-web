/**
 * @description 节点跳转弹窗
 * @author 何灿坤
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Checkbox} from 'antd';
import SearchTable from "@/components/SearchTable";
import {seiLocale} from 'sei-utils';
import {searchListByKey} from "../../utils/common";

const {seiIntl} = seiLocale;
const FormItem = Form.Item;
const {TextArea} = Input;

class NodeHoppingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      confirmLoading: false,
      selectJumpNodeInfo:[]
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

    const {confirmLoading, modalVisible, handleOk, handleCancel} = this.props;
    const {getFieldDecorator} = this.props.form;
    let title = seiIntl.get({key: 'flow_000329', desc: '节点跳转'});

    //可以跳转的节点
    const nodeHoppingConfig = {
      columns: [
        {
          title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
          dataIndex: 'name',
          width: 160
        }],
      dataService: this.props.getJumpNodeInfo,
      searchService: searchListByKey,
      key: 'id',
      text: 'name'
    };

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
        >
          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000330', desc: '目标节点'})}>
            {getFieldDecorator('targetNodeId', {
              rules: [{required: true, message: seiIntl.get({key: 'flow_000331', desc: '请选择目标节点！'})}]
            })(
              <SearchTable config={nodeHoppingConfig}  initValue={false}  disabled={false}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000332', desc: '触发当前节点事后事件'})}>
            {getFieldDecorator('currentNodeAfterEvent', {
              initialValue: true,
              valuePropName: "checked"
            })(
              <Checkbox/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000333', desc: '触发目标节点事前事件'})}>
            {getFieldDecorator('targetNodeBeforeEvent', {
              initialValue: true,
              valuePropName: "checked"
            })(
              <Checkbox/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000037', desc: '描述'})}>
            {getFieldDecorator('jumpDepict', {
              rules: [{required: true, message: seiIntl.get({key: 'flow_000044', desc: '请填写描述!'}), whitespace: true}]
            })(
              <TextArea rows={3} autoSize={false}/>
            )}
          </FormItem>
        </Modal>
      </div>
    );
  }
}

NodeHoppingModal = Form.create()(NodeHoppingModal);
export default NodeHoppingModal;
