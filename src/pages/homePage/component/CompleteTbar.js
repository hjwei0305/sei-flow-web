/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/15
 */
import React, {Component, Fragment} from 'react';
import SelectWithService from "@/components/SelectWithService";
import {flowHistoryAppConfig} from "@/utils/CommonComponentsConfig";
import {Input,Select} from "antd";
import { seiLocale } from 'sei-utils';

const { seiIntl } = seiLocale;
class CompleteTbar extends Component {
  state = {
    modelId: null,
    quickValue: "",
    dataType:"all"
  }
  refreshData = () => {
    const {handleSearchValue} = this.props;
    const {modelId,quickValue,dataType} = this.state;
    let newFlowDate = {
      "Q_IN_flowExecuteStatus_String": (dataType === "all" ? null :  dataType   )
    }
    handleSearchValue && handleSearchValue({ modelId , quickValue, ...newFlowDate});
  }
  handleChange = (modelId) => {
    if (!modelId) {
      //todo UI页面上的值还没清空
      this.setState({ quickValue: "" });
    }
    this.setState({ modelId }, () => this.refreshData());
  }
  handleChangeDataType = (dataType) => {
    if (!dataType) {
      this.setState({ quickValue: "" });
    }
    this.setState({ dataType }, () => this.refreshData());
  }
  handleSearch = (quickValue) => {
    this.setState({quickValue},()=>this.refreshData());
  }
  render() {
    const { modelId,dataType } = this.state;
    const {visible=false} = this.props;
    return (
      <div className={"tbar-right"} style={{ display: visible ? 'flex' : 'none', width: 860, }} >
        <Select  defaultValue ="all"  placeholder={seiIntl.get({key: 'common_001097', desc: '选择数据类型'})}
                 onChange={this.handleChangeDataType} style={{ width: "24%" }} allowClear={true}  >
          <Select.Option key='all' value='all'>{seiIntl.get({key: 'common_001092', desc: '全部'})}</Select.Option>
          <Select.Option key='valid' value='valid'>{seiIntl.get({key: 'common_001098', desc: '有效数据'})}</Select.Option>
          <Select.Option key='record' value='record'>{seiIntl.get({key: 'common_001099', desc: '记录数据'})}</Select.Option>
        </Select>
        <SelectWithService
          style={{width: 200, marginLeft: 8}}
          value={modelId}
          params = {{"dataType":dataType}}
          config={flowHistoryAppConfig}
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
export default CompleteTbar;
