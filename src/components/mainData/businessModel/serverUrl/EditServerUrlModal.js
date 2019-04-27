/**
 * @description 应用模块编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Tabs,Row} from 'antd';
import {checkCode} from "../../../../commons/utils/CommonUtils";

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
        let title = "编辑";
        let FormValue = defaultValue;
        if (isAdd) {
            title = "新增";
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
                    label="代码">
                    {getFieldDecorator('code', {
                      initialValue: FormValue.code ? FormValue.code : "",
                      rules: [{required: true, message: '请输入代码!',whitespace:true},{validator:checkCode}]
                    })(
                      <Input/>
                    )}
                  </FormItem></Row>
                  <Row><FormItem
                    {...formItemLayout}
                    label="名称">
                    {getFieldDecorator('name', {
                      initialValue: FormValue.name ? FormValue.name : "",
                      rules: [{required: true,whitespace:true, message: '请填写名称!'}]
                    })(
                      <Input/>
                    )}
                  </FormItem></Row>
                  <Row><FormItem
                    {...formItemLayout}
                    label="URL">
                    {getFieldDecorator('url', {
                      initialValue: FormValue.url ? FormValue.url : "",
                      rules: [{required: true, message: '请填写URL!',whitespace:true}]

                    })(
                      <Input/>
                    )}
                  </FormItem></Row>
                  <Row><FormItem
                    {...formItemLayout}
                    label="描述">
                    {getFieldDecorator('remark', {
                      initialValue: FormValue.remark ? FormValue.remark : "",
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
