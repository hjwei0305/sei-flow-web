/**
 * @description demo
 * @author 李艳
 * @date 2018.1.06
 */

import React, {Component} from 'react';
import httpUtils from "../utils/FeatchUtils";
import {basicUrl} from "../../configs/DefaultConfig";
import {cache} from "../utils/CommonUtils";
import {Button, Menu,Select} from "antd";

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
  }


  render() {
    const col = [
      {name: '姓名', dataIndex: 'name', key: 'name'},
      {name: '年龄', dataIndex: 'age', key: 'age'}];
    return (
      <div style={{marginLeft: "30%", marginRight: "30%"}}>


      </div>
    );
  }
}


export default Demo
