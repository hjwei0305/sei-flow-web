/**
 * Created by liusonglin on 2018/7/12.
 */

import React, { Component } from 'react';
import { TreeSelect } from 'antd';

const TreeNode = TreeSelect.TreeNode;
const SHOW_PARENT = TreeSelect.SHOW_PARENT;

export default class TreeSelectWithService extends Component{
    constructor(props){
        super(props)
        this.state={
            value:undefined,
            dataSource:[],
        }
    }

    componentDidMount(){
        this.getDataSource()
    }

    getDataSource(){
        this.props.config.service().then((res)=>{
            let dataSource=[];
            if (res.data&&res.data.length>0){
                dataSource=res.data;
            }else {
                dataSource=res;
            }
            if(this.props.initValue&&dataSource&&dataSource>0){
                const {key} = this.props.config
                this.setState({dataSource,value:dataSource[0][key]})
            }else{
                this.setState({dataSource})
            }
                            
        })
    };

    handleChange = (value) => {
        this.setState({value:value})
        if(this.props.onChange){
            this.props.onChange(value,this.getNodesByKeys(this.state.dataSource,value));
        }
    }

    getAllTreeNode(){
        const {key,text} = this.props.config
        return this.getTreeNode(this.state.dataSource,key,text)
    }

    /**
     * 根据key获取节点信息
     * @param treeData
     * @param key
     * @returns {*}
     */
    getNodeByKey = (treeData, key) => {
        for (let item of treeData) {
            if (item.id === key) {
                return item
            } else {
                if (item.children&&item.children.length > 0) {
                    if (this.getNodeByKey(item.children, key)) {
                        return this.getNodeByKey(item.children, key);
                    }
                }
            }
        }
    };
    getNodesByKeys=(treeData, keys)=>{
        let nodes=[];
        if(keys instanceof Array){
            for (let key of keys){
                let node=this.getNodeByKey(treeData,key);
                nodes.push(node)
            }
        }else {
            return this.getNodeByKey(treeData,keys)
        }
        return nodes;
    };
    getTreeNode(treeData,key,text){
        let treeNodeArray =[]
        for(let i=0;i<treeData.length;i++){
            let treeNode = treeData[i]
            if(treeNode.children && treeNode.children.length>0){
                treeNodeArray.push(<TreeNode value={treeNode[key]} onclick={(e)=>{console.log(e)}} disableCheckbox={this.props.config.onlyLeaf} selectable={!this.props.config.onlyLeaf} onClick={(e)=>{console.log(e)}} title={treeNode[text]} key={treeNode.id}>
                    {this.getTreeNode(treeNode.children,key,text)}</TreeNode>)
            }else {
                treeNodeArray.push(<TreeNode value={treeNode[key]} isLeaf title={treeNode[text]} key={treeNode.id} />)
            }
        }
        return treeNodeArray;
    }

    componentDidUpdate(){
        const defaultValue=this.props.value
        if(this.state.value === defaultValue){
            return;
        }
        if(this.props.initValue && !defaultValue){
            const {key} = this.props.config
            if(this.state.dataSource && this.state.dataSource.length>0){
                this.setState({value:this.state.dataSource[0][key]})
                if (this.props.onChange){
                    this.props.onChange(this.state.dataSource[0][key]);
                }
            }
        }else{
            this.setState({value:defaultValue})
        }
    }
    //展开时是否重新加载数据
    onDropdownVisibleChange=(open)=>{
        if (open&&this.props.loadByOpen){
            this.getDataSource()
        }
    };
    render() {
        return (
            <TreeSelect
                onDropdownVisibleChange={this.onDropdownVisibleChange}
                disabled={this.props.disabled}
                showSearch
                style={{ width: this.props.width?this.props.width:'100%' }}
                value={this.state.value}
                dropdownStyle={{ maxHeight: 260, overflow: 'auto' }}
                placeholder="请选择"
                allowClear={true}
                treeCheckable={this.props.treeCheckable}
                showCheckedStrategy={SHOW_PARENT}
                treeNodeFilterProp={'title'}
                onChange={this.handleChange}
            >
                {this.getAllTreeNode()}
            </TreeSelect>
        );
    }
}

