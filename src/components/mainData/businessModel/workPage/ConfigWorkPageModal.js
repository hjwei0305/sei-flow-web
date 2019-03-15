/**
 * @description 配置工作界面
 * @author 李艳
 */

import React, {Component} from 'react'
import connect from "react-redux/es/connect/connect";
import {Modal} from 'antd';
import {show, hide} from '../../../../configs/SharedReducer'
import TransferTable from "../../../../commons/components/TransferTable";
import {appModuleConfig} from "../../../../configs/CommonComponentsConfig";
import {listAllNotSelectEdByAppModuleId, listAllSelectEdByAppModuleId, saveSetWorkPage} from "../BusinessModelService";

class ConfigWorkPageModal extends Component {

    onRef = (ref) => {
        this.ref = ref;
    };
    handleLeftClick = async (rows, rightData) => {
        const {appModuleId, businessModelId} = this.props;
        let ids = [];
        for (let data of rightData) {
            if (rows.findIndex(item => item.id === data.id) > -1) {
                continue;
            }
            ids.push(data.id);
        }
        await saveSetWorkPage(`/${businessModelId}`, ids.join(',')).then((data) => {
        }).catch(err => {
            this.props.hide()
        })

    }

    handleRightClick = async (rows, rightData) => {
        const {appModuleId, businessModelId} = this.props;
        let ids = [];
        for (let i = 0; i < rows.length; i++) {
            ids.push(rows[i].id);
        }
        for (let data of rightData) {
            if (rows.findIndex(item => item.id === data.id) > -1) {
                continue;
            }
            ids.push(data.id);
        }
        await saveSetWorkPage(`/${businessModelId}`, ids.join(',')).then((data) => {
        }).catch(err => {
            this.props.hide()
        })
    };

    leftService = async (params) => {
        let result = [];
        const {appModuleId, businessModelId} = this.props;

        let moduleId = "";
        if (!params.selectedKey) {
            moduleId = appModuleId;
        } else {
            moduleId = params.selectedKey;
        }
        await listAllNotSelectEdByAppModuleId("/" + `${moduleId}/${businessModelId}`).then((res) => {
            result = res;
        });
        return result;
    };

    rightService = async (params) => {
        let result = [];
        const {appModuleId, businessModelId} = this.props;
        await listAllSelectEdByAppModuleId({businessModelId}).then((res) => {
            result = res
        });
        return result;
    };

    JointQueryService = async (key) => {
        const {appModuleId, businessModelId} = this.props;
        let result = [];
        await listAllNotSelectEdByAppModuleId("/" + `${key}/${businessModelId}`).then((res) => {
            result = res
        });
        return result;
    };

    render() {
        const {appModuleId} = this.props;
        const leftColumns = [
            {
                title: '名称',
                dataIndex: 'name',
                width: 200
            },
            {
                title: 'URL地址',
                dataIndex: 'url',
                width: 300
            }
        ];
        const searchTableConfig = {...appModuleConfig, lable: "应用模块", defaultValue: appModuleId,props:{canNotClear:true}};
        const {modalVisible, handleCancel} = this.props;
        return (
            <Modal title={<span className={'header-span'}>{"工作界面配置"}</span>}
                   visible={modalVisible}
                   width={1000}
                   maskClosable={false}
                   onCancel={handleCancel}
                   bodyStyle={{minHeight: 500}}
                   footer={false}
            >
                <div style={{textAlign: "center"}}>
                    <TransferTable
                        width={900}
                        handleLeftClick={this.handleLeftClick.bind(this)}
                        handleRightClick={this.handleRightClick.bind(this)}
                        searchTableConfig={searchTableConfig}
                        rightService={this.rightService.bind(this)}
                        leftService={this.leftService.bind(this)}
                        JointQueryService={this.JointQueryService.bind(this)}
                        leftColumns={leftColumns}
                        rightColumns={leftColumns}
                        heightY={250}
                        leftSearch={false}
                        rightSearch={false}
                        onRef={this.onRef}
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
)(ConfigWorkPageModal)


