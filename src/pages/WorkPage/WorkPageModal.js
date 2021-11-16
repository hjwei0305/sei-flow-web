/**
 * @description 工作界面编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Checkbox} from 'antd';
import SearchTable from "@/components/SearchTable";
import { seiLocale } from 'sei-utils';
import { appModuleConfig } from '@/utils/CommonComponentsConfig';

const { seiIntl } = seiLocale;
const FormItem = Form.Item;

class WorkPageModal extends Component {
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

        const {confirmLoading, modalVisible, handleOk, handleCancel, defaultValue, isAdd,appModule} = this.props;
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
                        label={seiIntl.get({key: 'flow_000041', desc: '应用模块'})}>
                        {getFieldDecorator('appModuleId', {
                            initialValue: appModule ? appModule.id : "",
                        })(
                            <SearchTable config={appModuleConfig} initValue={false} disabled={true}/>
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
                        label={seiIntl.get({key: 'flow_000034', desc: '必须提交'})}>
                        {getFieldDecorator('mustCommit', {
                            initialValue: FormValue.mustCommit,
                            valuePropName: "checked"
                        })(
                            <Checkbox/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label={seiIntl.get({key: 'flow_000033', desc: 'URL地址'})}>
                        {getFieldDecorator('url', {
                            initialValue: FormValue.url ? FormValue.url : "",
                          rules: [{required: true, message: seiIntl.get({key: 'flow_000043', desc: '请填写URL地址!'}),whitespace:true}]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label={seiIntl.get({key: 'flow_000223', desc: '移动端地址'})}>
                    {getFieldDecorator('phoneUrl', {
                      initialValue: FormValue.phoneUrl ? FormValue.phoneUrl : ""
                    })(
                      <Input/>
                    )}
                  </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label={seiIntl.get({key: 'flow_000037', desc: '描述'})}>
                        {getFieldDecorator('depict', {
                            initialValue: FormValue.depict ? FormValue.depict : "",
                          rules: [{required: true, message: seiIntl.get({key: 'flow_000044', desc: '请填写描述!'}),whitespace:true}]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                </Modal>
            </div>
        );
    }
}

WorkPageModal = Form.create()(WorkPageModal);
export default WorkPageModal;
