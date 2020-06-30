/**
 * @description 会签加签弹窗
 * @author 何灿坤
 */

import React, {Component} from 'react'
import {message} from 'antd';
import TransferTable from "@/components/TransferTable";
import {getSubtractSignExecutorList} from './SubtractSignService';
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;

class SubtractSignSelected extends Component {
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

  //左移人员
  handleLeftClick = async (rows, rightData ) => {
    let right = [];
    let left  = [];
    this.selectedNew = [];
    let leftData = this.state.leftData;
    //获取右边应该有的数据
    for (let data of rightData) {
      if (rows.findIndex(item => item.id === data.id) > -1) {
        continue;
      }
      right.push(data);
      this.selectedNew.push(data);
    }
    //获取左边应该有的数据
    for (let i = 0; i < leftData.length; i++) {
      left.push(leftData[i]);
    }
    for (let data of rows) {
      if (leftData.findIndex(item => item.id === data.id) > -1) {
        continue;
      }
      left.push(data);
    }
    this.setState({rightData: right ,leftData :left});
    if (this.props.selectChange) {
      this.props.selectChange(this.selectedNew.map(row => row.id))
    }
  }

  //右移人员
  handleRightClick = async (rows, rightData) => {
    let right = [];
    let left  = [];
    let leftData = this.state.leftData;
    if (this.props.type !== 'checkbox') {
      right = rows;
    } else {
      for (let i = 0; i < rightData.length; i++) {
        right.push(rightData[i]);
      }
      //获取右边数据
      for (let data of rows) {
        if (rightData.findIndex(item => item.id === data.id) > -1) {
          continue;
        }
        right.push(data);
        this.selectedNew.push(data);
      }
      //获取左边数据
      for (let data of leftData){
        if (rows.findIndex(item => item.id === data.id) > -1) {
          continue;
        }
        left.push(data);
      }
    }
    this.setState({rightData: right ,leftData :left});
    if (this.props.selectChange) {
      this.props.selectChange(this.selectedNew.map(row => row.id))
    }
  };

  leftService = async (params) => {
    if (this.state.oneLook) {
      Object.assign(params, {
        actInstanceId: this.props.actInstanceId, taskActKey: this.props.taskActKey
      });
      await getSubtractSignExecutorList(params).then(dataList => {
        let left = [];
        for (let data of dataList) {
          left.push({id: data.id, code: data.code, userName: data.name});
        }
        this.setState({leftData: left, oneLook: false});
      });
    }
    return this.state.leftData;
  };

  rightService = async (params) => {
    return this.state.rightData;
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
        leftColumns={columns}
        rightColumns={columns}
        searchLeftKey={['code', 'userName']}
        heightY={250}
        leftTitle={seiIntl.get({key: 'flow_000071', desc: '会签执行人'})}
        rightTitle={seiIntl.get({key: 'flow_000072', desc: '减签人员'})}
      />
    );
  }


}

export default SubtractSignSelected


