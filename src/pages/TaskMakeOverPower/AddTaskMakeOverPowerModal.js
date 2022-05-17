import React, {Component} from 'react';
import {Form, Input, Modal, DatePicker, Button, Col, Row, Select} from 'antd';
import {seiLocale} from 'sei-utils';
import AnyOneSelected from './TaskMakeOverPowerSelected';
import SearchTable from "@/components/SearchTable";
import {
  appModuleAuthConfig,
  businessModelByAppModelConfig,
  flowTypeByBusinessModelConfig
} from '@/utils/CommonComponentsConfig';
import moment from 'moment';
import {userUtils} from '@/utils';
import {message} from "suid";

const {seiIntl} = seiLocale;

const FormItem = Form.Item;

const {getCurrentUser} = userUtils;
const currUser = getCurrentUser();
const {authorityPolicy} = currUser || {};
//TenantAdmin:租户管理员 GlobalAdmin:全局管理员
const isAdmin = authorityPolicy === 'TenantAdmin';

class AddTaskMakeOverPowerModal extends Component {

  selectedOne = null;

  constructor(props) {
    super(props);
    this.state = {
      endValue: null,
      startValue: null,
      modalVisible: false,
      confirmLoading: false,
      selectUserModal: false,
      appModuleId: "",
      appModuleName: "",
      businessModelId: "",
      businessModelName: "",
      flowTypeId: "",
      flowTypeName: "",
      selectUserOrPower: false
    }
  }

  selectAnyUser = () => {
    this.setState({selectUserOrPower: true, selectUserModal: true});
  }

  selectAnyOne = () => {
    this.setState({selectUserOrPower: false, selectUserModal: true});
  }

  handleClose = () => {
    this.props.form.resetFields();
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  //设置开始日期不能选择的时间
  disabledStartDate = startValue => {
    const {endValue} = this.state
    if (!startValue || !endValue) {
      return false
    }
    return startValue.valueOf() > endValue.valueOf()
  }

  //设置结束不能选择的时间
  disabledEndDate = endValue => {
    const {startValue} = this.state
    if (!endValue || !startValue) {
      return false
    }
    return endValue.valueOf() < startValue.valueOf()
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    })
  }

  onStartChange = value => {
    this.onChange('startValue', value)
  }

  onEndChange = value => {
    this.onChange('endValue', value)
  }

  setStateNull = () => {
    this.setState({
      appModuleId: "",
      appModuleName: "",
      businessModelId: "",
      businessModelName: "",
      flowTypeId: "",
      flowTypeName: ""
    });
  }

  selectChangeAppModel = (record) => {
    if (record && record.id) {
      this.setState({
        appModuleId: record.id,
        appModuleName: record.name,
        businessModelId: "",
        businessModelName: "",
        flowTypeId: "",
        flowTypeName: ""
      });
    } else {
      this.setState({
        appModuleId: "",
        appModuleName: "",
        businessModelId: "",
        businessModelName: "",
        flowTypeId: "",
        flowTypeName: ""
      });
    }
  };

  selectChangeBusinessModel = (record) => {
    if (record && record.id) {
      this.setState({businessModelId: record.id, businessModelName: record.name, flowTypeId: "", flowTypeName: ""});
    } else {
      this.setState({businessModelId: "", businessModelName: "", flowTypeId: "", flowTypeName: ""});
    }
  };

  selectChangeFlowType = (record) => {
    if (record && record.id) {
      this.setState({flowTypeId: record.id, flowTypeName: record.name});
    } else {
      this.setState({flowTypeId: "", flowTypeName: ""});
    }
  };


  okHandle = () => {
    if (this.selectedOne) {
      if (this.state.selectUserOrPower) {
        this.props.form.setFieldsValue({
          'userId': this.selectedOne.id,
          'userAccount': this.selectedOne.code,
          'userName': this.selectedOne.userName
        });
      } else {
        this.props.form.setFieldsValue({
          'powerUserId': this.selectedOne.id,
          'powerUserAccount': this.selectedOne.code,
          'powerUserName': this.selectedOne.userName,
          'powerUserOrgId': this.selectedOne.organizationId,
          'powerUserOrgCode': this.selectedOne.organizationCode,
          'powerUserOrgName': this.selectedOne.organizationName

        });
      }
      this.setState({
        selectUserModal: false
      });
    } else {
      message.error(seiIntl.get({key: 'flow_000027', desc: '请选择一行数据！'}));
    }
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
    let title = seiIntl.get({key: 'flow_000031', desc: '编辑'});
    let FormValue = defaultValue;
    if (isAdd) {
      title = seiIntl.get({key: 'flow_000039', desc: '新增'});
      FormValue = {}
    }
    const dateFormat = 'YYYY-MM-DD';


    return (
      <div>
        <Modal title={title}
               destroyOnClose={true}
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
            style={{display: "none"}}
            label="powerUserId">
            {getFieldDecorator('powerUserId', {
              initialValue: FormValue.powerUserId ? FormValue.powerUserId : "",
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="powerUserAccount">
            {getFieldDecorator('powerUserAccount', {
              initialValue: FormValue.powerUserAccount ? FormValue.powerUserAccount : "",
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="powerUserOrgId">
            {getFieldDecorator('powerUserOrgId', {
              initialValue: FormValue.powerUserOrgId ? FormValue.powerUserOrgId : "",
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="powerUserOrgCode">
            {getFieldDecorator('powerUserOrgCode', {
              initialValue: FormValue.powerUserOrgCode ? FormValue.powerUserOrgCode : "",
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="powerUserOrgName">
            {getFieldDecorator('powerUserOrgName', {
              initialValue: FormValue.powerUserOrgName ? FormValue.powerUserOrgName : "",
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="openStatus">
            {getFieldDecorator('openStatus', {
              initialValue: FormValue.openStatus ? FormValue.openStatus : true,
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="appModuleName">
            {getFieldDecorator('appModuleName', {
              initialValue: FormValue.appModuleName ? FormValue.appModuleName : this.state.appModuleName,
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="businessModelName">
            {getFieldDecorator('businessModelName', {
              initialValue: FormValue.businessModelName ? FormValue.businessModelName : this.state.businessModelName,
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="flowTypeName">
            {getFieldDecorator('flowTypeName', {
              initialValue: FormValue.flowTypeName ? FormValue.flowTypeName : this.state.flowTypeName,
            })(
              <Input/>
            )}
          </FormItem>


          <FormItem
            style={{display: "none"}}
            label="flowTypeName">
            {getFieldDecorator('userId', {
              initialValue: FormValue.userId ? FormValue.userId : "",
            })(
              <Input/>
            )}
          </FormItem>
          <FormItem
            style={{display: "none"}}
            label="flowTypeName">
            {getFieldDecorator('userAccount', {
              initialValue: FormValue.userAccount ? FormValue.userAccount : "",
            })(
              <Input/>
            )}
          </FormItem>


          <FormItem
            {...formItemLayout}
            style={{display: ( isAdmin ? "block" : "none" )}}
            label={seiIntl.get({key: 'flow_000291', desc: '授权用户'})}>
            <Row gutter={10}>
              <Col span={15}>
                {getFieldDecorator('userName', {
                  initialValue: FormValue.userName ? FormValue.userName : ""
                })(
                  <Input disabled style={{width: "100%"}}/>
                )}
              </Col>
              <Col span={9}>
                <Button disabled={!isAdd} type="primary" onClick={this.selectAnyUser}>{seiIntl.get({
                  key: 'flow_000344',
                  desc: '选择授权用户'
                })}</Button>
              </Col>
            </Row>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000292', desc: '代理用户'})}>
            <Row gutter={10}>
              <Col span={15}>
                {getFieldDecorator('powerUserName', {
                  initialValue: FormValue.powerUserName ? FormValue.powerUserName : "",
                  rules: [{required: true, message: seiIntl.get({key: 'flow_000211', desc: '请选择代理用户!'})}]
                })(
                  <Input disabled style={{width: "100%"}}/>
                )}
              </Col>
              <Col span={9}>
                <Button disabled={!isAdd} type="primary" onClick={this.selectAnyOne}>{seiIntl.get({
                  key: 'flow_000214',
                  desc: '选择代理用户'
                })}</Button>
              </Col>
            </Row>
          </FormItem>

          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000295', desc: '授权类型'})}>
            {getFieldDecorator('makeOverPowerType', {
              initialValue: FormValue.makeOverPowerType ? FormValue.makeOverPowerType : "sameToSee",
              rules: [{required: true, message: seiIntl.get({key: 'flow_000296', desc: '请选择授权类型'})}
              ]
            })(
              <Select disabled={!isAdd} style={{width: "100%"}} allowClear={false}>
                <Select.Option key='sameToSee' value='sameToSee'>{seiIntl.get({
                  key: 'flow_000297',
                  desc: '协办模式'
                })}</Select.Option>
                <Select.Option key='turnToDo' value='turnToDo'>{seiIntl.get({
                  key: 'flow_000298',
                  desc: '转办模式'
                })}</Select.Option>
              </Select>
            )}
          </FormItem>


          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000041', desc: '应用模块'})}>
            {getFieldDecorator('appModuleId', {
              initialValue: FormValue.appModuleId ? FormValue.appModuleId : this.state.appModuleId,
              rules: [{required: false}
              ]
            })(
              <SearchTable
                key="searchAppModelTable"
                initValue={false}
                isNotFormItem={true}
                config={appModuleAuthConfig}
                selectChange={this.selectChangeAppModel}/>
            )}
          </FormItem>

          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000053', desc: '业务实体'})}>
            {getFieldDecorator('businessModelId', {
              initialValue: FormValue.businessModelId ? FormValue.businessModelId : this.state.businessModelId,
              rules: [{required: false}
              ]
            })(
              <SearchTable
                key="searchBusinessModelTable"
                initValue={false}
                isNotFormItem={true}
                params={{"appModuleId": this.state.appModuleId}}
                config={businessModelByAppModelConfig}
                selectChange={this.selectChangeBusinessModel}/>
            )}
          </FormItem>

          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000055', desc: '流程类型'})}>
            {getFieldDecorator('flowTypeId', {
              initialValue: FormValue.flowTypeId ? FormValue.flowTypeId : this.state.flowTypeId,
              rules: [{required: false}
              ]
            })(
              <SearchTable
                key="searchFlowType"
                initValue={false}
                isNotFormItem={true}
                params={{"businessModelId": this.state.businessModelId}}
                config={flowTypeByBusinessModelConfig}
                selectChange={this.selectChangeFlowType}/>
            )}
          </FormItem>


          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000263', desc: '开始日期'})}>
            {getFieldDecorator('powerStartDate', {
              initialValue: FormValue.powerStartDate ? moment(FormValue.powerStartDate, dateFormat) : this.state.startValue,
              rules: [{required: true, message: seiIntl.get({key: 'flow_000212', desc: '请选择开始日期!'}), type: 'object'}
              ]
            })(
              <DatePicker
                disabledDate={this.disabledStartDate}
                format="YYYY-MM-DD"
                onChange={this.onStartChange}
                style={{width: "100%"}}/>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000264', desc: '结束日期'})}>
            {getFieldDecorator('powerEndDate', {
              initialValue: FormValue.powerEndDate ? moment(FormValue.powerEndDate, dateFormat) : this.state.endValue,
              rules: [{required: true, message: seiIntl.get({key: 'flow_000213', desc: '请选择结束日期!'}), type: 'object'}
              ]
            })(
              <DatePicker
                disabledDate={this.disabledEndDate}
                format="YYYY-MM-DD"
                onChange={this.onEndChange}
                style={{width: "100%"}}/>
            )}
          </FormItem>
        </Modal>
        <Modal
          title={this.state.selectUserOrPower ? `指定授权人` : `指定代理人`}
          bodyStyle={{maxHeight: "720px", overflow: "auto"}}
          width={window.innerWidth * 0.8}
          visible={this.state.selectUserModal}
          onOk={this.okHandle}
          onCancel={() => {
            this.setState({selectUserModal: false});
          }}
          destroyOnClose={true}
          maskClosable={false}
        >
          <AnyOneSelected type='radio' selectChange={(row) => this.selectedOne = row}/>
        </Modal>
      </div>
    );
  }
}

AddTaskMakeOverPowerModal = Form.create()(AddTaskMakeOverPowerModal);
export default AddTaskMakeOverPowerModal;
