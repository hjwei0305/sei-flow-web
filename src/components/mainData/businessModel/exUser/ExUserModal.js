/**
 * @description 自定义执行人编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Tabs} from 'antd';

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const {TextArea} = Input;

class ExUserModal extends Component {
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
                       centered={true}
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
                        label="API地址">
                        {getFieldDecorator('url', {
                            initialValue: FormValue.url ? FormValue.url : "",
                            rules: [{required: true, message: '请填写API地址!'}]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="参数">
                        {getFieldDecorator('param', {
                            initialValue: FormValue.param ? FormValue.param : "",
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="描述">
                        {getFieldDecorator('depict', {
                            initialValue: FormValue.depict ? FormValue.depict : "",
                        })(
                            <TextArea rows={4} autosize={false}/>
                        )}
                    </FormItem>
                </Modal>
            </div>
        );
    }
}

ExUserModal = Form.create()(ExUserModal);
export default ExUserModal;