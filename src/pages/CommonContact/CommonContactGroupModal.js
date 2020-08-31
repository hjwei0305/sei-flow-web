/**
 * @description 常用联系组弹窗
 * @author 何灿坤
 */

import React, {Component} from 'react'
import {Form, Input, InputNumber, Modal} from 'antd';
import {seiLocale} from 'sei-utils';

const { seiIntl } = seiLocale;
const FormItem = Form.Item;

class CommonContactGroupModal extends Component {
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
                span: 8
            },
            wrapperCol: {
                span: 12
            },
        };

        const {confirmLoading, modalVisible, handleOk, handleCancel, defaultValue,isAdd} = this.props;
        const {getFieldDecorator} = this.props.form;
        let FormValue = defaultValue;
        let title =seiIntl.get({key: 'flow_000302', desc: '編輯常用联系组'});
        if (isAdd) {
            title =seiIntl.get({key: 'flow_000301', desc: '新增常用联系组'});
            FormValue = {}
        }
        return (
            <div>
                <Modal  title={title}
                       visible={modalVisible}
                       onOk={handleOk}
                       onCancel={handleCancel}
                       width={600}
                       afterClose={this.handleClose}
                       confirmLoading={confirmLoading}
                       maskClosable={false}
                >
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label={seiIntl.get({key: 'flow_000022', desc: '名称'})}>
                            {getFieldDecorator('name', {
                                initialValue: FormValue.name ?FormValue.name:"",
                                rules: [{required: true, message: seiIntl.get({key: 'flow_000042', desc: '请填写名称!'})}]
                            })(
                                <Input/>
                            )}
                        </FormItem>
                        <FormItem
                          {...formItemLayout}
                          label={seiIntl.get({key: 'flow_000177', desc: '排序'})}>
                          {getFieldDecorator('rank', {
                            initialValue: FormValue.rank >= 0 ? FormValue.rank : "",
                            rules: [{required: true, message: seiIntl.get({key: 'flow_000178', desc: '请填写排序!'})}]
                          })(
                            <InputNumber precision={0} min={0} style={{width: "100%"}}/>
                          )}
                        </FormItem>
                        <FormItem
                            style={{display: "none"}}>
                            {getFieldDecorator('id', {
                                initialValue: FormValue.id ? FormValue.id : "",
                            })(
                                <Input disabled/>
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        );
    }
}

CommonContactGroupModal = Form.create()(CommonContactGroupModal);
export default CommonContactGroupModal;
