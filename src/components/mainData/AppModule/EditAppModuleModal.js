/**
 * @description 应用模块编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Tabs, InputNumber, Checkbox} from 'antd';
import {cache} from "../../../commons/utils/CommonUtils";

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;

class EditAppModuleModal extends Component {
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
                        label="描述">
                        {getFieldDecorator('remark', {
                            initialValue: FormValue.remark ? FormValue.remark : "",
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="排序">
                        {getFieldDecorator('rank', {
                            initialValue: FormValue.rank>=0 ? FormValue.rank : "",
                            rules: [{required: true, message: '请填写排序!'}]
                        })(
                            <InputNumber precision={0} min={0} style={{width:"100%"}}/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="web基地址">
                        {getFieldDecorator('webBaseAddress', {
                            initialValue: FormValue.webBaseAddress ? FormValue.webBaseAddress : "",
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="api基地址">
                        {getFieldDecorator('apiBaseAddress', {
                            initialValue: FormValue.apiBaseAddress ? FormValue.apiBaseAddress : "",
                        })(
                            <Input/>
                        )}
                    </FormItem>
                </Modal>
            </div>
        );
    }
}

EditAppModuleModal = Form.create()(EditAppModuleModal);
export default EditAppModuleModal;