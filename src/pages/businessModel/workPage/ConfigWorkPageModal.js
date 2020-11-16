/**
 * @description 配置工作界面
 * @author 李艳
 */

import React, {Component} from 'react'
import {connect} from 'dva';
import {Input, Modal} from 'antd';
import TransferTable from "@/components/TransferTable";
import {listAllNotSelectEdByAppModuleId, listAllSelectEdByAppModuleId, saveSetWorkPage} from "../BusinessModelService";
import {seiLocale} from 'sei-utils';
import {appModuleConfig,} from '@/utils/CommonComponentsConfig';

const {seiIntl} = seiLocale;

class ConfigWorkPageModal extends Component {

  //删除分配
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
      this.toggoleGlobalLoading(false)
    })

  }

  toggoleGlobalLoading = (loading) => {
    const {dispatch,} = this.props;
    dispatch({
      type: 'global/updateState',
      payload: {
        globalLoading: loading,
      }
    });
  }

  //插入分配
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
      this.toggoleGlobalLoading(false)
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
        title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
        dataIndex: 'name',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000033', desc: 'URL地址'}),
        dataIndex: 'url',
        width: 300
      }
    ];
    const searchTableConfig = {
      ...appModuleConfig,
      lable: seiIntl.get({key: 'flow_000041', desc: '应用模块'}),
      defaultValue: appModuleId,
      props: {canNotClear: true}
    };

    const {modalVisible, handleCancel} = this.props;
    return (
      <Modal title={seiIntl.get({key: 'flow_000005', desc: '工作界面配置'})}
             visible={modalVisible}
             width={1100}
             maskClosable={false}
             onCancel={handleCancel}
             bodyStyle={{minHeight: 500}}
             footer={false}
             centered={true}
      >
        <TransferTable
          width={1000}
          style={{background: "#fff"}}
          handleLeftClick={this.handleLeftClick.bind(this)}
          handleRightClick={this.handleRightClick.bind(this)}
          searchTableConfig={searchTableConfig}
          rightService={this.rightService.bind(this)}
          leftService={this.leftService.bind(this)}
          JointQueryService={this.JointQueryService.bind(this)}
          leftColumns={leftColumns}
          rightColumns={leftColumns}
          heightY={250}
          searchLeftKey={['name', 'url']}
          // leftSearch={search}
          rightSearch={false}
        />
      </Modal>
    );

  }


}

const mapStateToProps = ({}) => {
  return {};
}


export default connect(
  mapStateToProps,
)(ConfigWorkPageModal)


