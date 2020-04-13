/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/15
 */
import React, {Component} from 'react';
import {Input, Select} from "antd";
import SelectWithService from "@/components/SelectWithService";
import {flowMyBillsAppConfig, appModuleAuthConfigBasic} from "@/utils/CommonComponentsConfig";
import {seiLocale} from 'sei-utils';

const {seiIntl} = seiLocale;

class MyOrderTbar extends Component {
  state = {
    appModelCode: null,
    modelId: null,
    quickValue: "",
    orderType: "all"
  }
  refreshData = () => {
    const {handleSearchValue} = this.props;
    const {quickValue, orderType, modelId, appModelCode} = this.state;
    let newFlowDate = {
      "Q_EQ_ended_Boolean": (orderType === "all" ? null : ( orderType === "ended" || orderType === "abnormalEnd" )),
      "Q_EQ_manuallyEnd_Boolean": (orderType === "all" ? null : (orderType === "abnormalEnd" ))
    }
    handleSearchValue && handleSearchValue({appModelCode, modelId, quickValue, ...newFlowDate});
  }

  handleChange = (modelId) => {
    if (!modelId) {
      this.setState({quickValue: ""});
    }
    this.setState({modelId}, () => this.refreshData());
  }
  handleChangeAppModule = (appModelCode) => {
    this.setState({appModelCode}, () => this.refreshData());
  }
  handleChangeOrderType = (orderType) => {
    if (!orderType) {
      this.setState({quickValue: ""});
    }
    this.setState({orderType}, () => this.refreshData());
  }
  handleSearch = (quickValue) => {
    this.setState({quickValue}, () => this.refreshData());
  }

  render() {
    const {visible = false} = this.props;
    const {appModelCode, orderType, modelId} = this.state;
    return (
      <div className={"tbar-right"} style={{ display: visible ? 'flex' : 'none', width: 860, }}>
        <Select defaultValue="all" placeholder={seiIntl.get({key: 'common_001091', desc: '选择流程类型'})}
                onChange={this.handleChangeOrderType} style={{width: "24%"}} allowClear={true}>
          <Select.Option key='all' value='all'>{seiIntl.get({key: 'common_001092', desc: '全部'})}</Select.Option>
          <Select.Option key='inFlow' value='inFlow'>{seiIntl.get({key: 'common_000239', desc: '流程中'})}</Select.Option>
          <Select.Option key='ended' value='ended'>{seiIntl.get({key: 'common_000240', desc: '正常完成'})}</Select.Option>
          <Select.Option key='abnormalEnd' value='abnormalEnd'>{seiIntl.get({
            key: 'common_001095',
            desc: '异常结束'
          })}</Select.Option>
        </Select>
        <SelectWithService
          style={{width: 200, marginLeft: 8}}
          value={appModelCode}
          params={{"orderType": orderType}}
          config={appModuleAuthConfigBasic}
          placeholder={seiIntl.get({key: 'common_000319', desc: '选择应用模块'})}
          onChange={this.handleChangeAppModule}
        />
        <SelectWithService
          style={{width: 200, marginLeft: 8}}
          value={modelId}
          params={{"orderType": orderType,"appModelCode":appModelCode}}
          config={flowMyBillsAppConfig}
          placeholder={seiIntl.get({key: 'common_000212', desc: '选择单据类型'})}
          onChange={this.handleChange}
        />
        <Input.Search
          style={{width: 200, marginLeft: 8}}
          allowClear
          placeholder={seiIntl.get({key: 'common_000024', desc: '输入关键字查询'})}
          onSearch={this.handleSearch}
        />
      </div>
    );
  }
}

export default MyOrderTbar;
