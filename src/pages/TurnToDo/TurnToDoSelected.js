/**
 * @description 任意转办弹窗
 * @author 何灿坤
 */

import React, {Component} from 'react'
import TransferTable from "@/components/TransferTable";
import {listAllOrgs, listAllUserByOrgId} from './TurnToDoService';
import {seiLocale} from 'sei-utils';

const {seiIntl} = seiLocale;

class AnyOneSelected extends Component {
  //删除分配,设置左右表格的值
  handleLeftClick = async (rows, rightData) => {
    let right = [];
    //获取已分配的数组
    for (let data of rightData) {
      if (rows.findIndex(item => item.id === data.id) > -1) {
        continue;
      }
      right.push(data);
    }
    this.setState({rightData: right})

  }


  constructor(props) {
    super(props);
    this.state = {
      leftData: null,
      rightData: null,
      orgId: null
    };
  }

  //插入分配,设置左右表格的值
  handleRightClick = async (rows, rightData) => {
    let right = [];
    if (this.props.type !== 'checkbox') {
      right = rows;
    } else {
      for (let i = 0; i < rows.length; i++) {
        right.push(rows[i]);
      }
      //获取已分配的数组
      for (let data of rightData) {
        if (rows.findIndex(item => item.id === data.id) > -1) {
          continue;
        }
        right.push(data);
      }
    }
    this.setState({rightData: right})
    if (this.props.selectChange) {
      this.props.selectChange(right.map(row => row.id))
    }
  };

  leftService = async (params) => {
    let result = null;
    if (this.state.orgId) {
      await listAllUserByOrgId(this.state.orgId).then((res) => {
        result = res.data;
      });
    }
    return result;
  };

  rightService = async () => {
    return this.state.rightData;
  };

  listAllOrgsConfig = {
    props: {initValue: true},
    service: listAllOrgs,
    key: 'id',
    text: 'name'
  }

  //左边table的selec选择触发的
  async JointQueryService(key, param2, record) {
    let result = null;
    await listAllUserByOrgId(key).then((res) => {
      this.setState({orgId: key})
      result = res.data
    });
    return result;
  };

  render() {
    const columns = [
      {
        title: seiIntl.get({key: 'flow_000021', desc: '代码'}),
        dataIndex: "code",
      }, {
        title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
        dataIndex: "userName",
      }, {
        title: seiIntl.get({key: 'organizationName', desc: '部门'}),
        dataIndex: "organization.name",
      }
    ];
    return (
      <TransferTable
        radio={this.props.type !== 'checkbox'}
        onRef={ref => this.tranfer = ref}
        style={{background: "#fff"}}
        handleLeftClick={this.handleLeftClick.bind(this)}
        handleRightClick={this.handleRightClick.bind(this)}
        rightService={this.rightService.bind(this)}
        leftService={this.leftService.bind(this)}
        JointQueryService={this.JointQueryService.bind(this)}
        treeSelectConfig={this.listAllOrgsConfig}
        leftColumns={columns}
        rightColumns={columns}
        searchLeftKey={['code', 'userName']}
        heightY={250}
        rightTitle={seiIntl.get({key: 'flow_000059', desc: '已选择'})}
        leftTitle={seiIntl.get({key: 'flow_000060', desc: '所有人员'})}
      />
    );
  }


}

export default AnyOneSelected


