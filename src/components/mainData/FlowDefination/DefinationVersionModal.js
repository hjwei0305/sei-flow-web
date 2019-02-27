/**
 * @description 配置服务地址
 * @author 李艳
 */

import React, {Component} from 'react'
import connect from "react-redux/es/connect/connect";
import {Button, Col, Row, message,Modal} from 'antd';
import {show, hide} from '../../../configs/SharedReducer'
import SimpleTable from "../../../commons/components/SimpleTable";
import {Input} from "antd/lib/index";
import {listFlowDefinationHistory} from "./FlowDefinationService";

const Search = Input.Search;
const confirm=Modal.confirm;
class DefinationVersionModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            modalVisible: false,
            confirmLoading: false,
            selectedRows: [],
            isAdd: false,
            searchValue:"",
            loading:false
        };
    }

    componentWillMount() {
        this.getDataSource();
    }

    getDataSource = (params={}) => {
        let {flowDefinationId}=this.props;
        Object.assign(params,{filters:[{
                fieldName:"flowDefination.id",//筛选字段
                operator:"EQ",//操作类型
                value:`${flowDefinationId}`,//筛选值
                fieldType:"String"//筛选类型
            }]});
        this.setState({loading:true});
        listFlowDefinationHistory(params).then(data => {
            this.setState({data, selectedRows: []})
        }).catch(e => {
        }).finally(() => {
            this.setState({loading:false});
        })
    };

    handleRowSelectChange = (selectedRows) => {
        this.setState({selectedRows})
    };

    refClick = () => {
        if (!this.judgeSelected()) return;
    };
    checkClick = () => {
        if (!this.judgeSelected()) return;
    };
    editClick = () => {
        if (!this.judgeSelected()) return;
    };
    judgeSelected = () => {
        if (this.state.selectedRows.length === 0) {
            message.error("请选择一行数据！");
            return false
        }
        return true
    };

    handleSearch = (value) => {
        this.setState({searchValue:value});
        this.getDataSource({quickSearchValue:value});
    };
    pageChange = (pageInfo) => {
        this.setState({
            pageInfo:pageInfo,
        });
        this.getDataSource({quickSearchValue:this.state.searchValue,pageInfo})
    };
    render() {
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
                title: '版本号',
                dataIndex: 'version',
                width: 120
            },
            {
                title: '优先级',
                dataIndex: 'priority',
                width: 120
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
                title: '描述',
                dataIndex: 'depict',
                width: 120
            },
        ];
        const title = () => {
            return [
                <Button key="add" style={{marginRight: '8px'}}
                        onClick={this.editClick}>编辑</Button>,
                <Button key="refAdd" style={{marginRight: '8px'}}
                        onClick={this.refClick}>参考创建</Button>,
                <Button key="check" style={{marginRight: '8px'}}
                        onClick={this.checkClick}>查看流程定义</Button>
            ]
        };

        //表头搜索框
        const search = () => {
            return [
                <Search
                    key="search"
                    placeholder="输入代码或名称查询"
                    onSearch={value => this.handleSearch(value)}
                    style={{ width: 230}}
                    enterButton
                />
            ]
        };
        const {modalVisible,handleCancel} = this.props;
        return (
            <Modal title={<span className={'header-span'}>{"流程定义版本管理"}</span>}
                   visible={modalVisible}
                   width={700}
                   maskClosable={false}
                   onCancel={handleCancel}
                   bodyStyle={{minHeight:500}}
                   footer={false}
            >
                <div  className={'tbar-box'}>
                    <div  className={'tbar-btn-box'}>{title()}</div>
                    <div  className={'tbar-search-box'}>{search()}</div>
                </div>
                    <SimpleTable
                        rowsSelected={this.state.selectedRows}
                        onSelectRow={this.handleRowSelectChange}
                        data={this.state.data}
                        columns={columns}
                        pageChange={this.pageChange}
                        loading={this.state.loading}
                    />
            </Modal>
        );
    }


}

const mapStateToProps = (state) => {
    return {};
}

const mapDispatchToProps = (dispatch) => {
    return {
        show: () => {
            dispatch(show())
        },
        hide: () => {
            dispatch(hide())
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DefinationVersionModal)


