/**
 * @description 业务实体编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Row, Col} from 'antd';
import SearchTable from "../../../commons/components/SearchTable";
import {appModuleConfig} from "../../../configs/CommonComponentsConfig";

const FormItem = Form.Item;
const {TextArea} = Input;

class BusinessModelModal extends Component {
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
                span: 10
            },
            wrapperCol: {
                span: 14
            },
        };

        const {confirmLoading, modalVisible, handleOk, handleCancel, defaultValue, operateFlag,appModuleId} = this.props;
        const {getFieldDecorator} = this.props.form;
        let title = "编辑业务实体";
        let FormValue = defaultValue;
        if (operateFlag==='add') {
            title = "新增业务实体";
            FormValue = {}
        }else if(operateFlag==='refAdd'){
            title = "参考创建业务实体";
        }
        return (
            <div>
                <Modal title={title}
                       visible={modalVisible}
                       onOk={handleOk}
                       onCancel={handleCancel}
                       width={1000}
                       afterClose={this.handleClose}
                       confirmLoading={confirmLoading}
                       maskClosable={false}
                       centered={true}
                >
                    <Row>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="应用模块">
                                {getFieldDecorator('appModule.id', {
                                    initialValue: appModuleId ? appModuleId : "",
                                    rules: [{required: true, message: '请选择应用模块!'}]
                                })(
                                    <SearchTable config={appModuleConfig} initValue={false}/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
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
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="类全路径">
                                {getFieldDecorator('className', {
                                    initialValue: FormValue.className ? FormValue.className : "",
                                    rules: [{required: true, message: '请填写类全路径!'}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="条件属性说明服务地址">
                                {getFieldDecorator('conditonProperties', {
                                    initialValue: FormValue.conditonProperties ? FormValue.conditonProperties : "",
                                    rules: [{required: true, message: '请填写条件属性说明服务地址!'}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="条件属性值服务地址">
                                {getFieldDecorator('conditonPValue', {
                                    initialValue: FormValue.conditonPValue ? FormValue.conditonPValue : "",
                                    rules: [{required: true, message: '请填写条件属性值服务地址!'}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="条件属性初始值服务地址">
                                {getFieldDecorator('conditonPSValue', {
                                    initialValue: FormValue.conditonPSValue ? FormValue.conditonPSValue : "",
                                    rules: [{required: true, message: '请填写条件属性初始值服务地址!'}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="流程状态重置服务地址">
                                {getFieldDecorator('conditonStatusRest', {
                                    initialValue: FormValue.conditonStatusRest ? FormValue.conditonStatusRest : "",
                                    rules: [{required: true, message: '请填写流程状态重置服务地址!'}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="推送待办服务地址">
                                {getFieldDecorator('pushMsgUrl', {
                                    initialValue: FormValue.pushMsgUrl ? FormValue.pushMsgUrl : "",
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="提交任务地址">
                                {getFieldDecorator('completeTaskServiceUrl', {
                                    initialValue: FormValue.completeTaskServiceUrl ? FormValue.completeTaskServiceUrl : "",
                                    rules: [{required: true, message: '请填写提交任务地址!'}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="表单明细URL">
                                {getFieldDecorator('businessDetailServiceUrl', {
                                    initialValue: FormValue.businessDetailServiceUrl ? FormValue.businessDetailServiceUrl : "",
                                    rules: [{required: true, message: '请填写表单明细URL!'}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label="表单URL">
                                {getFieldDecorator('lookUrl', {
                                    initialValue: FormValue.lookUrl ? FormValue.lookUrl : "",
                                    rules: [{required: true, message: '请填写条件属性值服务地址!'}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                  <Row>
                    <FormItem
                      label="描述"
                      labelCol={{span: 5}}
                      wrapperCol={{span: 19}}>
                      {getFieldDecorator('depict', {
                        initialValue: FormValue.depict ? FormValue.depict : "",
                      })(
                        <TextArea rows={3} autosize={false}/>
                      )}
                    </FormItem>
                  </Row>
                    <FormItem
                        style={{display: "none"}}
                        label="id">
                        {getFieldDecorator('id', {
                            initialValue: FormValue.id ? FormValue.id : "",
                        })(
                            <Input/>
                        )}
                    </FormItem>
                </Modal>
            </div>
        );
    }
}

BusinessModelModal = Form.create()(BusinessModelModal);
export default BusinessModelModal;
