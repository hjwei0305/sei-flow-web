/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/15
 */
import React, { Component } from 'react';
import SelectWithService from "@/components/SelectWithService";
import { flowTaskAppConfig } from "@/utils/CommonComponentsConfig";
import { Input, Button, Switch } from "antd";
import { seiLocale } from 'sei-utils';

const { seiIntl } = seiLocale;
class TodoTbar extends Component {
  state = {
    modelId: null,
    quickValue: "",
    S_priority: "DESC",
  }

  refreshData = () => {
    const { handleSearchValue } = this.props;
    const { modelId, quickValue, S_priority } = this.state;
    handleSearchValue && handleSearchValue({ modelId, quickValue, S_priority});
  }
  setOrder = (checked) => {
    this.setState({ S_priority: checked ? "ASC" : "DESC" }, () => this.refreshData());
  }
  handleChange = (modelId) => {
    if (!modelId) {
      //todo UI页面上的值还没清空
      this.setState({ quickValue: "" });
    }
    this.setState({ modelId }, () => this.refreshData());
  }
  handleSearch = (quickValue) => {
    this.setState({ quickValue }, () => this.refreshData());
  }
  handleBatchApprove = () => {
    this.props.handleBatchApproce(true)
  }
  handlePageChange = (pageInfo) => {
    this.setState({ pageInfo: { ...pageInfo } }, () => this.refreshData());
  }
  render() {
    const { modelId } = this.state;
    const { visible = false } = this.props;
    return (
      visible && <div className={"tbar-right"}>
        <SelectWithService
          value={modelId}
          config={flowTaskAppConfig}
          placeholder={seiIntl.get({key: 'common_000212', desc: '选择单据类型'})}
          onChange={this.handleChange}
        />
        <Input.Search
          style={{ margin: "0 8px" }}
          allowClear
          placeholder={seiIntl.get({key: 'common_000024', desc: '输入关键字查询'})}
          onSearch={this.handleSearch}
        />
        <Button
          style={{ marginRight: 8 }}
          onClick={this.handleBatchApprove}
        >
          {seiIntl.get({key: 'common_000254', desc: '批量审批'})}
        </Button>
        <Switch
          style={{ width: 170 }}
          checkedChildren={seiIntl.get({key: 'common_000255', desc: '降序'})}
          unCheckedChildren={seiIntl.get({key: 'common_000255', desc: '降序'})}
          onChange={this.setOrder}
        />
      </div>
    );
  }
}

export default TodoTbar;
