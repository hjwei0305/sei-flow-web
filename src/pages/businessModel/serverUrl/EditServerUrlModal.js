/**
 * @description 应用模块编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Tabs,Row} from 'antd';
import { seiLocale } from 'sei-utils';
import { commonUtils, } from '@/utils';

const {checkCode} = commonUtils;
const { seiIntl } = seiLocale;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

class EditServerUrlModal extends Component {
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

        const {confirmLoading, modalVisible, handleOk, handleCancel, defaultValue, isAdd} = this.props;
        const {getFieldDecorator} = this.props.form;
        let title =seiIntl.get({key: 'flow_000031', desc: '编辑'});
        let FormValue = defaultValue;
        if (isAdd) {
            title =seiIntl.get({key: 'flow_000039', desc: '新增'});
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
                       centered={true}
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
                    label={seiIntl.get({key: 'flow_000021', desc: '代码'})}>
                    {getFieldDecorator('code', {
                      initialValue: FormValue.code ? FormValue.code : "",
                      rules: [{required: true, message: seiIntl.get({key: 'flow_000094', desc: '请输入代码!'}),whitespace:true},{validator:checkCode}]
                    })(
                      <Input/>
                    )}
                  </FormItem></Row>
                  <Row><FormItem
                    {...formItemLayout}
                    label={seiIntl.get({key: 'flow_000022', desc: '名称'})}>
                    {getFieldDecorator('name', {
                      initialValue: FormValue.name ? FormValue.name : "",
                      rules: [{required: true,whitespace:true, message: seiIntl.get({key: 'flow_000042', desc: '请填写名称!'})}]
                    })(
                      <Input/>
                    )}
                  </FormItem></Row>
                  <Row><FormItem
                    {...formItemLayout}
                    label="URL">
                    {getFieldDecorator('url', {
                      initialValue: FormValue.url ? FormValue.url : "",
                      rules: [{required: true, message: seiIntl.get({key: 'flow_000149', desc: '请填写URL!'}),whitespace:true}]

                    })(
                      <Input/>
                    )}
                  </FormItem></Row>
                  <Row><FormItem
                    {...formItemLayout}
                    label={seiIntl.get({key: 'flow_000037', desc: '描述'})}>
                    {getFieldDecorator('depict', {
                      initialValue: FormValue.depict ? FormValue.depict : "",
                    })(
                      <Input/>
                    )}
                  </FormItem></Row>
                </Modal>
            </div>
        );
    }
}

EditServerUrlModal = Form.create()(EditServerUrlModal);
export default EditServerUrlModal;
