/**
 * @description 业务实体编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Row, Col} from 'antd';
import SearchTable from "../../../commons/components/SearchTable";
import {appModuleConfig} from "../../../configs/CommonComponentsConfig";
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;
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
        let title = seiIntl.get({key: 'flow_000161', desc: '编辑业务实体'});
        let FormValue = defaultValue;
        if (operateFlag==='add') {
            title =seiIntl.get({key: 'flow_000162', desc: '新增业务实体'});
            FormValue = {}
        }else if(operateFlag==='refAdd'){
            title =seiIntl.get({key: 'flow_000163', desc: '参考创建业务实体'});
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
                                label={seiIntl.get({key: 'flow_000041', desc: '应用模块'})}>
                                {getFieldDecorator('appModule.id', {
                                    initialValue: appModuleId ? appModuleId : "",
                                    rules: [{required: true, message: seiIntl.get({key: 'flow_000164', desc: '请选择应用模块!'})}]
                                })(
                                    <SearchTable disabled config={appModuleConfig} initValue={false}/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
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
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label={seiIntl.get({key: 'flow_000158', desc: '类全路径'})}>
                                {getFieldDecorator('className', {
                                    initialValue: FormValue.className ? FormValue.className : "",
                                    rules: [{required: true, message: seiIntl.get({key: 'flow_000165', desc: '请填写类全路径!'}),whitespace:true}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label={seiIntl.get({key: 'flow_000166', desc: '条件属性说明服务地址'})}>
                                {getFieldDecorator('conditonProperties', {
                                    initialValue: FormValue.conditonProperties ? FormValue.conditonProperties : "",
                                    rules: [{required: true, message: seiIntl.get({key: 'flow_000167', desc: '请填写条件属性说明服务地址!'}),whitespace:true}]
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
                                label={seiIntl.get({key: 'flow_000168', desc: '条件属性值服务地址'})}>
                                {getFieldDecorator('conditonPValue', {
                                    initialValue: FormValue.conditonPValue ? FormValue.conditonPValue : "",
                                    rules: [{required: true, message: seiIntl.get({key: 'flow_000169', desc: '请填写条件属性值服务地址!'}),whitespace:true}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label={seiIntl.get({key: 'flow_000170', desc: '条件属性初始值服务地址'})}>
                                {getFieldDecorator('conditonPSValue', {
                                    initialValue: FormValue.conditonPSValue ? FormValue.conditonPSValue : "",
                                    rules: [{required: true, message: seiIntl.get({key: 'flow_000171', desc: '请填写条件属性初始值服务地址!'}),whitespace:true}]
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
                                label={seiIntl.get({key: 'flow_000172', desc: '流程状态重置服务地址'})}>
                                {getFieldDecorator('conditonStatusRest', {
                                    initialValue: FormValue.conditonStatusRest ? FormValue.conditonStatusRest : "",
                                    rules: [{required: true, message: seiIntl.get({key: 'flow_000173', desc: '请填写流程状态重置服务地址!'}),whitespace:true}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label={seiIntl.get({key: 'flow_000174', desc: '推送待办服务地址'})}>
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
                                label={seiIntl.get({key: 'flow_000095', desc: '提交任务地址'})}>
                                {getFieldDecorator('completeTaskServiceUrl', {
                                    initialValue: FormValue.completeTaskServiceUrl ? FormValue.completeTaskServiceUrl : "",
                                    rules: [{required: true, message: seiIntl.get({key: 'flow_000175', desc: '请填写提交任务地址!'}),whitespace:true}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                {...formItemLayout}
                                label={seiIntl.get({key: 'flow_000096', desc: '表单明细URL'})}>
                                {getFieldDecorator('businessDetailServiceUrl', {
                                    initialValue: FormValue.businessDetailServiceUrl ? FormValue.businessDetailServiceUrl : "",
                                    rules: [{required: true, message: seiIntl.get({key: 'flow_000176', desc: '请填写表单明细URL!'}),whitespace:true}]
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
                                label={seiIntl.get({key: 'flow_000097', desc: '表单URL'})}>
                                {getFieldDecorator('lookUrl', {
                                    initialValue: FormValue.lookUrl ? FormValue.lookUrl : "",
                                    rules: [{required: true, message: seiIntl.get({key: 'flow_000169', desc: '请填写条件属性值服务地址!'}),whitespace:true}]
                                })(
                                    <Input/>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                  <Row>
                    <FormItem
                      label={seiIntl.get({key: 'flow_000037', desc: '描述'})}
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
