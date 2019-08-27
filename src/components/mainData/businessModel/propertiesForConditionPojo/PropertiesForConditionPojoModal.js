/**
 * @description 查看条件属性
 * @author 李艳
 */

import React, {Component} from 'react'
import {Modal} from 'antd';
import {
    getPropertiesForConditionPojo,
} from "../BusinessModelService";
import SimpleTable from "../../../../commons/components/SimpleTable";
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;

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
            this.setState({data, selectedRows: []})
        }).catch(e => {
        }).finally(() => {
            this.setState({loading:false});
        })
    };

    render() {
        const columns = [
            {
                title: seiIntl.get({key: 'flow_000151', desc: '属性'}),
                dataIndex: 'code',
                width:200
            },
            {
                title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
                dataIndex: 'name',
                width:200
            },


        ];

        const {modalVisible,handleCancel} = this.props;
        return (
            <Modal title={seiIntl.get({key: 'flow_000152', desc: '查看条件属性'})}
                   visible={modalVisible}
                   width={500}
                   maskClosable={false}
                   onCancel={handleCancel}
                   bodyStyle={{minHeight:500}}
                   footer={false}
                   centered={true}
            >
                <div>
                    <SimpleTable
                        rowsSelected={this.state.selectedRows}
                        data={this.state.data}
                        columns={columns}
                        loading={this.state.loading}
                    />
                </div>
            </Modal>
        );
    }


}

export default PropertiesForConditionPojoModal


