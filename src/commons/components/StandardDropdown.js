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

  getVisibleOperaters = () => {
    let visibleOperaters = [];
    const {operator} = this.props;
    if (operator){
      operator.map(item=>{
        if (item.props.operateCode&&item.type&&item.type.name==='CheckAuth'&&item.props.children){
            visibleOperaters.push(item)
        }else if(!item.props.operateCode){
            visibleOperaters.push(item)
        }
      });
    }
     return visibleOperaters
  };
  getOverFlow = () => {
    let visibleOperaters=this.getVisibleOperaters();
    const {overlay} = this.props;
    let overData = visibleOperaters;
    if (overlay && visibleOperaters.length > overlay) {
      overData = visibleOperaters.slice(0, overlay);
    } else if (!overlay && visibleOperaters.length > 2) {
      overData = visibleOperaters.slice(0, 2);//没配置overlay时默认展开两个item
    }
    return overData
  };

  getMenu = () => {
    let visibleOperaters=this.getVisibleOperaters();
    const {overlay} = this.props;
    let menuData = [];
    if (overlay) {
      menuData = visibleOperaters.slice(overlay, visibleOperaters.length);
    } else {
      menuData = visibleOperaters.slice(2, visibleOperaters.length);
    }
      console.log('menuData--',menuData);
    //render之后所有外层的type都不是CheckAuth了，这里过滤掉没有权限的小白块
      let menuRender=[];
      {menuData.map((item, i) => {
          if(item.type&&item.type.name!=='CheckAuth'){
              menuRender.push(<Menu.Item key={"menu" + i}>
                  {item}
              </Menu.Item>)
          }
      })}
      // console.log('menuRender--',menuRender);
    return menuRender.length? <Menu>{menuRender}</Menu>:null
  };

  render() {
    const {operator, overlay} = this.props;
    let visibleOperaters=this.getVisibleOperaters();
    return (
      <div style={{textAlign: "left"}}>
        {this.getOverFlow()}
        {this.getMenu() ?
          <Dropdown overlay={this.getMenu()}>
            <a className="ant-dropdown-link">
              ...
            </a>
          </Dropdown> : null}
      </div>
    );
  }
}


export default StandardDropdown
