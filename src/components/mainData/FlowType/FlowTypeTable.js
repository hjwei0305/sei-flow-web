/**
 * <p/>
 * 实现功能：流程类型管理
 * <p/>
 *
 * @author 李艳
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Button, Col, Row, message, Input, Modal} from 'antd';
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import {deleteCorp, getFlowType, save} from "./FlowTypeService";
import {businessModelConfig} from "../../../configs/CommonComponentsConfig";
import SearchTable from "../../../commons/components/SearchTable";
import FlowTypeModal from "./FlowTypeModal";

const Search = Input.Search;
const confirm = Modal.confirm;

class FlowTypeTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            modalVisible: false,
            confirmLoading: false,
            selectedRows: [],
            isAdd: false,
            pageInfo:null,
            searchValue:"",
            businessMode:null
        };
    }

    componentWillMount() {
        this.getDataSource()
    }

    onRef = (ref) => {
        this.ref = ref
    };
    getDataSource = (params={}) => {
        this.props.show();
        if (!params.filters&&this.state.businessMode){
            Object.assign(params,{filters:[{
                    fieldName:"businessModel.id",//筛选字段
                    operator:"EQ",//操作类型
                    value:`${this.state.businessMode.id}`,//筛选值
                    fieldType:"String"//筛选类型
                }]})
        }
        getFlowType(params).then(data => {
            this.setState({data, selectedRows: [], searchValue: ""})
        }).catch(e => {
        }).finally(() => {
            this.props.hide();
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
                save(params).then(result => {
                    if (result.status === "SUCCESS") {
                        message.success(result.message ? result.message : "请求成功");
                        //刷新本地数据
                        this.getDataSource();
                    } else {
                        message.error(result.message ? result.message : "请求失败");
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
        this.getDataSource({quickSearchValue: value});
    };

    deleteClick = () => {
        if (!this.judgeSelected()) return;
        let thiz = this;
        confirm({
            title: "确定要删除吗？",
            onOk() {
                let params = {};
                params = thiz.state.selectedRows[0].id;
                thiz.props.show();
                deleteCorp(params).then(result => {
                    if (result.status === "SUCCESS") {
                        message.success(result.message ? result.message : "请求成功");
                        //刷新本地数据
                        thiz.getDataSource({quickSearchValue:thiz.state.searchValue,pageInfo:thiz.state.pageInfo});
                    } else {
                        message.error(result.message ? result.message : "请求失败");
                    }
                }).catch(e => {
                }).finally(() => {
                    thiz.props.hide();
                })
            }
        });
    };
    selectChange = (record) => {
        if (record&&record.id){
            this.setState({businessMode:record});
            this.getDataSource({filters:[{
                    fieldName:"businessModel.id",//筛选字段
                    operator:"EQ",//操作类型
                    value:`${record.id}`,//筛选值
                    fieldType:"String"//筛选类型
                }],quickSearchValue:this.state.searchValue});
        }else {
            this.setState({businessMode:null});
            this.getDataSource({quickSearchValue:this.state.searchValue});
        }

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
                title: '代码',
                dataIndex: 'code',
                width: 240
            },
            {
                title: '名称',
                dataIndex: 'name',
                width: 240
            },
            {
                title: '描述',
                dataIndex: 'depict',
                width: 300,
            },
            {
                title: '所属业务实体模型',
                dataIndex: 'businessModel.depict',
                width: 300
            }
        ];

        const title = () => {
            return [
                <SearchTable
                    key="searchTable"
                    initValue={false}
                    isNotFormItem={true} config={businessModelConfig}
                    style={{width: 220, marginRight: '8px'}}
                    selectChange={this.selectChange}/>,
                <Button key="edit" style={{marginRight: '8px'}}
                        onClick={this.addClick}>新增</Button>,
                <Button key="check" style={{marginRight: '8px'}}
                        onClick={this.editClick}>编辑</Button>,
                <Button key="frozen" style={{marginRight: '8px'}}
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
                    style={{width: 230}}
                    enterButton
                />
            ]
        };

        return (
            <div>
                <div  className={'tbar-box'}>
                    <div  className={'tbar-btn-box'}>{title()}</div>
                    <div  className={'tbar-search-box'}>{search()}</div>
                </div>
                <SimpleTable
                    rowsSelected={this.state.selectedRows}
                    onSelectRow={this.handleRowSelectChange}
                    data={this.state.searchValue ? this.state.data.filter(item => item.tag === true) : this.state.data}
                    columns={columns}
                    pageChange={this.pageChange}
                />
                <FlowTypeModal
                    isAdd={this.state.isAdd}
                    modalVisible={this.state.modalVisible}
                    confirmLoading={this.state.confirmLoading}
                    handleOk={this.handleSave}
                    handleCancel={this.handleModalCancel}
                    onRef={this.onRef}
                    defaultValue={this.state.selectedRows[0] ? this.state.selectedRows[0] : {}}/>
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
)(FlowTypeTable)



