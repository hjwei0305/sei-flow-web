/**
 * @description 流程定义
 * @author 李艳
 */
import {Component} from "react";
import React from "react";
import {Button, Col, Modal, message} from "antd";
import {Input} from "antd/lib/index";
import {searchListByKeyWithTag} from "../../../commons/utils/CommonUtils";
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import connect from "react-redux/es/connect/connect";
import {
    activateOrFreezeFlowDef, deleteFlowDefination, getFlowDefVersion, listAllOrgs,
    listFlowDefination
} from "./FlowDefinationService";
import DefinationVersionModal from "./DefinationVersionModal";
import StandardTree from "../../../commons/components/StandardTree";

const Search = Input.Search;
const confirm = Modal.confirm;
const columns = [
    {
        title: '名称',
        dataIndex: 'name',
        width: 200
    },
    {
        title: '定义KEY',
        dataIndex: 'defKey',
        width: 200
    },
    {
        title: '流程类型',
        dataIndex: 'flowType.name',
        width: 200
    },
    {
        title: '流程定义状态',
        dataIndex: 'flowDefinationStatus',
        width: 120,
        render(text,record){
            if('INIT' === text){
                return '未发布';
            }else if('Activate' === text){
                return '激活';
            }
            else if('Freeze' === text){
                return '冻结';
            }
            return "";
        }
    },
    {
        title: '优先级',
        dataIndex: 'priority',
        width: 120
    }
];

class FlowDefinationView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            treeData: [],
            tableSearchValue: "",
            tableData: [],
            treeSelectedKeys: [],
            selectedNode: {},
            loading: false,
            tableSelectRow: [],
            modalVisible: false,
            confirmLoading: false,
            isAdd: true,
            pathName: "流程定义管理",
        }
    }

    componentWillMount() {
        this.getTreeData()
    };

    //网络请求树控件数据
    getTreeData = (param) => {
        this.props.show();
        listAllOrgs(param).then((result) => {
            if (result.success){

            }this.setState({
                treeData: result.data,
            });
        }).catch(err => {
        }).finally(() => {
            this.props.hide();
        });
    };

    //网络请求table控件数据
    listFlowDefination = (param) => {
        this.setState({loading: true});
        listFlowDefination(param).then((result) => {
            this.setState({
                tableData: result.rows, tableSelectRow: []
            });
        }).catch(err => {
        }).finally(() => {
            this.setState({loading: false});
        });
    };

    //树节点选择触发
    onTreeSelect = (selectedKeys, selectedNodes) => {
        this.setState({treeSelectedKeys: selectedKeys});
        this.setState({selectedNode: selectedNodes[0]?selectedNodes[0]:{}});
        if (selectedNodes[0]){
            let params = {orgId: selectedNodes[0]?selectedNodes[0].id:""};
            this.listFlowDefination(params);
            this.setState({pathName: selectedNodes[0].name ? selectedNodes[0].name : '岗位'});
        }
    };

    handleTableSearch = (value) => {
        searchListByKeyWithTag(this.state.tableData, {keyword: value}, ["code", "name"]).then(res => {
            this.setState({tableData: res, tableSearchValue: value})
        })
    };
    onAddClick = () => {
        if (this.state.selectedNode && JSON.stringify(this.state.selectedNode) !== "{}") {
            this.setState({
                modalVisible: true,
                isAdd: true
            })
        } else {
            message.error('请选择组织机构')
        }

    };
    onRefAddClick = () => {
        if (!this.judgeSelected()) return;

    };
    onEditClick = () => {
        if (!this.judgeSelected()) return;
        this.setState({
            modalVisible: true,
            isAdd: false
        })
    };
    onResetClick = () => {
        if (!this.judgeSelected()) return;
        let thiz = this;
        confirm({
            title:"您确定要重置流程图位置吗？",
            onOk(){
                let id = thiz.state.tableSelectRow[0].id;
                thiz.setState({loading:true});
                getFlowDefVersion(id).then(result => {
                    if (result.success) {
                        message.success(result.message?result.message:"请求成功");
                        //刷新本地数据
                        let params = {orgId: thiz.state.selectedNode.id,quickSearchValue:thiz.state.tableSearchValue,pageInfo:thiz.state.pageInfo};
                        thiz.listFlowDefination(params);
                    } else {
                        message.error(result.message?result.message:"请求失败");
                    }
                }).catch(e => {
                }).finally(() => {
                    thiz.setState({loading:false});
                })
            }
        });
    };
    onActivateOrFreezeFlowDefClick=()=>{
        if (!this.judgeSelected()) return;
        let {tableSelectRow}=this.state;
        let id =tableSelectRow[0].id;
        let status='';
        let title='';
        if (tableSelectRow[0].flowDefinationStatus!=="INIT"){
            if (tableSelectRow[0].flowDefinationStatus==='Activate'){
                status='Freeze';
                title='您确定要冻结吗？'
            }else if (tableSelectRow[0].flowDefinationStatus==='Freeze'){
                status='Activate';
                title='您确定要激活吗？'
            }
        }
        let thiz = this;
        confirm({
            title:title,
            onOk(){
                thiz.setState({loading:true});
                activateOrFreezeFlowDef(id,status).then(result => {
                    if (result.status==='SUCCESS') {
                        message.success(result.message?result.message:"请求成功");
                        //刷新本地数据
                        let params = {orgId: thiz.state.selectedNode.id,quickSearchValue:thiz.state.tableSearchValue,pageInfo:thiz.state.pageInfo};
                        thiz.listFlowDefination(params);
                    } else {
                        message.error(result.message?result.message:"请求失败");
                    }
                }).catch(e => {
                }).finally(() => {
                    thiz.setState({loading:false});
                })
            }
        });



    };
    onVersionClick = () => {
        if (!this.judgeSelected()) return;
        this.handleModalVisible(false,true)
    };

    onDeleteClick = () => {
        if (!this.judgeSelected()) return;
        let thiz = this;
        confirm({
            title:"数据将丢失，确定要删除吗？",
            onOk(){
                let id = thiz.state.tableSelectRow[0].id;
                thiz.setState({loading:true});
                deleteFlowDefination(id).then(result => {
                    if (result.status==='SUCCESS') {
                        message.success("请求成功");
                        //刷新本地数据
                        let params = {orgId: thiz.state.selectedNode.id,quickSearchValue:thiz.state.tableSearchValue,pageInfo:thiz.state.pageInfo};
                        thiz.listFlowDefination(params);
                    } else {
                        message.error(result.message?result.message:"请求失败");
                    }
                }).catch(e => {
                }).finally(() => {
                    thiz.setState({loading:false});
                })
            }
        });
    };
    onTableSelectRow = (tableSelectRow) => {
        this.setState({tableSelectRow});
    };
    judgeSelected = () => {
        if (!this.state.tableSelectRow[0]) {
            message.error('请选择一行数据！');
            return false;
        }
        return true;
    };
    handleModalVisible = (modalVisible=false,defVersionVisible=false) => {
        this.setState({modalVisible,defVersionVisible})
    };
    handleModalCancel = () => {
        this.handleModalVisible()
    };
    getNodeByKey = (treeData, key) => {
        for (let item of treeData) {
            if (item.id === key) {
                return item
            } else {
                if (item.children && item.children.length > 0) {
                    if (this.getNodeByKey(item.children, key)) {
                        return this.getNodeByKey(item.children, key);
                    }
                }
            }
        }
    };
    
    render() {
        const {tableSelectRow}=this.state;
        const title = () => {
            let res=[];
            res.push(<Button key="addRule" style={{marginRight: '5px'}} type={"primary"}
                             onClick={this.onAddClick}>新增</Button>);
            res.push(<Button key="refEdit" style={{marginRight: '5px'}}
                             onClick={this.onRefAddClick}>参考创建</Button>);
            res.push(<Button key="edit" style={{marginRight: '5px'}}
                             onClick={this.onEditClick}>编辑</Button>);
            res.push(<Button key="reset" style={{marginRight: '5px'}}
                             onClick={this.onResetClick}>位置重置</Button>);
            res.push(<Button key="version" style={{marginRight: '5px'}}
                             onClick={this.onVersionClick}>流程定义版本管理</Button>);
            let statusText='';
            if (tableSelectRow[0]&&tableSelectRow[0].flowDefinationStatus!=="INIT"){
                if (tableSelectRow[0].flowDefinationStatus==='Activate'){
                    statusText='冻结'
                }else if (tableSelectRow[0].flowDefinationStatus==='Freeze'){
                    statusText='激活'
                }
                res.push(<Button key="status" style={{marginRight: '5px'}}
                                 onClick={this.onActivateOrFreezeFlowDefClick}>{statusText}</Button>);
            }
            res.push(<Button key="config" style={{marginRight: '5px'}}
                             onClick={this.onDeleteClick}>删除</Button>);
            return res
        };

        //表头搜索框
        const search = () => {
            return[
            <Search
                key="search"
                placeholder="输入代码或名称查询"
                onSearch={value => this.handleTableSearch(value)}
                style={{width: '220px'}}
                enterButton
            />
            ]
        };
        return (
            <div  className={"table-box"}>
                {/*左边的树状控件*/}
                <Col span={8}>
                    <div style={{margin: '10px 14px 10px'}}>
                        <div className={"header-span"}>组织机构</div>
                    </div>
                    <StandardTree
                        onSelect={this.onTreeSelect}
                        dadaSource={this.state.treeData}/>
                </Col>
                {/*右边的表格控件*/}
                <Col span={16}>
                    <div style={{marginLeft: "5px"}}>
                        <div style={{margin: '10px 14px 10px'}}>
                            <div className={"header-span"}>{this.state.pathName}</div>
                        </div>
                        <div  className={'tbar-box'}>
                            <div  className={'tbar-btn-box'}>{title()}</div>
                            <div  className={'tbar-search-box'}>{search()}</div>
                        </div>
                        <SimpleTable
                            data={this.state.tableSearchValue ? this.state.tableData.filter(item => item.tag === true) : this.state.tableData}
                            columns={columns}
                            loading={this.state.loading}
                            onSelectRow={this.onTableSelectRow}
                            rowsSelected={this.state.tableSelectRow}
                        />
                    </div>
                </Col>
                {this.state.defVersionVisible&&<DefinationVersionModal
                    handleCancel={this.handleModalCancel }
                    modalVisible={this.state.defVersionVisible}
                    flowDefinationId={this.state.tableSelectRow[0]?this.state.tableSelectRow[0].id:""}/>}
            </div>


        )
    }
}

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        show: () => {
            dispatch(show())
        },
        hide: () => {
            dispatch(hide())
        },
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FlowDefinationView)
