/**
 * @description 流程类型编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Tabs, InputNumber, Checkbox} from 'antd';
import {cache} from "../../../commons/utils/CommonUtils";
import SearchTable from "../../../commons/components/SearchTable";
import {appModuleConfig, businessModelConfig} from "../../../configs/CommonComponentsConfig";

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
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

        const {confirmLoading, modalVisible, handleOk, handleCancel, defaultValue, isAdd} = this.props;
        const {getFieldDecorator} = this.props.form;
        let title = "编辑";
        let FormValue = defaultValue;
        if (isAdd) {
            title = "新增";
            FormValue = {}
        }
        console.log('FormValue:',FormValue)
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
                        label="业务实体">
                        {getFieldDecorator('businessModel.id', {
                            initialValue: FormValue.businessModel ? FormValue.businessModel.id : "",
                            rules: [{required: true, message: '请选择业务实体!'}]
                        })(
                            <SearchTable config={businessModelConfig} initValue={false}/>
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
                        label="提交任务地址">
                        {getFieldDecorator('completeTaskServiceUrl', {
                            initialValue: FormValue.completeTaskServiceUrl ? FormValue.completeTaskServiceUrl : "",
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="表单明细URL">
                        {getFieldDecorator('businessDetailServiceUrl', {
                            initialValue: FormValue.businessDetailServiceUrl ? FormValue.businessDetailServiceUrl : "",
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="表单URL">
                        {getFieldDecorator('lookUrl', {
                            initialValue: FormValue.lookUrl ? FormValue.lookUrl : "",
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="描述">
                        {getFieldDecorator('depict', {
                            initialValue: FormValue.depict ? FormValue.depict : "",
                            rules: [{required: true, message: '请填写描述!'}]
                        })(
                            <TextArea rows={4} autosize={false}/>
                        )}
                    </FormItem>
                </Modal>
            </div>
        );
    }
}

FlowTypeModal = Form.create()(FlowTypeModal);
export default FlowTypeModal;