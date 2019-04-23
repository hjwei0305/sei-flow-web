/**
 * <p/>
 * 实现功能：业务实体
 * <p/>
 *
 * @author 李艳
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Button, message, Input, Modal} from 'antd';
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import {deleteCorp, getBusinessModel, save} from "./BusinessModelService";
import {appModuleAuthConfig} from "../../../configs/CommonComponentsConfig";
import SearchTable from "../../../commons/components/SearchTable";
import BusinessModelModal from "./BusinessModelModal";
import ConfigWorkPageModal from "./workPage/ConfigWorkPageModal";
import ConfigServerUrlModal from "./serverUrl/ConfigServerUrlModal";
import ConfigExUserModal from "./exUser/ConfigExUserModal";
import PropertiesForConditionPojoModal from "./propertiesForConditionPojo/PropertiesForConditionPojoModal";
import StandardDropdown from "../../../commons/components/StandardDropdown";

const Search = Input.Search;
const confirm = Modal.confirm;

class BusinessModelTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            modalVisible: false,
            confirmLoading: false,
            selectedRows: [],
            operateFlag: "add",
            pageInfo:null,
            searchValue:"",
            appModule:{},
            workPageModalVisible:false,
            configServerUrlModalVisible:false,
            exUserModalVisible:false,
            checkModalVisible:false,
        };
    }

    componentWillMount() {
    }

    onRef = (ref) => {
        this.ref = ref
    };
    getDataSource = (params) => {
        this.props.show();
        getBusinessModel(params).then(data => {
            this.setState({data, selectedRows: []})
        }).catch(e => {
        }).finally(() => {
            this.props.hide();
        })
    };

    handleRowSelectChange = (selectedRows) => {
        this.setState({selectedRows,editData:selectedRows[0]?selectedRows[0]:null})
    };
    handleModalVisible = (modalVisible=false,workPageModalVisible=false,configServerUrlModalVisible=false,exUserModalVisible=false,checkModalVisible=false) => {
        this.setState({modalVisible,workPageModalVisible, configServerUrlModalVisible,exUserModalVisible,checkModalVisible})
    };
    addClick = () => {
        this.handleModalVisible(true);
        this.setState({operateFlag:'add'})
    };
    refClick = () => {
        this.handleModalVisible(true);
        this.setState({operateFlag:'refAdd'})
    };
    editClick = (record) => {
        this.setState({editData: record});
        this.handleModalVisible(true);
        this.setState({operateFlag:'edit'})
    };
    configWorkPageClick =(record) => {
        this.setState({editData: record});
        this.handleModalVisible(false,true)
    };
    configServerUrlClick= (record) => {
        this.setState({editData: record});
        this.handleModalVisible(false,false,true)
    };
    configExUserClick = (record) => {
        this.setState({editData: record});
        this.handleModalVisible(false,false,false,true)
    };
    checkClick = (record) => {
        this.setState({editData: record});
        this.handleModalVisible(false,false,false,false,true)
    };
    handleSave = () => {
        const {operateFlag,appModule,searchValue}=this.state;
        this.ref.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let params = {};
                Object.assign(params, values);
                if (operateFlag==='refAdd'||operateFlag==='add'){
                    delete params.id;
                }
                this.setState({confirmLoading: true});
                save(params).then(result => {
                    if (result.status === "SUCCESS") {
                        message.success(result.message ? result.message : "请求成功");
                        //刷新本地数据
                        this.getDataSource({quickSearchValue:searchValue,filters:[{
                                fieldName:"appModule.id",//筛选字段
                                operator:"EQ",//操作类型
                                value:`${appModule.id}`,//筛选值
                                fieldType:"String"//筛选类型
                            }]});
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

    handleModalCancel = () => {
        this.handleModalVisible()
    };

    handleSearch = (value) => {
        const {appModule}=this.state;
        this.setState({searchValue:value});
        this.getDataSource({quickSearchValue:value,filters:[{
                fieldName:"appModule.id",//筛选字段
                operator:"EQ",//操作类型
                value:`${appModule.id}`,//筛选值
                fieldType:"String"//筛选类型
            }]});
    };

    deleteClick = (record) => {
        this.setState({editData: record});
        let thiz = this;
        const {appModule,searchValue,pageInfo,selectedRows}=thiz.state;
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
                        thiz.getDataSource({quickSearchValue:searchValue,pageInfo:pageInfo,filters:[{
                                fieldName:"appModule.id",//筛选字段
                                operator:"EQ",//操作类型
                                value:`${appModule.id}`,//筛选值
                                fieldType:"String"//筛选类型
                            }]});
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
        const {searchValue}=this.state;
        this.setState({appModule:record})
        this.getDataSource({quickSearchValue:searchValue,filters:[{
                fieldName:"appModule.id",//筛选字段
                operator:"EQ",//操作类型
                value:`${record.id}`,//筛选值
                fieldType:"String"//筛选类型
            }]});
    };
    pageChange = (pageInfo) => {
        const {appModule,searchValue}=this.state;
        this.setState({
            pageInfo:pageInfo,
        });
        this.getDataSource({quickSearchValue:searchValue,pageInfo,filters:[{
                fieldName:"appModule.id",//筛选字段
                operator:"EQ",//操作类型
                value:`${appModule.id}`,//筛选值
                fieldType:"String"//筛选类型
            }]})
    };
    render() {
        const columns = [
            {
                title: "操作",
                width: 120,
                dataIndex: "operator",
                render: (text, record, index) => {
                    let ops=[
                        <a className={'row-operator-item'} key={"edit"+index} onClick={() => this.editClick(record)}>编辑</a>,
                        <a className={'row-operator-item'} key={"delete" +index} onClick={() => this.deleteClick(record)}>删除</a>,
                        <a className={'row-operator-item'} key={"configWorkPage"+index} onClick={() => this.configWorkPageClick(record)}>配置工作界面</a>,
                        <a className={'row-operator-item'} key={"configUrl" +index} onClick={() => this.configServerUrlClick(record)}>配置服务地址</a>,
                        <a className={'row-operator-item'} key={"configExUser"+index} onClick={() => this.configExUserClick(record)}>自定义执行人配置</a>,
                        <a className={'row-operator-item'} key={"check" +index} onClick={() => this.checkClick(record)}>查看条件属性</a>
                    ]
                    return (
                        <div className={'row-operator'} onClick={(e) => {
                            e.stopPropagation()
                        }}>
                           <StandardDropdown operator={ops}/>
                        </div>
                    )
                }
            },
            {
                title: '名称',
                dataIndex: 'name',
                width: 240
            },
            {
                title: '类全路径',
                dataIndex: 'className',
                width: 400
            },
            {
                title: '应用模块Code',
                dataIndex: 'appModuleCode',
                width: 120,
            },
            {
                title: '表单明细URL',
                dataIndex: 'businessDetailServiceUrl',
                width: 400,
            },
            {
                title: '表单URL',
                dataIndex: 'lookUrl',
                width: 400,
            },
        ];

        const title = () => {
            return [
                <span key={"select"} className={"primaryButton"}>应用模块：
                    <SearchTable
                    key="searchTable"
                    initValue={true}
                    isNotFormItem={true} config={appModuleAuthConfig}
                    style={{width: 220}}
                    selectChange={this.selectChange}/></span>,
                <Button key="add" className={"primaryButton"}
                        onClick={this.addClick}>新增</Button>,
                <Button key="refAdd" className={"primaryButton"}
                        onClick={this.refClick}>参考创建</Button>,
            ]
        };

        //表头搜索框
        const search = () => {
            return [
                <Search
                    key="search"
                    placeholder="输入关键字查询"
                    onSearch={value => this.handleSearch(value)}
                    style={{width: 220}}
                    allowClear
                />
            ]
        };
        const {appModule,selectedRows,operateFlag,data,confirmLoading,modalVisible,workPageModalVisible,
            configServerUrlModalVisible,exUserModalVisible,checkModalVisible,editData}=this.state;
        return (
            <div>
                <div  className={'tbar-box'}>
                    <div  className={'tbar-btn-box'}>{title()}</div>
                    <div  className={'tbar-search-box'}>{search()}</div>
                </div>
                <SimpleTable
                    rowsSelected={selectedRows}
                    onSelectRow={this.handleRowSelectChange}
                    data={data}
                    columns={columns}
                    pageChange={this.pageChange}
                />
                {modalVisible&&<BusinessModelModal
                    appModuleId={appModule?appModule.id:""}
                    operateFlag={operateFlag}
                    modalVisible={modalVisible}
                    confirmLoading={confirmLoading}
                    handleOk={this.handleSave}
                    handleCancel={this.handleModalCancel}
                    onRef={this.onRef}
                    defaultValue={editData?editData:{}}/>}
                {workPageModalVisible&&<ConfigWorkPageModal
                    appModuleId={appModule?appModule.id:""}
                    businessModelId={editData?editData.id:""}
                    modalVisible={workPageModalVisible}
                    handleCancel={this.handleModalCancel}/>}
                {configServerUrlModalVisible&&<ConfigServerUrlModal
                    appModuleId={appModule?appModule.id:""}
                    businessModelId={editData?editData.id:""}
                    modalVisible={configServerUrlModalVisible}
                    handleCancel={this.handleModalCancel}/>}
                {exUserModalVisible&&<ConfigExUserModal
                    appModuleId={appModule?appModule.id:""}
                    businessModelId={editData?editData.id:""}
                    modalVisible={exUserModalVisible}
                    handleCancel={this.handleModalCancel}/>}
                {checkModalVisible&& <PropertiesForConditionPojoModal
                    appModuleId={appModule?appModule.id:""}
                    className={editData?editData.className:""}
                    modalVisible={checkModalVisible}
                    handleCancel={this.handleModalCancel}/>
                }
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
)(BusinessModelTable)



