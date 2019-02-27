/**
 * @description 工作界面编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Tabs, Checkbox} from 'antd';
import SearchTable from "../../../commons/components/SearchTable";
import {appModuleConfig} from "../../../configs/CommonComponentsConfig";

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
                        label="应用模块">
                        {getFieldDecorator('appModuleId', {
                            initialValue: FormValue.appModuleId ? FormValue.appModuleId : "",
                        })(
                            <SearchTable config={appModuleConfig} initValue={false}/>
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
                        label="必须提交">
                        {getFieldDecorator('mustCommit', {
                            initialValue: !!FormValue.mustCommit,
                        })(
                            <Checkbox/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label="URL地址">
                        {getFieldDecorator('url', {
                            initialValue: FormValue.url ? FormValue.url : "",
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