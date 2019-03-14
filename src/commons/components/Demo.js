/**
 * @description demo
 * @author 李艳
 * @date 2018.1.06
 */

import React, {Component} from 'react';
import SimpleTable from "./SimpleTable";
import httpUtils from "../utils/FeatchUtils";
import { host} from "../../configs/DefaultConfig";
import {cache} from "../utils/CommonUtils";
import {Button, Menu, Icon, Select, Popconfirm} from "antd";
import StandardTree from "./StandardTree";
import StandardDropdown from "./StandardDropdown";

const SubMenu = Menu.SubMenu;
const Option = Select.Option;

class Demo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
      treeData: []
    };

  }

  componentWillMount() {
    this.getTreeData()
  }

  testNetwork = () => {
    console.log("cache:", cache.get('Authorization'))
  };
  getTreeData = (param) => {
  };
  buttons = () => {
    return [
      <Button>button1</Button>,
      <Button>button2</Button>,
      <Button>button3</Button>,
      <Button>button4</Button>,
      <Button>button5</Button>,
      <Button>button6</Button>,
      <Button>button7</Button>,
      <Button>button8</Button>
    ];
  };

  render() {
    const col = [
      {name: '姓名', dataIndex: 'name', key: 'name'},
      {name: '年龄', dataIndex: 'age', key: 'age'}];
    return (
      <div style={{marginLeft: "30%", marginRight: "30%"}}>
        <div style={{textAlign: "center", color: "red", marginTop: 20}}>Demo</div>
        {/*<SimpleTable*/}
        {/*rowKey={'name'}*/}
        {/*columns={col}*/}
        {/*data={this.state.tableData}/>*/}
        <Button onClick={() => {
        }}>接口测试</Button>
        <Button onClick={() => {
        }}>接口测试2</Button>
        {/*<StandardTree*/}
        {/*checkable*/}
        {/*dadaSource={this.state.treeData}/>*/}
        {/*<Select style={{width:220}}>*/}
        {/*<Option value="lucy"><Button>按钮1                                                            </Button></Option>*/}
        {/*</Select>*/}
        <StandardDropdown
          operator={this.buttons()}
          />
      </div>
    );
  }
}


export default Demo
