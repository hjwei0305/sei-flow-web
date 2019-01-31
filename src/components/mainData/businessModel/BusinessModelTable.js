/**
 * <p/>
 * 实现功能：业务实体
 * <p/>
 *
 * @author 李艳
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Button, Col, Row, message, Input, Modal} from 'antd';
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import {deleteCorp, getBusinessModel, save} from "./BusinessModelService";
import {appModuleConfig} from "../../../configs/CommonComponentsConfig";
import SearchTable from "../../../commons/components/SearchTable";
import BusinessModelModal from "./BusinessModelModal";

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
            appModule:{}
        };
    }

    componentWillMount() {
        //this.getDataSource()
    }

    onRef = (ref) => {
        this.ref = ref
    };
    getDataSource = (params) => {
        this.props.show();
        getBusinessModel(params).then(data => {
            this.setState({data, selectedRows: [], searchValue: ""})
        }).catch(e => {
        }).finally(() => {
            this.props.hide();
        })
    };

    handleRowSelectChange = (selectedRows) => {
        this.setState({selectedRows})
    };
    handleModalVisible = (modalVisible, operateFlag) => {
        this.setState({modalVisible, operateFlag})
    };
    addClick = () => {
        this.handleModalVisible(true, "add")
    };
    refClick = () => {
        this.handleModalVisible(true, "refAdd")
    };

    editClick = () => {
        if (!this.judgeSelected()) return;
        this.handleModalVisible(true, "edit")
    };
    handleSave = () => {
        let {operateFlag}=this.state;
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
        this.getDataSource({Quick_value: value});
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
                        thiz.getDataSource();
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
        this.setState({appModule:record})
        this.getDataSource({Q_EQ_appModuleId: record.id});
    };
    pageChange = (pageInfo) => {
        console.log("pageChange")
        this.setState({
            pageInfo:pageInfo,
        });
        this.getDataSource({Quick_value:this.state.searchValue,...pageInfo})
    };
    render() {
        const {appModule}=this.state;
        const columns = [
            {
                title: '名称',
                dataIndex: 'name',
                width: 200
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
                <SearchTable
                    key="searchTable"
                    initValue={true}
                    isNotFormItem={true} config={appModuleConfig}
                    style={{width: 220, marginRight: '8px'}}
                    selectChange={this.selectChange}/>,
                <Button key="add" style={{marginRight: '8px'}}
                        onClick={this.addClick}>新增</Button>,
                <Button key="refAdd" style={{marginRight: '8px'}}
                        onClick={this.refClick}>参考创建</Button>,
                <Button key="edit" style={{marginRight: '8px'}}
                        onClick={this.editClick}>编辑</Button>,
                <Button key="delete" style={{marginRight: '8px'}}
                        onClick={this.deleteClick}>删除</Button>,
                <Button key="configWorkPage" style={{marginRight: '8px'}}
                        onClick={this.refClick}>配置工作界面</Button>,
                <Button key="configUrl" style={{marginRight: '8px'}}
                        onClick={this.editClick}>配置服务地址</Button>,
                <Button key="check" style={{marginRight: '8px'}}
                        onClick={this.deleteClick}>查看条件属性</Button>,
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
            <div style={{width: this.props.width ? this.props.width : '100%'}}>
                <Row style={{
                    background: '#F3F8FC',
                    padding: 5,
                    paddingBottom: 5,
                    border: '1px solid #e8e8e8',
                    borderBottom: 'none'
                }}>
                    <Col span={16}>{title()}</Col>
                    <Col span={8}>
                        <div style={{textAlign: 'right'}}>{search()}</div>
                    </Col>
                </Row>
                <SimpleTable
                    rowsSelected={this.state.selectedRows}
                    onSelectRow={this.handleRowSelectChange}
                    data={this.state.searchValue ? this.state.data.filter(item => item.tag === true) : this.state.data}
                    columns={columns}
                    pageChange={this.pageChange}
                />
                <BusinessModelModal
                    operateFlag={this.state.operateFlag}
                    modalVisible={this.state.modalVisible}
                    confirmLoading={this.state.confirmLoading}
                    handleOk={this.handleSave}
                    handleCancel={this.handleModalCancel}
                    onRef={this.onRef}
                    defaultValue={this.state.selectedRows[0] ? this.state.selectedRows[0] :
                        appModule?{appModule}:{}}/>
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



