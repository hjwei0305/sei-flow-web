/**
 * @description 树控件
 * @author 李艳
 */
import {Component} from "react";
import React from "react";
import {Modal, Row, Tree, Card} from "antd";
import {Input} from "antd/lib/index";
import {hide, show} from "../../configs/SharedReducer";
import connect from "react-redux/es/connect/connect";

const DirectoryTree = Tree.DirectoryTree;
const TreeNode = Tree.TreeNode;
const Search = Input.Search;
const confirm = Modal.confirm;

class StandardTree extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dadaSource: [],
            searchValue: "",
            findResultData: [],
            autoExpandParent: true,
            expandedKeys: [],
            selectedKeys: [],
            selectedNodes: {},
            loading: false,
            yHeight: null,
        }
    }

    updateSize=()=> {
        if (this.simpleDiv) {
            let yHeight = document.body.clientHeight - this.getElementTop(this.simpleDiv) - 5;
            let scrollY = (this.props.heightY ? (this.props.heightY + 12) : (yHeight - 83));
            this.setState({scrollY})
        }
    }

    getElementTop=(element)=> {
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
    };
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateSize);
    }

    componentDidMount() {
        this.updateSize();
        window.addEventListener('resize', this.updateSize);
    }
    componentWillReceiveProps(nextProp) {
        const {dadaSource} = nextProp;
        if (this.state.dada !== dadaSource) {
            this.setState({dadaSource})
        }
    }

    //树节点选择触发
    onSelect = (selectedKeys) => {
        this.setState({selectedKeys});
        let selectedNodes = getNodesByKeys(this.state.dadaSource, selectedKeys);
        if (this.props.onSelect) {
            this.props.onSelect(selectedKeys, selectedNodes)
        }
    };
    onCheck = (selectedKeys) => {
        let selectedNodes = getNodesByKeys(this.state.dadaSource, selectedKeys);
        if (this.props.onCheck) {
            this.props.onCheck(selectedKeys, selectedNodes)
        }
    };

    //查找树节点
    handleSearch = (value) => {
        let dadaSource = JSON.parse(JSON.stringify(this.state.dadaSource));
        let findResultData = this.findNode(value, dadaSource);
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

    render() {
        return (
                <div>
                        <div className={'tbar-box'}>
                            <div className={'tbar-btn-box'}>&nbsp;{this.props.leftExtra?this.props.leftExtra:""}</div>
                            <div className={'tbar-search-box'} >
                                <Search
                                    key="search"
                                    placeholder="输入关键字查询"
                                    onSearch={e => this.handleSearch(e)}
                                    style={{width: '220px'}}
                                    enterButton
                                />
                            </div>
                        </div>

                        <div  ref={(div) => this.simpleDiv = div}>
                            {this.state.dadaSource.length > 0 ? (
                            <Card style={{height: this.state.scrollY + 82, overflow: "auto"}}>
                                <DirectoryTree
                                    expandAction={"doubleClick"}
                                    onSelect={this.onSelect}
                                    autoExpandParent={this.state.autoExpandParent}
                                    expandedKeys={this.state.expandedKeys}
                                    onExpand={this.onExpand}
                                    onDragEnter={this.onDragEnter}
                                    checkable={this.props.checkable}
                                    onCheck={this.onCheck}
                                    draggable>
                                    {this.renderTreeNodes(this.state.searchValue === "" ? this.state.dadaSource : this.state.findResultData)}
                                </DirectoryTree>
                            </Card>
                            ) : null}
                        </div>
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
)(StandardTree)
export function getNodeByKey(dadaSource, key) {
    for (let item of dadaSource) {
        if (item.id === key) {
            return item
        } else {
            if (item.children && item.children.length > 0) {
                if (getNodeByKey(item.children, key)) {
                    return getNodeByKey(item.children, key);
                }
            }
        }
    }
}
export function getNodesByKeys (dadaSource, keys) {
    let nodes = [];
    if (keys instanceof Array) {
        for (let key of keys) {
            let node = getNodeByKey(dadaSource, key);
            nodes.push(node)
        }
    } else {
        return getNodeByKey(dadaSource, keys)
    }
    return nodes;
}
