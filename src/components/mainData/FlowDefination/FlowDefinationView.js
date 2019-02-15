/**
 * @description 岗位管理
 * @author 李艳
 */
import {Component} from "react";
import React from "react";
import {Button, Col, Modal, message, Row, Tree, Form, Card} from "antd";
import {Input} from "antd/lib/index";
import {searchListByKeyWithTag} from "../../../commons/utils/CommonUtils";
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import connect from "react-redux/es/connect/connect";
import {listAllOrgs, listFlowDefination} from "./FlowDefinationService";
import ToolBar from "../../../commons/components/toolbar/ToolBar";

const DirectoryTree = Tree.DirectoryTree;
const TreeNode = Tree.TreeNode;
const Search = Input.Search;
const confirm = Modal.confirm;
const columns = [
    {
        title: '代码',
        dataIndex: 'code',
        width: 120
    },
    {
        title: '名称',
        dataIndex: 'name',
        width: 160
    },
    {
        title: '岗位类别',
        dataIndex: 'positionCategory.name',
        width: 180
    }
];

class FlowDefinationView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            treeData: [],
            searchValue: "",
            tableSearchValue: "",
            tableData: [],
            findResultData: [],
            autoExpandParent: true,
            expandedKeys: [],
            treeSelectedKeys: [],
            selectedNode: {},
            loading: false,
            tableSelectRow: [],
            modalVisible: false,
            confirmLoading: false,
            isAdd: true,
            pathName: "流程定义管理",
            scrollY: null,
            includeSubNode: false,
            isPositionConfig: false
        }
    }

    onModalRef = (ref) => {
        this.modalRef = ref;
    };

    updateSize() {
        if (this.simpleDiv) {
            let yHeight = document.body.clientHeight - this.getElementTop(this.simpleDiv) - 5;
            let scrollY = (this.props.heightY ? (this.props.heightY + 12) : (yHeight - 83));
            this.setState({scrollY})
        }
    }

    getElementTop(element) {
        if (element) {
            let actualTop = element.offsetTop;
            let current = element.offsetParent;

            while (current !== null) {
                actualTop += current.offsetTop;
                current = current.offsetParent;
            }
            return actualTop;
        }
        return 0;
    }

    componentWillMount() {
        this.getTreeData()
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateSize.bind(this));
    }

    componentDidMount() {
        this.updateSize();
        window.addEventListener('resize', this.updateSize.bind(this));
    }

    //网络请求树控件数据
    getTreeData = (param) => {
        this.props.show();
        listAllOrgs(param).then((result) => {
            this.setState({
                treeData: result,
            });
        }).catch(err => {
        }).finally(() => {
            this.props.hide();
        });
    };

    //网络请求table控件数据
    listAllCanAssignEmployeesIncludeSubNode = (param) => {
        this.setState({loading: true});
        listFlowDefination(param).then((result) => {
            this.setState({
                tableData: result.rows, tableSelectRow: [], tableSearchValue: ""
            });
        }).catch(err => {
        }).finally(() => {
            this.setState({loading: false});
        });
    };

    //树节点选择触发
    onTreeSelect = (selectedKeys, info) => {
        this.setState({treeSelectedKeys: selectedKeys});
        let data = {};
        data = this.getNodeByKey(this.state.treeData, selectedKeys[0]);
        this.setState({selectedNode: data});

        let params = {parentId: info.node.props.eventKey, includeSubNode: this.state.includeSubNode};
        this.listAllCanAssignEmployeesIncludeSubNode(params);
        this.setState({pathName: data.name ? data.name : '岗位'});


    };

    //查找树节点
    handleSearch = (value) => {
        let treeData = JSON.parse(JSON.stringify(this.state.treeData));
        let findResultData = this.findNode(value, treeData);
        this.keyList = [];
        this.getExpandedKeys(findResultData);
        let expandedKeys = this.keyList;
        if (value === "") {//没有搜索关键字
            this.setState({
                findResultData: findResultData,
                searchValue: value,
                autoExpandParent: false,
                expandedKeys: []
            })
        } else {
            this.setState({
                findResultData: findResultData,
                searchValue: value,
                autoExpandParent: true,
                expandedKeys: expandedKeys
            })
        }
    };

    getExpandedKeys = (data) => {
        for (let item of data) {
            this.keyList.push(item.id);
            if (item.children && item.children.length > 0) {
                this.getExpandedKeys(item.children)
            }
        }
    };

    //树控件展开时
    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    };

    //查找关键字节点
    findNode = (value, tree) => {
        return tree.map(treeNode => {
            //如果有子节点
            if (treeNode.children && treeNode.children.length > 0) {
                treeNode.children = this.findNode(value, treeNode.children);
                //如果标题匹配
                if (treeNode.name.indexOf(value) > -1) {
                    return treeNode
                } else {//如果标题不匹配，则查看子节点是否有匹配标题
                    treeNode.children = this.findNode(value, treeNode.children);
                    if (treeNode.children && treeNode.children.length > 0) {
                        return treeNode
                    }
                }
            } else {//没子节点
                if (treeNode.name.indexOf(value) > -1) {
                    return treeNode
                }
            }
        }).filter((treeNode, i, self) => treeNode)
    };

    renderTreeNodes = (data) => {
        return data.map((item) => {
            const i = item.name.indexOf(this.state.searchValue);
            const beforeStr = item.name.substr(0, i);
            const afterStr = item.name.substr(i + this.state.searchValue.length);
            const name = i > -1 ? (
                <span>
                    {beforeStr}
                    <span style={{color: '#f50'}}>{this.state.searchValue}</span>
                    {afterStr}
                </span>
            ) : <span>{item.name}</span>;
            if (item.children && item.children.length > 0) {
                return (
                    <TreeNode title={name} key={item.id}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode title={name} key={item.id} isLeaf/>;
        });
    };
    onDragEnter = (info) => {
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

    };
    onDeleteClick = () => {
        if (!this.judgeSelected()) return;

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

    groupSearchBtnCfg = () => {
        return {
            quickSearchCfg: {
                style: {width: 250},
                placeholder: "输入代码或名称查询",
                onSearch: (v) => {
                    //this.handleQuickSearchGroup(v)
                }
            }
        }
    }
    groupBtnsCfg = () => {
        return [
            {
                title: "新增",
                checkRight: true,
                propsCfg: {
                    type: "primary",
                    onClick: () => {
                        //this.handleAddGroup()
                    }
                }
            }
        ]
    }
    render() {
        const title = () => {
            return [
                <Button key="addRule" style={{marginRight: '5px'}} type={"primary"}
                        onClick={this.onAddClick}>新增</Button>,
                <Button key="edit" style={{marginRight: '5px'}}
                        onClick={this.onRefAddClick}>参考创建</Button>,
                <Button key="edit" style={{marginRight: '5px'}}
                        onClick={this.onEditClick}>编辑</Button>,
                <Button key="config" style={{marginRight: '5px'}}
                        onClick={this.onResetClick}>位置重置</Button>,
                <Button key="config" style={{marginRight: '5px'}}
                        onClick={this.onDeleteClick}>删除</Button>,
            ]
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
            <div>
                {/*左边的树状控件*/}
                <Col span={10}>
                    <div style={{margin: '10px 14px 10px'}}>
                        <div className={"header-span"}>组织机构</div>
                    </div>

                    <Row  type="flex" justify="space-between" style={{background: '#f3f8fc', padding: 10, marginBottom: 5}}>
                        <div ref={(div) => this.simpleDiv = div} style={{textAlign: 'right'}}>
                            <Search
                                key="search"
                                placeholder="输入分类名称查询"
                                onSearch={e => this.handleSearch(e)}
                                style={{width: '220px'}}
                                enterButton
                            />
                        </div>
                    </Row>

                    {this.state.treeData.length > 0 ? (
                        <Card style={{height: this.state.scrollY + 50, overflow: "auto"}}>
                            <DirectoryTree
                                expandAction={"doubleClick"}
                                onSelect={this.onTreeSelect}
                                autoExpandParent={this.state.autoExpandParent}
                                expandedKeys={this.state.expandedKeys}
                                onExpand={this.onExpand}
                                onDragEnter={this.onDragEnter}
                                draggable>
                                {this.renderTreeNodes(this.state.searchValue === "" ? this.state.treeData : this.state.findResultData)}
                            </DirectoryTree>
                        </Card>

                    ) : null}

                </Col>
                {/*右边的表格控件*/}
                <Col span={14}>
                    <div style={{marginLeft: "5px"}}>
                        <div style={{margin: '10px 14px 10px'}}>
                            <div className={"header-span"}>{this.state.pathName}</div>
                        </div>
                        <Row style={{background: '#f3f8fc', padding: 10, marginBottom: 5}}>
                            <Col span={14}>{title()}</Col>
                            <Col span={10}  style={{textAlign: 'right'}}>{search()}</Col>
                        </Row>
                        <ToolBar
                            btnsCfg={this.groupBtnsCfg()}
                            searchBtnCfg={this.groupSearchBtnCfg()}
                        />
                        <SimpleTable
                            data={this.state.tableSearchValue ? this.state.tableData.filter(item => item.tag === true) : this.state.tableData}
                            columns={columns}
                            loading={this.state.loading}
                            onSelectRow={this.onTableSelectRow}
                            rowsSelected={this.state.tableSelectRow}
                        />
                    </div>
                </Col>
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
FlowDefinationView = Form.create()(FlowDefinationView);
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FlowDefinationView)
