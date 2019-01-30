/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2018/9/27
 */

import React, {Component} from "react"
import {Button, Input} from "antd";
import UploadFile from "../UploadFile";
import AdvanceSearchModal from "./AdvanceSearchModal";
import "./index.css"

class ToolBar extends Component {
    state = {
        visible: false
    }
    getSearchItems = (searchBtnCfg) => {
        const {quickSearchCfg, advanceSearchCfg} = searchBtnCfg;
        let items = [];

        if (quickSearchCfg) {
            quickSearchCfg.className = quickSearchCfg.className ? 'tbar-search' + " " + quickSearchCfg.className : 'tbar-search';
            if(typeof quickSearchCfg.enterButton === "undefined"){
                quickSearchCfg.enterButton = true;
            }
            items.push(<Input.Search key={'0'}  {...quickSearchCfg}/>);
        }
        if (advanceSearchCfg) {
            advanceSearchCfg.style = {marginLeft: '6px', ...advanceSearchCfg.style};
            items.push(<Button key={'1'} style={{...advanceSearchCfg.style}} onClick={() => {
                this.setVisible(true)
            }}>{advanceSearchCfg.title}</Button>);
        }
        return items;
    }
    setVisible = (visible) => {
        this.setState({visible: visible})
    }

    render() {
        const {btnsCfg, searchBtnCfg} = this.props;
        return (
            <div className={'tbar-box'}>
                <div className={'tbar-btn-box'}>
                    {
                        btnsCfg ? btnsCfg.map(
                            (item, i) => {
                                if (item.checkRight) {
                                    item.propsCfg = item.propsCfg || {};
                                    item.propsCfg.className = item.propsCfg.className ? "tbar-btn" + " " + item.propsCfg.className : "tbar-btn";
                                    if (item.type === "uploadFile") {
                                        return (<UploadFile key={i} title={item.title} {...item.propsCfg}/>)
                                    } else {
                                        return (<Button key={i} {...item.propsCfg}>{item.title}</Button>)
                                    }
                                } else {
                                    return null;
                                }
                            }
                        ) : null
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
                            handleSearch={searchBtnCfg.advanceSearchCfg.handleSearch}
                            //  afterClose={searchBtnCfg.advanceSearchCfg.afterClose}
                            rowColNum={searchBtnCfg.advanceSearchCfg.rowColNum}
                            modalTitle={searchBtnCfg.advanceSearchCfg.modalTitle}
                            modalWidth={searchBtnCfg.advanceSearchCfg.modalWidth}
                            formConfig={searchBtnCfg.advanceSearchCfg.formConfig}
                        />
                    ) : null
                }

            </div>
        );
    }
}

export default ToolBar;
