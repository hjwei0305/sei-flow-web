/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2018/9/27
 */

import React, {Component} from "react"
import {Button, Form, Input} from "antd";
import UploadFile from "../UploadFile";
import AdvanceSearchModal from "./AdvanceSearchModal";
import "./index.css"
import {formItemLayout, getComponent, getDecoratorProps} from "./formConfigUtil";
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;
class ToolBar extends Component {
    state = {
        visible: false
    }
    getSearchItems = (searchBtnCfg) => {
        const {quickSearchCfg, advanceSearchCfg} = searchBtnCfg;
        let items = [];

        if (quickSearchCfg) {
            quickSearchCfg.className = quickSearchCfg.className ? `tbar-search ${quickSearchCfg.className}` : 'tbar-search';
            if(quickSearchCfg.enterButton){
                quickSearchCfg.enterButton = true;
            }
            items.push(<Input.Search key={'0'}  {...quickSearchCfg}/>);
        }
        if (advanceSearchCfg) {
            advanceSearchCfg.style = {marginLeft: 6, ...advanceSearchCfg.style};
            items.push(<Button key={'1'} style={{...advanceSearchCfg.style}} onClick={() => {
                this.setVisible(true)
            }}>{advanceSearchCfg.title}</Button>);
        }
        return items;
    }
    setVisible = (visible) => {
        this.setState({visible: visible})
    }
    getBtnItems = () => {
        const {btnsCfg} = this.props;
        let components = null;
        if(btnsCfg){
            components =  btnsCfg.map(
                (item, i) => {
                    if (item.checkRight !== false) {
                        item.propsCfg = item.propsCfg || {};
                        item.propsCfg.className = item.propsCfg.className ? `tbar-btn ${item.propsCfg.className}` : "tbar-btn";
                        switch (item.type) {
                            case "uploadFile":
                                return (<UploadFile key={i} title={item.title} {...item.propsCfg}/>);
                            case "form":
                                return (
                                    <Form
                                        className={"tbar-form"}
                                        key={i}
                                        layout="inline"
                                        //onSubmit={this.handleSearch}
                                    >
                                        {
                                            item.formItems.map(item => (
                                                this.getColItem(item)
                                            ))
                                        }
                                        <Button type="primary" onClick={()=> this.handleSearch(item)}>{seiIntl.get({key: 'flow_000250', desc: '查询'})}</Button>
                                    </Form>);
                            default:
                                return (<Button key={i} {...item.propsCfg}>{item.title}</Button>);
                        }
                    } else {
                        return null;
                    }
                })
        }
        return components;
    }
    handleSearch = (item) => {
        this.props.form.validateFields((err,values)=>{
            if(!err){
                item.onSearch && item.onSearch(values)
            }
        })
    }
    getColItem = (item) => {
        const {form} = this.props;
        const {getFieldDecorator} = form;
        return (
            <Form.Item
                key={item.name}
                {...(item.formItemLayout||formItemLayout)}
                label={item.label}
            >
                { getFieldDecorator(item.name,{...getDecoratorProps(item,form)})(getComponent(item,form))}
            </Form.Item>
        );
    }
    render() {
        const {btnsCfg, searchBtnCfg,border} = this.props;
        return (
            <div className={['tbar-box',border?'': 'no-border'].join(" ")}>
                <div className={'tbar-btn-box'}>
                    {
                        this.getBtnItems()
                    }
                </div>
                <div className={'tbar-search-box'}>
                    {
                        searchBtnCfg ? this.getSearchItems(searchBtnCfg) : ""
                    }
                </div>
                {
                    searchBtnCfg && searchBtnCfg.advanceSearchCfg ? (
                        <AdvanceSearchModal
                            visible={this.state.visible}
                            setVisible={this.setVisible}
                            {...searchBtnCfg.advanceSearchCfg}
                        />
                    ) : null
                }

            </div>
        );
    }
}
export default Form.create()(ToolBar);
