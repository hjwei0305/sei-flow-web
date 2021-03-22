
import React, { Component } from "react";
import TransferTable from "@/components/TransferTable";
import { listAllOrgs, listUserByOrg } from "./FlowInstanceService";

class AnyOneSelected extends Component {
  listAllOrgsConfig = {
    props: { initValue: true },
    service: listAllOrgs,
    key: "id",
    text: "name"
  };

  constructor(props) {
    super(props);
    this.state = {
      rightData: null,
      orgId: null
    };
  }

  // 删除分配,设置左右表格的值
  handleLeftClick = async (rows, rightData) => {
    let right = rightData.filter(item => {
      return !rows.some(rowItem => {
        return item.id === rowItem.id;
      });
    });
    this.setState({ rightData: right });
  };

  // 插入分配,设置左右表格的值
  handleRightClick = async (rows, rightData) => {
    const { type, selectChange } = this.props;
    let right = [];
    if (type !== "checkbox") {
      right = rows;
    } else {
      for (let i = 0; i < rows.length; i += 1) {
        right.push(rows[i]);
      }
      const tempRight = rightData.filter(item => {
        return !rows.some(rowItem => {
          return item.id === rowItem.id;
        });
      });
      right = right.concat(tempRight);
    }
    this.setState({ rightData: right });
    if (selectChange) {
      selectChange(right.map(row => row.id));
    }
  };

  leftService = async params => {
    const { orgId } = this.state;
    let result = null;
    await listUserByOrg(orgId, params.quickSearchValue, params.pageInfo).then(
      res => {
        result = res.data;
      }
    );
    return result;
  };

  rightService = async () => {
    const { rightData } = this.state;
    return rightData;
  };

  // 左边table的selec选择触发的
  JointQueryService = async (key, p1, p2, searchValue) => {
    let result = null;
    await listUserByOrg(key, searchValue).then(res => {
      this.setState({ orgId: key });
      result = res.data;
    });
    return result;
  };

  render() {
    const { type } = this.props;
    const columns = [
      {
        title: "代码",
        dataIndex: "code",
        width: 80
      },
      {
        title: "名称",
        dataIndex: "userName"
      },
      {
        title: "部门",
        dataIndex: "organizationName",
        width: 260
      }
    ];
    return (
      <TransferTable
        radio={type !== "checkbox"}
        onRef={ref => {
          this.tranfer = ref;
        }}
        style={{ background: "#fff" }}
        handleLeftClick={this.handleLeftClick}
        handleRightClick={this.handleRightClick}
        rightService={this.rightService}
        leftService={this.leftService}
        JointQueryService={this.JointQueryService}
        treeSelectConfig={this.listAllOrgsConfig}
        leftColumns={columns}
        rightColumns={columns}
        searchLeftKey={["code", "userName"]}
        heightY={250}
        rightTitle="已选择"
        leftTitle="所有人员"
      />
    );
  }
}

export default AnyOneSelected;
