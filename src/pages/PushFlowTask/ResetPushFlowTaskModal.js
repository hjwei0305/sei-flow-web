import React, {Component} from 'react';
import {Form, Modal, Select, InputNumber} from 'antd';
import {seiLocale} from 'sei-utils';
import SearchTable from "@/components/SearchTable";
import {
  appModuleAuthConfig,
  businessModelByAppModelConfig,
  flowTypeByBusinessModelConfig
} from '@/utils/CommonComponentsConfig';

const {seiIntl} = seiLocale;

const FormItem = Form.Item;


class ResetPushFlowTaskModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      endValue: null,
      startValue: null,
      modalVisible: false,
      confirmLoading: false,
      appModuleId: "",
      businessModelId: "",
      flowTypeId: "",
      recentDate: 12
    }
  }


  setStateNull = () => {
    this.setState({
      appModuleId: "",
      businessModelId: "",
      flowTypeId: "",
      recentDate: 12
    });
  }

  handleClose = () => {
    this.props.form.resetFields();
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  recentChange = value => {
    this.setState({recentDate: value});
  }

  selectChangeAppModel = (record) => {
    if (record && record.id) {
      this.setState({
        appModuleId: record.id,
        businessModelId: "",
        flowTypeId: "",
      });
    } else {
      this.setState({
        appModuleId: "",
        businessModelId: "",
        flowTypeId: "",
      });
    }
  };

  selectChangeBusinessModel = (record) => {
    if (record && record.id) {
      this.setState({businessModelId: record.id, flowTypeId: ""});
    } else {
      this.setState({businessModelId: "", flowTypeId: ""});
    }
  };

  selectChangeFlowType = (record) => {
    if (record && record.id) {
      this.setState({flowTypeId: record.id});
    } else {
      this.setState({flowTypeId: ""});
    }
  };


  render() {
    const formItemLayout = {
      labelCol: {
        span: 7
      },
      wrapperCol: {
        span: 14
      },
    };

    const {confirmLoading, modalVisible, handleOk, handleCancel, defaultValue} = this.props;
    const {getFieldDecorator} = this.props.form;
    let FormValue = defaultValue;

    return (
      <div>
        <Modal title={seiIntl.get({key: 'flow_000326', desc: '清理历史数据'})}
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
            {...formItemLayout}
            label={seiIntl.get({key: 'flow_000041', desc: '应用模块'})}>
            {getFieldDecorator('appModuleId', {
              initialValue: FormValue.appModuleId ? FormValue.appModuleId : "",
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
              initialValue: FormValue.businessModelId ? FormValue.businessModelId : "",
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
              initialValue: FormValue.flowTypeId ? FormValue.flowTypeId : "",
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
            label={seiIntl.get({key: 'flow_000327', desc: '保留最近'})}>
            {getFieldDecorator('recentDate', {
              initialValue: this.state.recentDate,
              rules: [{required: true, message: seiIntl.get({key: 'flow_000328', desc: '请输入最近保留时间!'})}
              ]
            })(
              <InputNumber addonAfter="个月" min={1} max={36}
                           formatter={value => `${value}个月`}
                           onChange={this.recentChange} style={{width: "323px"}}/>
            )}
          </FormItem>
        </Modal>
      </div>
    );
  }
}

ResetPushFlowTaskModal = Form.create()(ResetPushFlowTaskModal);
export default ResetPushFlowTaskModal;
