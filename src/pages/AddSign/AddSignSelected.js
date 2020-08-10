/**
 * @description 会签加签弹窗
 * @author 何灿坤
 */

import React, {Component} from 'react'
import { message } from 'suid';
import TransferTable from "@/components/TransferTable";
import {listAllOrgs, listAllUserByOrgId, getAddSignExecutorList} from './AddSignService';
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;
class AnyOneSelected extends Component {
  selectedNew = [];

  constructor(props) {
    super(props);
    this.state = {
      leftData: null,
      rightData: null,
      oldExecutorData: null,
      oneLook: true,
      orgId: null
    };
  }

  //删除分配,设置左右表格的值
  handleLeftClick = async (rows, rightData) => {
    let right = [];
    //原有执行人不能移除
    for (let data of this.state.oldExecutorData) {
      if (rows.findIndex(item => item.id === data.id) > -1) {
        message.warn(seiIntl.get({key: 'flow_000188', desc: '不能移除原有执行人！【{0}】'}, [data.userName]));
        return;
      }
      continue;
    }
    //获取已分配的数组
    for (let data of rightData) {
      if (rows.findIndex(item => item.id === data.id) > -1) {
        continue;
      }
      right.push(data);
    }

    this.selectedNew = [];
    for (let data of right) {
      if (this.state.oldExecutorData.findIndex(item => item.id === data.id) > -1) {
        continue;
      }
      this.selectedNew.push(data);  //得到依然属于新增的人
    }
    this.setState({rightData: right});
    if (this.props.selectChange) {
      this.props.selectChange(this.selectedNew.map(row => row.id))
    }
  }

  //插入分配,设置左右表格的值
  handleRightClick = async (rows, rightData) => {
    let right = [];
    if (this.props.type !== 'checkbox') {
      right = rows;
    } else {
      for (let i = 0; i < rightData.length; i++) {
        right.push(rightData[i]);
      }
      //添加新增的人
      for (let data of rows) {
        if (rightData.findIndex(item => item.id === data.id) > -1) {
          continue;
        }
        right.push(data);
        this.selectedNew.push(data);
      }
    }
    this.setState({rightData: right});
    if (this.props.selectChange) {
      this.props.selectChange(this.selectedNew.map(row => row.id))
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

  rightService = async (params) => {
    if (this.state.oneLook) {
      Object.assign(params, {
        actInstanceId: this.props.actInstanceId, taskActKey: this.props.taskActKey
      });
      await getAddSignExecutorList(params).then(dataList => {
        let right = [];
        for (let data of dataList) {
          right.push({id: data.id, code: data.code, userName: data.name});
        }
        this.setState({rightData: right, oldExecutorData: right, oneLook: false});
      });
    }
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
        leftTitle={seiIntl.get({key: 'flow_000060', desc: '所有人员'})}
        rightTitle={seiIntl.get({key: 'flow_000071', desc: '会签执行人'})}
      />
    );
  }


}

export default AnyOneSelected


