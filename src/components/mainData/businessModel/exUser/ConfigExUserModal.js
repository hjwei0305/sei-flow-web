/**
 * @description 配置自定义执行人
 * @author 李艳
 */

import React, {Component} from 'react'
import {Button, Col, Row, message,Modal} from 'antd';
import {
    deleteExUser,
    listExUser, saveExUser
} from "../BusinessModelService";
import SimpleTable from "../../../../commons/components/SimpleTable";
import {Input} from "antd/lib/index";
import ExUserModal from "./ExUserModal";


const Search = Input.Search;
const confirm=Modal.confirm;
class ConfigExUserModal extends Component {
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
        this.getDataSource()
    }

    onRef = (ref) => {
        this.ref = ref
    };
    getDataSource = (params={}) => {
        let {businessModelId}=this.props;
        Object.assign(params,{filters:[{
                fieldName:"businessModel.id",//筛选字段
                operator:"EQ",//操作类型
                value:`${businessModelId}`,//筛选值
                fieldType:"String"//筛选类型
            }]});
        this.setState({loading:true});
        listExUser(params).then(data => {
            this.setState({data, selectedRows: []})
        }).catch(e => {
        }).finally(() => {
            this.setState({loading:false});
        })
    };

    handleRowSelectChange = (selectedRows) => {
        this.setState({selectedRows})
    };
    handleModalVisible = (modalVisible, isAdd) => {
        this.setState({modalVisible, isAdd})
    };
    addClick = () => {
        this.handleModalVisible(true, true)
    };
    editClick = () => {
        if (!this.judgeSelected()) return;
        this.handleModalVisible(true, false)
    };
    handleSave = () => {
        this.ref.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let params = {}
                Object.assign(params, values);
                if (this.state.isAdd)
                    delete params.id;//新增时id==="",保存可能会出错，需删除id
                this.setState({confirmLoading: true});
                params.businessModel={};
                params.businessModel.id=this.props.businessModelId;
                saveExUser(params).then(result => {
                    if (result.status==="SUCCESS") {
                        message.success(result.message?result.message:"请求成功");
                        //刷新本地数据
                        this.getDataSource({quickSearchValue:this.state.searchValue});
                    } else {
                        message.error(result.message?result.message:"请求失败");
                    }
                }).catch(e => {
                }).finally(() => {
                    this.setState({confirmLoading: false, modalVisible: false});
                })
            }
        })
    };
    judgeSelected = () => {
        if (this.state.selectedRows.length === 0) {
            message.error("请选择一行数据！");
            return false
        }
        return true
    };

    handleModalCancel = () => {
        this.handleModalVisible(false)
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

    deleteClick = () => {
        if (!this.judgeSelected()) return;
        let thiz = this;
        confirm({
            title:"确定要删除吗？",
            onOk(){
                let params = {};
                params = thiz.state.selectedRows[0].id;
                this.setState({loading:true});
                deleteExUser(params).then(result => {
                    if (result.status==="SUCCESS") {
                        message.success(result.message?result.message:"请求成功");
                        //刷新本地数据
                        thiz.getDataSource({quickSearchValue:thiz.state.searchValue,pageInfo:thiz.state.pageInfo})
                    } else {
                        message.error(result.message?result.message:"请求失败");
                    }
                }).catch(e => {
                }).finally(() => {
                    this.setState({loading:false});
                })
            }
        });
    };

    render() {
        const columns = [
            {
                title: '代码',
                dataIndex: 'code',
                width:140
            },
            {
                title: '名称',
                dataIndex: 'name',
                width:140
            },
            {
                title: 'API地址',
                dataIndex: 'url',
                width:200
            },
            {
                title: '参数',
                dataIndex: 'param',
                width:200
            },
            {
                title: '描述',
                dataIndex: 'depict',
                width:200
            }
        ];
        const title = () => {
            return [

                <Button type={"primary"} key="edit" style={{marginRight: '8px'}}
                        onClick={this.addClick}>新增</Button>,

                <Button key="check" style={{marginRight: '8px'}}
                        onClick={this.editClick}>编辑</Button>,
                <Button key="delete" style={{marginRight: '8px'}}
                        onClick={this.deleteClick}>删除</Button>,
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
            <Modal title={<span className={'header-span'}>{"自定义执行人配置"}</span>}
                   visible={modalVisible}
                   width={700}
                   maskClosable={false}
                   onCancel={handleCancel}
                   bodyStyle={{minHeight:500}}
                   footer={false}
            >
                <div style={{width: this.props.width ? this.props.width : '100%'}}>
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
                    <ExUserModal
                        isAdd={this.state.isAdd}
                        modalVisible={this.state.modalVisible}
                        confirmLoading={this.state.confirmLoading}
                        handleOk={this.handleSave}
                        handleCancel={this.handleModalCancel}
                        onRef={this.onRef}
                        defaultValue={this.state.selectedRows[0] ? this.state.selectedRows[0] : {}}/>
                </div>
            </Modal>
        );
    }


}

export default ConfigExUserModal


