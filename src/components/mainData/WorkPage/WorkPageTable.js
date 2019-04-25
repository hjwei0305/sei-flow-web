/**
 * <p/>
 * 实现功能：工作界面配置
 * <p/>
 *
 * @author 李艳
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Button,message, Input, Modal} from 'antd';
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import {deleteCorp, getWorkPage, save} from "./WorkPageService";
import {appModuleConfig} from "../../../configs/CommonComponentsConfig";
import SearchTable from "../../../commons/components/SearchTable";
import WorkPageModal from "./WorkPageModal";
import HeadBreadcrumb from "../../../commons/components/breadcrumb/HeadBreadcrumb";

const Search = Input.Search;
const confirm = Modal.confirm;

class WorkPageTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            modalVisible: false,
            confirmLoading: false,
            selectedRows: [],
            isAdd: false,
            pageInfo: null,
            searchValue: "",
            appModule: {}
        };
    }

    componentWillMount() {
    }

    onRef = (ref) => {
        this.ref = ref
    };
    getDataSource = (params) => {
        this.props.show();
        getWorkPage(params).then(data => {
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
      const {appModule}=this.state;
      if(appModule&&appModule.id){
        this.handleModalVisible(true, true)
      }else {
        message.error("请选择应用模块！")
      }

    };
    editClick = (record) => {
        this.setState({editData: record});
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
                        this.getDataSource({
                            quickSearchValue: this.state.searchValue, filters: [{
                                fieldName: "appModuleId",//筛选字段
                                operator: "EQ",//操作类型
                                value: `${this.state.appModule.id}`,//筛选值
                                fieldType: "String"//筛选类型
                            }]
                        });
                      this.setState({confirmLoading: false, modalVisible: false});
                    } else {
                        message.error(result.message ? result.message : "请求失败");
                      this.setState({confirmLoading: false});
                    }
                }).catch(e => {
                  this.setState({confirmLoading: false});
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
        this.setState({searchValue: value});
        this.getDataSource({
            quickSearchValue: value, filters: [{
                fieldName: "appModuleId",//筛选字段
                operator: "EQ",//操作类型
                value: `${this.state.appModule.id}`,//筛选值
                fieldType: "String"//筛选类型
            }]
        });
    };

    deleteClick = (record) => {
        let thiz = this;
        confirm({
          title: "温馨提示",
          content: "确定要删除吗？",
            onOk() {
                let params = {};
                params = record.id;
                thiz.props.show();
                deleteCorp(params).then(result => {
                    if (result.status === "SUCCESS") {
                        message.success(result.message ? result.message : "请求成功");
                        //刷新本地数据
                        thiz.getDataSource({
                            quickSearchValue: thiz.state.searchValue, pageInfo: thiz.state.pageInfo, filters: [{
                                fieldName: "appModuleId",//筛选字段
                                operator: "EQ",//操作类型
                                value: `${thiz.state.appModule.id}`,//筛选值
                                fieldType: "String"//筛选类型
                            }]
                        });
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
        this.setState({appModule: record});
        this.getDataSource({
            quickSearchValue: this.state.searchValue, filters: [{
                fieldName: "appModuleId",//筛选字段
                operator: "EQ",//操作类型
                value: `${record.id}`,//筛选值
                fieldType: "String"//筛选类型
            }]
        });
    };
    pageChange = (pageInfo) => {
        this.setState({
            pageInfo: pageInfo,
        });
        this.getDataSource({
            quickSearchValue: this.state.searchValue, pageInfo, filters: [{
                fieldName: "appModuleId",//筛选字段
                operator: "EQ",//操作类型
                value: `${this.state.appModule.id}`,//筛选值
                fieldType: "String"//筛选类型
            }]
        })
    };

    render() {
        const columns = [
            {
                title: "操作",
                width: 120,
                dataIndex: "operator",
                render: (text, record, index) => {
                    return (
                        <div className={'row-operator'} onClick={(e) => {
                            e.stopPropagation()
                        }}>
                            <a className={'row-operator-item'} key={"edit"+index} onClick={() => this.editClick(record)}>编辑</a>
                            <a className={'row-operator-item'} key={"delete" +index} onClick={() => this.deleteClick(record)}>删除</a>
                        </div>
                    )
                }
            },
            {
                title: '名称',
                dataIndex: 'name',
                width: 300
            },
            {
                title: 'URL地址',
                dataIndex: 'url',
                width: 400
            },
            {
                title: '必须提交',
                dataIndex: 'mustCommit',
                width: 100,
                render: (text, record) => {
                    if (record.mustCommit) {
                        return "是"
                    } else {
                        return "否"
                    }
                }
            },
            {
                title: '描述',
                dataIndex: 'depict',
                width: 400,
            },
        ];

        const title = () => {
            return [
                <span key={"select"} className={"primaryButton"}>应用模块：
                    <SearchTable
                        key="searchTable"
                        initValue={true}
                        isNotFormItem={true} config={appModuleConfig}
                        style={{width: 220}}
                        selectChange={this.selectChange}/>
                </span>,
                <Button  key={"add"} className={"primaryButton"} onClick={this.addClick} type={"primary"}>新增</Button>,
            ]
        };

        //表头搜索框
        const search = () => {
            return [
                <Search
                    key="search"
                    placeholder="输入代码或名称查询"
                    onSearch={value => this.handleSearch(value)}
                    style={{width: 220}}
                    allowClear
                />
            ]
        };
        const {editData, data, selectedRows, isAdd, modalVisible, confirmLoading,appModule} = this.state;
        return (
            <HeadBreadcrumb>
                <div>
                    <div className={'tbar-box'}>
                        <div className={'tbar-btn-box'}>{title()}</div>
                        <div className={'tbar-search-box'}>{search()}</div>
                    </div>
                    <SimpleTable
                        rowsSelected={selectedRows}
                        onSelectRow={this.handleRowSelectChange}
                        data={data}
                        columns={columns}
                        pageChange={this.pageChange}
                    />
                    <WorkPageModal
                        isAdd={isAdd}
                        modalVisible={modalVisible}
                        confirmLoading={confirmLoading}
                        handleOk={this.handleSave}
                        handleCancel={this.handleModalCancel}
                        onRef={this.onRef}
                        defaultValue={editData ? editData : {}}
                        appModule={appModule}/>
                </div>
            </HeadBreadcrumb>
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
)(WorkPageTable)



