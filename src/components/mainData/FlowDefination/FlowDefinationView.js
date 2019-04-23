/**
 * @description 流程定义
 * @author 李艳
 */
import {Component} from "react";
import React from "react";
import {Button, Col, Row, Modal, message} from "antd";
import {Input} from "antd/lib/index";
import {searchListByKeyWithTag} from "../../../commons/utils/CommonUtils";
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
import {defaultPageSize, rowGutter} from "../../../configs/DefaultConfig";
import StandardDropdown from "../../../commons/components/StandardDropdown";
import DefinaionModal from "./DefinaionModal";

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
      pathName: "流程定义管理",
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
      let params = {Q_EQ_orgId: selectedNodes[0] ? selectedNodes[0].id : "",pageInfo:{page:1,rows:defaultPageSize}};
      this.listFlowDefination(params);
      this.setState({pathName: selectedNodes[0].name ? selectedNodes[0].name : '岗位'});
    }
  };

  handleTableSearch = (quickValue) => {
    //刷新本地数据
    let params = {
      Q_EQ_orgId: this.state.selectedNode.id,
      quickValue,
      pageInfo:this.state.pageInfo
    };
    this.listFlowDefination(params);
  };
  onAddClick = () => {
    if (this.state.selectedNode && JSON.stringify(this.state.selectedNode) !== "{}") {
      this.handleModalVisible(false, false, true);
      this.setState({operator: "add"})
    } else {
      message.error('请选择组织机构')
    }

  };
  onRefAddClick = () => {
    if (!this.judgeSelected()) return;
    this.setState({editData: this.state.tableSelectRow[0]});
    this.handleModalVisible(false, false, true);
    this.setState({operator: "refAdd"})
  };
  onEditClick = (record) => {
    this.setState({editData: record});
    this.handleModalVisible(false, false, true);
    this.setState({operator: "edit"})
  };
  onResetClick = () => {
    if (!this.judgeSelected()) return;
    let thiz = this;
    confirm({
      title: "温馨提示",
      content:"您确定要重置流程图位置吗？",
      onOk() {
        let id = thiz.state.tableSelectRow[0].id;
        thiz.setState({loading: true});
        getFlowDefVersion(id).then(result => {
          if (result.success) {
            message.success(result.message ? result.message : "请求成功");
            //刷新本地数据
            let params = {
              Q_EQ_orgId: thiz.state.selectedNode.id,
              quickValue: thiz.state.tableSearchValue,
              pageInfo: thiz.state.pageInfo
            };
            thiz.listFlowDefination(params);
          } else {
            message.error(result.message ? result.message : "请求失败");
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
        title = '您确定要冻结吗？'
      } else if (record.flowDefinationStatus === 'Freeze') {
        status = 'Activate';
        title = '您确定要激活吗？'
      }
    }
    let thiz = this;
    confirm({
      content: title,
      title: "温馨提示",
      onOk() {
        thiz.setState({loading: true});
        activateOrFreezeFlowDef(id, status).then(result => {
          if (result.status === 'SUCCESS') {
            message.success(result.message ? result.message : "请求成功");
            //刷新本地数据
            let params = {
              Q_EQ_orgId: thiz.state.selectedNode.id,
              quickValue: thiz.state.tableSearchValue,
              pageInfo: thiz.state.pageInfo
            };
            thiz.listFlowDefination(params);
          } else {
            message.error(result.message ? result.message : "请求失败");
          }
        }).catch(e => {
        }).finally(() => {
          thiz.setState({loading: false});
        })
      }
    });


  };
  onVersionClick = (record) => {
    this.setState({editData: record});
    this.handleModalVisible(false, true)
  };

  onDeleteClick = (record) => {
    this.setState({editData: record});
    let thiz = this;
    confirm({
      content:"数据将丢失，确定要删除吗？",
      title: "温馨提示",
      onOk() {
        let id = record.id;
        thiz.setState({loading: true});
        deleteFlowDefination(id).then(result => {
          if (result.status === 'SUCCESS') {
            message.success("请求成功");
            //刷新本地数据
            let params = {
              Q_EQ_orgId: thiz.state.selectedNode.id,
              quickValue: thiz.state.tableSearchValue,
              pageInfo: thiz.state.pageInfo
            };
            thiz.listFlowDefination(params);
          } else {
            message.error(result.message ? result.message : "请求失败");
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
      message.error('请选择一行数据！');
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
    const {selectedNode,tableSearchValue,pageInfo}=this.state;
    let params = {
      Q_EQ_orgId: selectedNode.id,
      quickValue:tableSearchValue,
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
        title: "操作",
        width: 180,
        dataIndex: "operator",
        render: (text, record, index) => {
          let ops = () => {
            let ops = [];
            ops.push(<a className={'row-operator-item'} key={"edit" + index}
                        onClick={() => this.onEditClick(record)}>编辑</a>);
            ops.push(<a className={'row-operator-item'} key={"deleteDef" + index}
                        onClick={() => this.onDeleteClick(record)}>删除</a>);
            ops.push(<a className={'row-operator-item'} key={"versionDef" + index}
                        onClick={() => this.onVersionClick(record)}>流程定义版本管理</a>);
            let statusText = '';
            if (record && record.flowDefinationStatus !== "INIT") {
              if (record.flowDefinationStatus === 'Activate') {
                statusText = '冻结'
              } else if (record.flowDefinationStatus === 'Freeze') {
                statusText = '激活'
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
        title: '名称',
        dataIndex: 'name',
        width: 200
      },
      {
        title: '定义KEY',
        dataIndex: 'defKey',
        width: 200
      },
      {
        title: '流程类型',
        dataIndex: 'flowType.name',
        width: 200
      },
      {
        title: '流程定义状态',
        dataIndex: 'flowDefinationStatus',
        width: 120,
        render(text, record) {
          if ('INIT' === text) {
            return '未发布';
          } else if ('Activate' === text) {
            return '激活';
          }
          else if ('Freeze' === text) {
            return '冻结';
          }
          return "";
        }
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        width: 120
      }
    ];
    const {tableSelectRow, operator, editData, definationModalVisible, selectedNode} = this.state;
    const title = () => {
      return [
        <Button key="addRule"  className={"primaryButton"} type={"primary"}
                      onClick={this.onAddClick}>新增</Button>,
        <Button.Group key={"ButtonGroup"} className={"primaryButton"}>
          <Button key="refEdit"
                  onClick={this.onRefAddClick}>参考创建</Button>
          <Button key="reset"
                  onClick={this.onResetClick}>位置重置</Button>
        </Button.Group>

      ]
    };
    //表头搜索框
    const search = () => {
      return [
        <Search
          key="search"
          placeholder="输入代码或名称查询"
          onSearch={value => this.handleTableSearch(value)}
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
              title="组织机构"
              style={{height: "100%"}}
            >
              <StandardTree
                onSelect={this.onTreeSelect}
                dadaSource={this.state.treeData?this.state.treeData:[]}/>
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
                <div className={'tbar-btn-box'}>{title()}</div>
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
          {definationModalVisible && <DefinaionModal
            operator={operator}
            handleCancel={this.handleDefinationModalCancel}
            modalVisible={definationModalVisible}
            selectedNode={selectedNode ? selectedNode : {}}
            editData={editData ? editData : {}}
            flowDefinationId={editData ? editData.id : ""}
          />}
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
