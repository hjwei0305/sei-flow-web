/**
 * @description 下拉菜单，operator：操作菜单数组，overlay：int类型，表示前overlay个菜单从左至右平铺，
 * 从第表示前overlay个菜单从左至右平铺个过后，显示在下拉菜单内
 * @author 李艳
 * @date 2019.03.11
 */

import React, {Component} from 'react';
import {Menu, Dropdown} from "antd";


const SubMenu = Menu.SubMenu;

class StandardDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getOverFlow = () => {
    const {operator, overlay} = this.props;
    let overData = operator;
    if (overlay && operator.length > overlay) {
      overData = operator.slice(0, overlay);
    } else if (!overlay && operator.length > 2) {
      overData = operator.slice(0, 2);//没配置overlay时默认展开两个item
    }
    return overData
  };

  getMenu = () => {
    const {operator, overlay} = this.props;
    let menuData = [];
    if (overlay) {
      menuData = operator.slice(overlay, operator.length);
    } else {
      menuData = operator.slice(2, operator.length);
    }
    return <Menu>
      {menuData.map((item, i) => {
        return <Menu.Item key={"menu" + i}>
          {item}
        </Menu.Item>
      })}
    </Menu>
  };

  render() {
    const {operator, overlay} = this.props;

    return (
      <div style={{textAlign: "center"}}>
        {this.getOverFlow()}
        {(!overlay && operator.length > 2) || (overlay && operator.length > overlay) ?
          <Dropdown overlay={this.getMenu()}>
            <a className="ant-dropdown-link" href="#">
              ...
            </a>
          </Dropdown> : null}
      </div>
    );
  }
}


export default StandardDropdown
