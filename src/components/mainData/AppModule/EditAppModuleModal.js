/**
 * @description 应用模块编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, InputNumber} from 'antd';
import {checkCode} from "../../../commons/utils/CommonUtils";
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;
const FormItem = Form.Item;

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
                        label={seiIntl.get({key: 'flow_000021', desc: '代码'})}>
                        {getFieldDecorator('code', {
                            initialValue: FormValue.code ? FormValue.code : "",
                            rules: [{required: true, message: seiIntl.get({key: 'flow_000094', desc: '请输入代码!'}),whitespace:true},{max:20,message:seiIntl.get({key: 'flow_000145', desc: '不超过20个字符！'})},{validator:checkCode}]
                        })(
                            <Input />
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label={seiIntl.get({key: 'flow_000022', desc: '名称'})}>
                        {getFieldDecorator('name', {
                            initialValue: FormValue.name ? FormValue.name : "",
                            rules: [{required: true, message: seiIntl.get({key: 'flow_000042', desc: '请填写名称!'}),whitespace:true}]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={seiIntl.get({key: 'flow_000037', desc: '描述'})}>
                        {getFieldDecorator('remark', {
                            initialValue: FormValue.remark ? FormValue.remark : "",
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={seiIntl.get({key: 'flow_000177', desc: '排序'})}>
                        {getFieldDecorator('rank', {
                            initialValue: FormValue.rank>=0 ? FormValue.rank : "",
                            rules: [{required: true, message: seiIntl.get({key: 'flow_000178', desc: '请填写排序!'})}]
                        })(
                            <InputNumber precision={0} min={0} style={{width:"100%"}}/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={seiIntl.get({key: 'flow_000179', desc: 'web基地址'})}>
                        {getFieldDecorator('webBaseAddress', {
                            initialValue: FormValue.webBaseAddress ? FormValue.webBaseAddress : "",
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={seiIntl.get({key: 'flow_000180', desc: 'api基地址'})}>
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
