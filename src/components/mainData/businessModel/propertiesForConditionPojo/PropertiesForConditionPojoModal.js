/**
 * @description 查看条件属性
 * @author 李艳
 */

import React, {Component} from 'react'
import connect from "react-redux/es/connect/connect";
import {message,Modal} from 'antd';
import {show, hide} from '../../../../configs/SharedReducer'
import {
    getPropertiesForConditionPojo,
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
            isAdd: false,
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
        let {className}=this.props;
        Object.assign(params,{businessModelCode:className});
        this.setState({loading:true});
        getPropertiesForConditionPojo(params).then(data => {
            this.setState({data, selectedRows: [],searchValue:""})
        }).catch(e => {
        }).finally(() => {
            this.setState({loading:false});
        })
    };

    render() {
        const columns = [
            {
                title: '属性',
                dataIndex: 'code',
                width:200
            },
            {
                title: '名称',
                dataIndex: 'name',
                width:200
            },


        ];

        const {modalVisible,handleCancel} = this.props;
        return (
            <Modal title={<span className={'header-span'}>{"查看条件属性"}</span>}
                   visible={modalVisible}
                   width={500}
                   maskClosable={false}
                   onCancel={handleCancel}
                   bodyStyle={{minHeight:500}}
                   footer={false}
            >
                <div style={{width: this.props.width ? this.props.width : '100%'}}>
                    <SimpleTable
                        rowsSelected={this.state.selectedRows}
                        data={this.state.searchValue ? this.state.data.filter(item => item.tag === true) : this.state.data}
                        columns={columns}
                        loading={this.state.loading}
                    />
                </div>
            </Modal>
        );
    }


}

export default PropertiesForConditionPojoModal


