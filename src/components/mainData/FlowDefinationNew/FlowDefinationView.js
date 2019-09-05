/**
 * @description 流程定义
 * @author 李艳
 */
import {Component} from "react";
import React from "react";
import {Button, Col, Row, Modal, message} from "antd";
import {Input} from "antd/lib/index";
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import connect from "react-redux/es/connect/connect";
import {
  activateOrFreezeFlowDef, deleteFlowDefination, getFlowDefVersion, listAllOrgs,
  listFlowDefination
} from "./FlowDefinationService";
import DefinationVersionModal from "./DefinationVersionModal";
import StandardTree from "../../../commons/components/StandardTree";
import DetailCard from "../../../commons/components/DetailCard";
import HeadBreadcrumb from "../../../commons/components/breadcrumb/HeadBreadcrumb";
import {defaultPageSize, flowDefUrlNew, rowGutter} from "../../../configs/DefaultConfig";
import StandardDropdown from "../../../commons/components/StandardDropdown";
import DefinaionModal from "./DefinaionModal";
import {mainTabAction} from 'sei-utils'
import {getUserInfo} from "../../../commons/utils/CommonUtils";
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;
const Search = Input.Search;
const confirm = Modal.confirm;

class FlowDefinationView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      tableSearchValue: "",
      tableData: [],
      treeSelectedKeys: [],
      selectedNode: {},
      loading: false,
      tableSelectRow: [],
      modalVisible: false,
      confirmLoading: false,
      operator: "add",
      pathName: seiIntl.get({key: 'flow_000009', desc: '流程定义管理'}),
    }
  }

  componentWillMount() {
    this.getTreeData()
  };

  //网络请求树控件数据
  getTreeData = (param) => {
    this.props.show();
    listAllOrgs(param).then((result) => {
      if (result.success) {

      }
      this.setState({
        treeData: result.data,
      });
    }).catch(err => {
    }).finally(() => {
      this.props.hide();
    });
  };

  //网络请求table控件数据
  listFlowDefination = (param) => {
    this.setState({loading: true});
    listFlowDefination(param).then((result) => {
      this.setState({
        tableData: result, tableSelectRow: []
      });
    }).catch(err => {
    }).finally(() => {
      this.setState({loading: false});
    });
  };

  //树节点选择触发
  onTreeSelect = (selectedKeys, selectedNodes) => {
    this.setState({treeSelectedKeys: selectedKeys});
    this.setState({selectedNode: selectedNodes[0] ? selectedNodes[0] : {}});
    if (selectedNodes[0]) {
      let params = {
        Q_EQ_orgId: selectedNodes[0] ? selectedNodes[0].id : "",
        pageInfo: {page: 1, rows: defaultPageSize}
      };
      this.listFlowDefination(params);
      this.setState({pathName: selectedNodes[0].name ? selectedNodes[0].name : this.state.pathName});
    }
  };

  handleTableSearch = (quickValue) => {
    //刷新本地数据
    let params = {
      Q_EQ_orgId: this.state.selectedNode.id,
      quickValue,
      pageInfo: this.state.pageInfo
    };
    this.setState({tableSearchValue:quickValue},()=>this.listFlowDefination(params));
  };
  onAddClick = () => {
    if (this.state.selectedNode && JSON.stringify(this.state.selectedNode) !== "{}") {
      // this.handleModalVisible(false, false, true);
      // if (!this.judgeSelected()) return;
      this.setState({operator: "add"})
      const {selectedNode = {}, tableSelectRow} = this.state;
      let auth = getUserInfo();
      let src = flowDefUrlNew;
      src = src + `/show?orgId=${selectedNode.id}&orgCode=${selectedNode.code}&_s=${auth.sessionId}`;
      let orgName = encodeURIComponent(encodeURIComponent(selectedNode.name));
      let title =seiIntl.get({key: 'flow_000039', desc: '新增'});
      mainTabAction.tabOpen({id: 'add', name: title, featureUrl: src})
    } else {
      message.error(seiIntl.get({key: 'flow_000113', desc: '请选择组织机构'}))
    }

  };
  onRefAddClick = () => {
    if (!this.judgeSelected()) return;
    // this.handleModalVisible(false, false, true);
    const {selectedNode = {},tableSelectRow} = this.state;
    this.setState({operator: "refAdd", editData: tableSelectRow})
    let auth = getUserInfo();
    let src = flowDefUrlNew;
    src = src + `/show?orgId=${selectedNode.id}&orgCode=${selectedNode.code}&_s=${auth.sessionId}`;
    let orgName = encodeURIComponent(encodeURIComponent(selectedNode.name));
    let title =seiIntl.get({key: 'flow_000114', desc: '参考创建'});
    src = src + `&orgName=${orgName}&businessModelId=${tableSelectRow[0].flowType.businessModel.id}&businessModelCode=${tableSelectRow[0].flowType.businessModel.className}&id=${tableSelectRow[0].id}&isFromVersion=${false}&isCopy=${true}`
    mainTabAction.tabOpen({id: tableSelectRow[0].id + 'refAdd', name: title, featureUrl: src})
  };
  onEditClick = (record) => {
    this.handleModalVisible(false, false, true);
    this.setState({operator: "edit", editData: record})
    const {selectedNode = {}} = this.state;
    let auth = getUserInfo();
    let src = flowDefUrlNew;
    src = src + `/show?orgId=${selectedNode.id}&orgCode=${selectedNode.code}&_s=${auth.sessionId}`;
    let title =seiIntl.get({key: 'flow_000031', desc: '编辑'});
    src = src + `&businessModelId=${record.flowType.businessModel.id}&businessModelCode=${record.flowType.businessModel.className}&id=${record.id}`
    mainTabAction.tabOpen({id: record.id + 'edit', name: title, featureUrl: src})
  };
  onResetClick = () => {
    if (!this.judgeSelected()) return;
    let thiz = this;
    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: seiIntl.get({key: 'flow_000115', desc: '您确定要重置流程图位置吗？'}),
      onOk() {
        let id = thiz.state.tableSelectRow[0].id;
        thiz.setState({loading: true});
        getFlowDefVersion(id).then(result => {
          if (result.success) {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            let params = {
              Q_EQ_orgId: thiz.state.selectedNode.id,
              quickValue: thiz.state.tableSearchValue,
              pageInfo: thiz.state.pageInfo
            };
            thiz.listFlowDefination(params);
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
  onActivateOrFreezeFlowDefClick = (record) => {
    // if (!this.judgeSelected()) return;
    // let {tableSelectRow} = this.state;
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
      content: title,
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      onOk() {
        thiz.setState({loading: true});
        activateOrFreezeFlowDef(id, status).then(result => {
          if (result.status === 'SUCCESS') {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            let params = {
              Q_EQ_orgId: thiz.state.selectedNode.id,
              quickValue: thiz.state.tableSearchValue,
              pageInfo: thiz.state.pageInfo
            };
            thiz.listFlowDefination(params);
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
  onVersionClick = (record) => {
    this.handleModalVisible(false, true);
    this.setState({editData: record});
  };

  onDeleteClick = (record) => {
    this.setState({editData: record});
    let thiz = this;
    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: seiIntl.get({key: 'flow_000029', desc: '删除后不可恢复，是否确定删除？'}),
      onOk() {
        let id = record.id;
        thiz.setState({loading: true});
        deleteFlowDefination(id).then(result => {
          if (result.status === 'SUCCESS') {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            let params = {
              Q_EQ_orgId: thiz.state.selectedNode.id,
              quickValue: thiz.state.tableSearchValue,
              pageInfo: thiz.state.pageInfo
            };
            thiz.listFlowDefination(params);
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
  onTableSelectRow = (tableSelectRow) => {
    this.setState({tableSelectRow});
    this.setState({editData: tableSelectRow[0] ? tableSelectRow[0] : {}});
  };
  judgeSelected = () => {
    if (!this.state.tableSelectRow[0]) {
      message.error(seiIntl.get({key: 'flow_000027', desc: '请选择一行数据！'}));
      return false;
    }
    return true;
  };
  handleModalVisible = (modalVisible = false, defVersionVisible = false, definationModalVisible = false) => {
    this.setState({modalVisible, defVersionVisible, definationModalVisible})
  };
  handleModalCancel = () => {
    this.handleModalVisible()
  };
  handleDefinationModalCancel = () => {
    this.handleModalVisible()
    //刷新本地数据
    const {selectedNode, tableSearchValue, pageInfo} = this.state;
    let params = {
      Q_EQ_orgId: selectedNode.id,
      quickValue: tableSearchValue,
      pageInfo: pageInfo
    };
    this.listFlowDefination(params);
  };
  pageChange = (pageInfo) => {
    const {quickValue} = this.state;
    this.setState({pageInfo});
    //刷新本地数据
    let params = {
      Q_EQ_orgId: this.state.selectedNode.id,
      quickValue,
      pageInfo
    };
    this.listFlowDefination(params);
  }

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
                        onClick={() => this.onEditClick(record)}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</a>);
            ops.push(<a className={'row-operator-item'} key={"deleteDef" + index}
                        onClick={() => this.onDeleteClick(record)}>{seiIntl.get({key: 'flow_000032', desc: '删除'})}</a>);
            ops.push(<a className={'row-operator-item'} key={"versionDef" + index}
                        onClick={() => this.onVersionClick(record)}>{seiIntl.get({key: 'flow_000118', desc: '流程定义版本管理'})}</a>);
            let statusText = '';
            if (record && record.flowDefinationStatus !== "INIT") {
              if (record.flowDefinationStatus === 'Activate') {
                statusText =seiIntl.get({key: 'flow_000119', desc: '冻结'});
              } else if (record.flowDefinationStatus === 'Freeze') {
                statusText =seiIntl.get({key: 'flow_000120', desc: '激活'});
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
        title: seiIntl.get({key: 'flow_000056', desc: '流程类型'}),
        dataIndex: 'flowType.name',
        width: 200
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
        title: seiIntl.get({key: 'flow_000124', desc: '优先级'}),
        dataIndex: 'priority',
        width: 120,
        render(text) {
          return <div style={{textAlign: "right"}}>{text}</div>
        }
      }
    ];
    const {tableSelectRow, operator, editData, definationModalVisible, selectedNode = {}} = this.state;
    const button = () => {
      return [
        <Button key="addRule" className={"primaryButton"} type={"primary"}
                onClick={this.onAddClick}>{seiIntl.get({key: 'flow_000039', desc: '新增'})}</Button>,
        <Button.Group key={"ButtonGroup"} className={"primaryButton"}>
          <Button key="refEdit"
                  onClick={this.onRefAddClick}>{seiIntl.get({key: 'flow_000114', desc: '参考创建'})}</Button>
          <Button key="reset"
                  onClick={this.onResetClick}>{seiIntl.get({key: 'flow_000125', desc: '位置重置'})}</Button>
        </Button.Group>

      ]
    };
    //表头搜索框
    const search = () => {
      return [
        <Search
          key="search"
          placeholder={seiIntl.get({key: 'flow_000057', desc: '输入代码或名称查询'})}
          onSearch={value => this.handleTableSearch(value)}
          onChange={(e)=>{if(e.target.value){this.handleTableSearch(e.target.value)}}}
          style={{width: '220px'}}
          allowClear
        />
      ]
    };

    return (
      <HeadBreadcrumb
        className={"allocation-page"}
        style={{overflow: "hidden"}}
      >
        <Row gutter={rowGutter} style={{height: "100%"}}>
          {/*左边的树状控件*/}
          <Col span={8} style={{height: "100%"}}>
            <DetailCard
              title={seiIntl.get({key: 'flow_000126', desc: '组织机构'})}
              style={{height: "100%"}}
            >
              <StandardTree
                onSelect={this.onTreeSelect}
                dadaSource={this.state.treeData ? this.state.treeData : []}/>
            </DetailCard>
          </Col>
          {/*右边的表格控件*/}
          <Col span={16} style={{height: "100%"}}>
            <DetailCard
              title={this.state.pathName}
              className={"child-card"}
              style={{height: "100%"}}
            >
              <div className={'tbar-box'}>
                <div className={'tbar-btn-box'}>{button()}</div>
                <div className={'tbar-search-box'}>{search()}</div>
              </div>
              <SimpleTable
                data={this.state.tableData}
                columns={columns}
                loading={this.state.loading}
                onSelectRow={this.onTableSelectRow}
                rowsSelected={this.state.tableSelectRow}
                pageChange={this.pageChange}
              />
            </DetailCard>
          </Col>
          {this.state.defVersionVisible && <DefinationVersionModal
            selectedNode={selectedNode ? selectedNode : {}}
            handleCancel={this.handleModalCancel}
            modalVisible={this.state.defVersionVisible}
            flowDefinationId={editData ? editData.id : ""}/>}
          {/*{definationModalVisible &&<DefinaionModal*/}
          {/*operator={operator}*/}
          {/*handleCancel={this.handleDefinationModalCancel}*/}
          {/*modalVisible={definationModalVisible}*/}
          {/*selectedNode={selectedNode ? selectedNode : {}}*/}
          {/*editData={editData ? editData : {}}*/}
          {/*flowDefinationId={editData ? editData.id : ""}*/}
          {/*/>}*/}
        </Row>
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
)(FlowDefinationView)
