import React, {Component} from 'react';
import {Form, Modal, InputNumber} from 'antd';
import {seiLocale} from 'sei-utils';
import SearchTable from "@/components/SearchTable";
import {allflowTypeConfig} from '@/utils/CommonComponentsConfig';

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
      flowTypeId: "",
      recentDate: 6
    }
  }


  setStateNull = () => {
    this.setState({
      businessModelId: "",
      flowTypeId: "",
      recentDate: 6
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
        flowTypeId: ""
      });
    } else {
      this.setState({
        flowTypeId: ""
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
                config={allflowTypeConfig}
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
              <InputNumber addonAfter="个月" min={1} max={5}
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
