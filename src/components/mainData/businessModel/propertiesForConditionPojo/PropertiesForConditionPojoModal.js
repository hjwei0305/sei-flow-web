/**
 * @description 查看条件属性
 * @author 李艳
 */

import React, {Component} from 'react'
import connect from "react-redux/es/connect/connect";
import {message,Modal} from 'antd';
import {show, hide} from '../../../../configs/SharedReducer'
import {
    listServiceUrl,
} from "../BusinessModelService";
import SimpleTable from "../../../../commons/components/SimpleTable";
import {Input} from "antd/lib/index";

const Search = Input.Search;
const confirm=Modal.confirm;
class PropertiesForConditionPojoModal extends Component {
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

    judgeSelected = () => {
        if (this.state.selectedRows.length === 0) {
            message.error("请选择一行数据！");
            return false
        }
        return true
    };

    render() {
        const columns = [
            {
                title: '属性',
                dataIndex: 'properties',
                width:200
            },
            {
                title: '名称',
                dataIndex: 'name',
                width:140
            },


        ];

        const {modalVisible,handleCancel} = this.props;
        return (
            <Modal title={<span className={'header-span'}>{"查看条件属性"}</span>}
                   visible={modalVisible}
                   width={700}
                   maskClosable={false}
                   onCancel={handleCancel}
                   bodyStyle={{minHeight:500}}
                   footer={false}
            >
                <div style={{width: this.props.width ? this.props.width : '100%'}}>
                    <SimpleTable
                        rowsSelected={this.state.selectedRows}
                        onSelectRow={this.handleRowSelectChange}
                        data={this.state.searchValue ? this.state.data.filter(item => item.tag === true) : this.state.data}
                        columns={columns}
                    />
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
)(PropertiesForConditionPojoModal)


