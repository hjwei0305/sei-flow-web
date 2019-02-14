/**
 * @description 配置服务地址
 * @author 李艳
 */

import React, {Component} from 'react'
import connect from "react-redux/es/connect/connect";
import {Button, Col, Row, message,Modal} from 'antd';
import {show, hide} from '../../../../configs/SharedReducer'
import {
    listServiceUrl, saveServiceUrl,
} from "../BusinessModelService";
import {searchListByKeyWithTag} from "../../../../commons/utils/CommonUtils";
import SimpleTable from "../../../../commons/components/SimpleTable";
import {Input} from "antd/lib/index";
import EditServerUrlModal from "./EditServerUrlModal";

const Search = Input.Search;
const confirm=Modal.confirm;
class ConfigServerUrlModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            modalVisible: false,
            confirmLoading: false,
            selectedRows: [],
            isAdd: false
        };
    }

    componentWillMount() {
        let {businessModelId}=this.props;
        this.getDataSource({Q_EQ_businessModelId:businessModelId})
    }

    onRef = (ref) => {
        this.ref = ref
    };
    getDataSource = (params) => {
        this.props.show();
        listServiceUrl(params).then(data => {
            this.setState({data, selectedRows: [],searchValue:""})
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
                params.businessModel={};
                params.businessModel.id=this.props.businessModelId;
                saveServiceUrl(params).then(result => {
                    if (result.status==="SUCCESS") {
                        message.success(result.message?result.message:"请求成功");
                        //刷新本地数据
                        this.getDataSource();
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
        searchListByKeyWithTag(this.state.data, {keyword: value}).then(data => {
            this.setState({data, searchValue: value})
        })
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
                title: 'URL',
                dataIndex: 'url',
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
                        onClick={this.editClick}>编辑</Button>
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
            <Modal title={<span className={'header-span'}>{"服务地址管理"}</span>}
                   visible={modalVisible}
                   width={700}
                   maskClosable={false}
                   onCancel={handleCancel}
                   bodyStyle={{minHeight:500}}
                   footer={false}
            >
                <div style={{width: this.props.width ? this.props.width : '100%'}}>
                    <Row style={{
                        background: '#F3F8FC',
                        padding: 5,
                        paddingBottom: 5,
                        border: '1px solid #e8e8e8',
                        borderBottom: 'none'
                    }}>
                        <Col span={14}>{title()}</Col>
                        <Col span={10}><div  style={{textAlign: 'right'}}>{search()}</div></Col>
                    </Row>
                    <SimpleTable
                        rowsSelected={this.state.selectedRows}
                        onSelectRow={this.handleRowSelectChange}
                        data={this.state.searchValue ? this.state.data.filter(item => item.tag === true) : this.state.data}
                        columns={columns}
                    />
                    <EditServerUrlModal
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
)(ConfigServerUrlModal)


