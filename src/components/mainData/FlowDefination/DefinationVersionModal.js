/**
 * @description 配置服务地址
 * @author 李艳
 */

import React, {Component} from 'react'
import connect from "react-redux/es/connect/connect";
import {Button, Col, Row, message, Modal} from 'antd';
import {show, hide} from '../../../configs/SharedReducer'
import SimpleTable from "../../../commons/components/SimpleTable";
import {Input} from "antd/lib/index";
import {activateOrFreezeFlowDef, activateOrFreezeFlowVer, listFlowDefinationHistory} from "./FlowDefinationService";
import DefinaionModal from "./DefinaionModal";
import StandardDropdown from "../../../commons/components/StandardDropdown";
import {getUserInfo} from "../../../commons/utils/CommonUtils";
import {flowDefUrl} from "../../../configs/DefaultConfig";
import {mainTabAction} from "sei-utils";
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;
const Search = Input.Search;
const confirm = Modal.confirm;

class DefinationVersionModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      modalVisible: false,
      confirmLoading: false,
      selectedRows: [],
      isAdd: false,
      searchValue: "",
      loading: false
    };
  }

  componentWillMount() {
    this.getDataSource();
  }

  getDataSource = (params = {}) => {
    let {flowDefinationId} = this.props;
    Object.assign(params, {
      filters: [{
        fieldName: "flowDefination.id",//筛选字段
        operator: "EQ",//操作类型
        value: `${flowDefinationId}`,//筛选值
        fieldType: "String"//筛选类型
      }]
    });
    this.setState({loading: true});
    listFlowDefinationHistory(params).then(data => {
      this.setState({data})
    }).catch(e => {
    }).finally(() => {
      this.setState({loading: false});
    })
  };

  handleRowSelectChange = (selectedRows) => {
    this.setState({selectedRows})
  };

  refClick = () => {
    if (!this.judgeSelected()) return;
    const {selectedRows}=this.state;
    const {selectedNode}=this.props;
    this.setState({operator: "versionRef", definationModalVisible: true,editData: selectedRows})
    let auth =getUserInfo();
    let src = flowDefUrl;
    src=src+`/show?orgId=${selectedNode.id}&orgCode=${selectedNode.code}&_s=${auth.sessionId}`;
    let orgName=encodeURIComponent(encodeURIComponent(selectedNode.name));
    let title =seiIntl.get({key: 'flow_000114', desc: '参考创建'});
    src=src+`&versionCode=${selectedRows[0].versionCode}&businessModelId=${selectedRows[0].flowDefination.flowType.businessModel.id}&businessModelCode=${selectedRows[0].flowDefination.flowType.businessModel.className}&id=${selectedRows[0].flowDefination.id}&isFromVersion=${false}&isCopy=${true}&orgName=${orgName}`
    mainTabAction.tabOpen({id: selectedRows[0].id + 'versionRef', name: title, featureUrl: src})
  };
  checkClick = (record) => {
    this.setState({operator: "versionView", definationModalVisible: true,editData: record})
    // const {selectedRows}=this.state;
    const {selectedNode}=this.props;
    let auth =getUserInfo();
    let src = flowDefUrl;
    src=src+`/show?orgId=${selectedNode.id}&orgCode=${selectedNode.code}&_s=${auth.sessionId}`;
    let orgName=encodeURIComponent(encodeURIComponent(selectedNode.name));
    let title =seiIntl.get({key: 'flow_000127', desc: '查看流程定义'});
    src=flowDefUrl+`/showLook?id=${record.id}&_s=${auth.sessionId}`
    mainTabAction.tabOpen({id: record.id + 'versionView', name: title, featureUrl: src})
  };
  editClick = (record) => {
    this.setState({operator: "versionEdit", definationModalVisible: true,editData: record})
    const {selectedNode}=this.props;
    let auth =getUserInfo();
    let src = flowDefUrl;
    src=src+`/show?orgId=${selectedNode.id}&orgCode=${selectedNode.code}&_s=${auth.sessionId}`;
    let orgName=encodeURIComponent(encodeURIComponent(selectedNode.name));
    let title =seiIntl.get({key: 'flow_000031', desc: '编辑'});
    src=src+`&versionCode=${record.versionCode}&businessModelId=${record.flowDefination.flowType.businessModel.id}&businessModelCode=${record.flowDefination.flowType.businessModel.className}&id=${record.flowDefination.id}&isFromVersion=${true}`
    mainTabAction.tabOpen({id: record.id + 'versionView', name: title, featureUrl: src})
  };
  judgeSelected = () => {
    if (this.state.selectedRows.length === 0) {
      message.error(seiIntl.get({key: 'flow_000027', desc: '请选择一行数据！'}));
      return false
    }
    return true
  };

  handleSearch = (value) => {
    this.setState({searchValue: value});
    this.getDataSource({quickSearchValue: value});
  };
  pageChange = (pageInfo) => {
    this.setState({
      pageInfo: pageInfo,
    });
    this.getDataSource({quickSearchValue: this.state.searchValue, pageInfo})
  };
  onActivateOrFreezeFlowDefClick = (record) => {
    let id = record.id;
    let status = '';
    let title = '';
    if (record.flowDefinationStatus !== "INIT") {
      if (record.flowDefinationStatus === 'Activate') {
        status = 'Freeze';
        title =seiIntl.get({key: 'flow_000116', desc: '您确定要冻结吗？'})
      } else if (record.flowDefinationStatus === 'Freeze') {
        status = 'Activate';
        title =seiIntl.get({key: 'flow_000117', desc: '您确定要激活吗？'})
      }
    }
    let thiz = this;
    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: title,
      onOk() {
        thiz.setState({loading: true});
        activateOrFreezeFlowVer(id, status).then(result => {
          if (result.status === 'SUCCESS') {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            thiz.getDataSource()
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
          }
        }).catch(e => {
        }).finally(() => {
          thiz.setState({loading: false});
        })
      }
    });
  };
  handleModalCancel = () => {
    this.setState({definationModalVisible: false})
    //刷新本地数据
    this.getDataSource()
  };

  render() {
    const columns = [
      {
        title: seiIntl.get({key: 'flow_000030', desc: '操作'}),
        width: 180,
        dataIndex: "operator",
        render: (text, record, index) => {
          let ops = () => {
            let ops = [];
            ops.push(<a className={'row-operator-item'} key={"edit" + index}
                        onClick={() => this.editClick(record)}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</a>);
            ops.push(<a className={'row-operator-item'} key={"checkClick" + index}
                        onClick={() => this.checkClick(record)}>{seiIntl.get({key: 'flow_000127', desc: '查看流程定义'})}</a>);
            let statusText = '';
            if (record && record.flowDefinationStatus !== "INIT") {
              if (record.flowDefinationStatus === 'Activate') {
                statusText =seiIntl.get({key: 'flow_000119', desc: '冻结'})
              } else if (record.flowDefinationStatus === 'Freeze') {
                statusText =seiIntl.get({key: 'flow_000120', desc: '激活'})
              }
              ops.push(<a className={'row-operator-item'} key={"configWorkPage" + index}
                          onClick={() => this.onActivateOrFreezeFlowDefClick(record)}>{statusText}</a>);
            }
            return ops;
          }
          return (
            <div className={'row-operator'} onClick={(e) => {
              e.stopPropagation()
            }}>
              <StandardDropdown operator={ops()}/>
            </div>
          )
        }
      },
      {
        title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
        dataIndex: 'name',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000121', desc: '定义KEY'}),
        dataIndex: 'defKey',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000128', desc: '版本号'}),
        dataIndex: 'versionCode',
        width: 60,
        render(text) {
          return <div style={{textAlign: "right"}}>{text}</div>
        }
      },
      {
        title: seiIntl.get({key: 'flow_000124', desc: '优先级'}),
        dataIndex: 'priority',
        width: 60,
        render(text){
          return <div style={{textAlign:"right"}}>{text}</div>
        }
      },
      {
        title: seiIntl.get({key: 'flow_000122', desc: '流程定义状态'}),
        dataIndex: 'flowDefinationStatus',
        width: 120,
        render(text, record) {
          if ('INIT' === text) {
            return seiIntl.get({key: 'flow_000123', desc: '未发布'});
          } else if ('Activate' === text) {
            return seiIntl.get({key: 'flow_000120', desc: '激活'});
          }
          else if ('Freeze' === text) {
            return seiIntl.get({key: 'flow_000119', desc: '冻结'});
          }
          return "";
        }
      },
      {
        title: seiIntl.get({key: 'flow_000037', desc: '描述'}),
        dataIndex: 'depict',
        width: 120
      },
    ];
    const title = () => {
      return [
        <Button key="refAdd" style={{marginRight: '8px'}}
                onClick={this.refClick}>{seiIntl.get({key: 'flow_000114', desc: '参考创建'})}</Button>,
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Search
          key="search"
          placeholder={seiIntl.get({key: 'flow_000057', desc: '输入代码或名称查询'})}
          onSearch={value => this.handleSearch(value)}
          style={{width: 230}}
          allowClear
        />
      ]
    };
    const {definationModalVisible, selectedRows, data, editData, operator} = this.state;
    const {modalVisible, handleCancel, selectedNode} = this.props;
    return (
      <Modal title={seiIntl.get({key: 'flow_000118', desc: '流程定义版本管理'})}
             visible={modalVisible}
             width={700}
             maskClosable={false}
             onCancel={handleCancel}
             bodyStyle={{height: 500}}
             footer={false}
      >
        <div className={'tbar-box'}>
          <div className={'tbar-btn-box'}>{title()}</div>
          <div className={'tbar-search-box'}>{search()}</div>
        </div>
        <SimpleTable
          heightY={300}
          rowsSelected={selectedRows}
          onSelectRow={this.handleRowSelectChange}
          data={data}
          columns={columns}
          pageChange={this.pageChange}
          loading={this.state.loading}
        />
        {/*{definationModalVisible&&<DefinaionModal*/}
          {/*operator={operator}*/}
          {/*handleCancel={this.handleModalCancel}*/}
          {/*modalVisible={definationModalVisible}*/}
          {/*selectedNode={selectedNode ? selectedNode : {}}*/}
          {/*editData={editData ? editData : {}}*/}
          {/*flowDefinationId={editData ? editData.id : ""}*/}
        {/*/>}*/}
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
)(DefinationVersionModal)


