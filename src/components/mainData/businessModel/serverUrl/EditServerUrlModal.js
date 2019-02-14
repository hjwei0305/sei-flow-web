/**
 * @description 应用模块编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Tabs} from 'antd';

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
                <Modal title={<span className={'header-span'}>{title}</span>}
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
                        {...formItemLayout}
                        label="代码">
                        {getFieldDecorator('code', {
                            initialValue: FormValue.code ? FormValue.code : "",
                            rules: [{required: true, message: '请填写代码!'}]
                        })(
                            <Input/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="名称">
                        {getFieldDecorator('name', {
                            initialValue: FormValue.name ? FormValue.name : "",
                            rules: [{required: true, message: '请填写名称!'}]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="URL">
                        {getFieldDecorator('url', {
                            initialValue: FormValue.url ? FormValue.url : "",
                            rules: [{required: true, message: '请填写URL!'}]

                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="描述">
                        {getFieldDecorator('remark', {
                            initialValue: FormValue.remark ? FormValue.remark : "",
                        })(
                            <Input/>
                        )}
                    </FormItem>
                </Modal>
            </div>
        );
    }
}

EditServerUrlModal = Form.create()(EditServerUrlModal);
export default EditServerUrlModal;