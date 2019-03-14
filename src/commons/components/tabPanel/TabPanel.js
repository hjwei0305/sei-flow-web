/**
 * @Description: 内嵌iframe
 * @Author: CHEHSHUANG
 * @Date: 2019/2/20
 */
import React, {Component} from 'react';
import {Dropdown, Menu, Tabs} from "antd";
import {getUserInfo, isLocalhost} from "../../utils/CommonUtils";

const TabPane = Tabs.TabPane;

class TabPanel extends Component {
    constructor(props) {
        super(props);
        this.newTabIndex = 0;
        this.state = {
            activeKey: this.props.defaultActiveKey || "",
            panes: this.props.defaultTabItems||[],
            loadings: false
        };
    }

    componentDidMount() {
        this.props.onRef && this.props.onRef(this);
        window.homeView = this;
    }

    componentDidUpdate(prevProps,prevState){
        if(this.state.activeKey==="homeView"&&prevState.activeKey!==this.state.activeKey){
            this.refreshTab("homeView")
        }
    }
    handleChange = (activeKey) => {
        this.setState({activeKey});
    }

    handleEdit = (targetKey, action) => {
        this[action](targetKey);
    }

    add = (tab) => {
        if (tab) {
            if(!tab.id){
                tab.id = "tab_"+this.newTabIndex++;
            }
            const activeKey = tab.id;
            const panes = this.state.panes;
            const isExist = panes.findIndex(item => item.id === tab.id);
            if(isExist === -1){
                this.setState({loadings: true});
                //不存在则新开页签
                let url = this.addTokenToUrl(tab.url);
                //todo 测试代码
              url = url.replace("dsei.changhong.com","localhost:3000")
                const closable = tab.closable !== false;
                panes.push({title: tab.title, url, id: activeKey, closable, featureCode: tab.featureCode});
                this.setState({panes, activeKey});
            }else{
                //激活
                this.setState({activeKey});
            }
        }
    }
    addTokenToUrl = (url) =>{
        let userInfo = getUserInfo()||{};
        const {sessionId="", userId="", account=""} = userInfo;
        if (url.indexOf("?") !== -1) {
            return url + "&_s=" + sessionId + '&userId='+userId + '&account='+account;
        } else {
            return url + "?_s=" + sessionId + '&userId='+userId + '&account='+account;
        }
    }
    remove = (targetKey) => {
        let activeKey = this.state.activeKey;
        let lastIndex;
        this.state.panes.forEach((pane, i) => {
            if (pane.id === targetKey) {
                lastIndex = i - 1;
            }
        });
        const panes = this.state.panes.filter(pane => pane.id !== targetKey);
        if (panes.length && activeKey === targetKey) {
            if (lastIndex >= 0) {
                activeKey = panes[lastIndex].id;
            } else {
                activeKey = panes[0].id;
            }
        }
        this.setState({panes, activeKey});
    }

    //附加操作
    operations = (pane) => {
        return <Dropdown overlay={this.operateMenu(pane)} trigger={['contextMenu']}>
                  <span>{pane?pane.title:""}</span>
               </Dropdown>
    }
    refreshTab = (id) => {
        this.setState({loadings: true});
        const childFrameObj = document.getElementById(id);
        const url = childFrameObj.src;
        childFrameObj.src = url;
    }

    closeTab = (type,pane) => {
        const {panes} = this.state;
        switch (type) {
            case "current":
                if(pane && pane.closable !== false){
                    this.remove(pane.id);
                }
                break;
            case "other":
                if(panes&&panes.length>0){
                    let otherPanes = panes.filter(item => pane && item.id !== pane.id);
                    otherPanes.forEach(item => {
                        if(item && item.closable !== false){
                            this.remove(item.id);
                        }
                    })
                }
                break;
            case "all":
                if(panes&&panes.length>0){
                    panes.forEach(item => {
                        if(item && item.closable !== false){
                            this.remove(item.id);
                        }
                    })
                }
                break;
            default: break;
        }
    }
    operateMenu = (pane) => {
        let menus = [
            <Menu.Item key="0" onClick={()=>this.refreshTab(pane.id)}>
                <span>刷新</span>
            </Menu.Item>,
            <Menu.Divider key="split"/>
        ];
        if(pane && pane.closable){
            menus.push(
                <Menu.Item key="1" onClick={()=>this.closeTab("current",pane)}>
                    <a href="#">关闭</a>
                </Menu.Item>
            );
        }
        return (
            <Menu>
                {menus}
                <Menu.Item key="2" onClick={()=>this.closeTab("other",pane)}>关闭其他</Menu.Item>
                <Menu.Item key="3" onClick={()=>this.closeTab("all")}>关闭所有</Menu.Item>
            </Menu>
        );
    }

    handleIframeLoad = (id) => {
        this.setState({loadings: false});
    }

    render() {
        const {panes} = this.state;
        return (
            <Tabs
                className={"custom-tabs"}
                hideAdd
                type="editable-card"
                activeKey={this.state.activeKey}
                onChange={this.handleChange}
                onEdit={this.handleEdit}
                // onTabClick={this.handleTabClick}
            >
                {
                    panes && panes.map(pane =>(
                        <TabPane tab={this.operations(pane)} key={pane.id} className={"main-tabpanel"} closable={pane.closable}>
                                {pane.url ? <iframe frameBorder={0} id={pane.id} className={"iframe-box"} src={`${pane.url}&featureId=${pane.id}&featureCode=${pane.featureCode}`} onLoad = {()=>this.handleIframeLoad(pane.id)}/> : null}
                        </TabPane>
                    ))
                }
            </Tabs>
        );
    }
}

export default TabPanel
