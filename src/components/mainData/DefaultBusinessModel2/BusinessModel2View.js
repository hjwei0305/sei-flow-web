/**
 * @description 采购单据
 * @author 何灿坤
 */
import {Component} from "react";
import React from "react";
import {Button, Col, Row, Modal, message} from "antd";
import {Input} from "antd/lib/index";
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import connect from "react-redux/es/connect/connect";
import { StartFlow ,ApproveHistory} from 'seid';
import {listBusinessModel2, deleteBusinessModel2, listAllOrgs, saveBusinessModel} from "./BusinessModel2Service";
import EditBusinessModel2 from "./BusinessModel2Model";
import StandardTree from "../../../commons/components/StandardTree";
import DetailCard from "../../../commons/components/DetailCard";
import HeadBreadcrumb from "../../../commons/components/breadcrumb/HeadBreadcrumb";
import {defaultPageSize, rowGutter} from "../../../configs/DefaultConfig";
import StandardDropdown from "../../../commons/components/StandardDropdown";
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;

const Search = Input.Search;
const confirm = Modal.confirm;

class BusinessModel2View extends Component {
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
      isAdd: false,
      operator: "add",
      pathName: seiIntl.get({key: 'flow_000129', desc: '采购订单管理'}),
      historyKey:""
    }
  }

  componentWillMount() {
    this.getTreeData()
  };

  onRef = (ref) => {
    this.ref = ref
  };

  //组织机构树
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

  //树节点选择触发
  onTreeSelect = (selectedKeys, selectedNodes) => {
    this.setState({treeSelectedKeys: selectedKeys});
    this.setState({selectedNode: selectedNodes[0] ? selectedNodes[0] : {}});
    if (selectedNodes[0]) {
      let params = {
        Q_EQ_orgId: selectedNodes[0] ? selectedNodes[0].id : "",
        pageInfo: {page: 1, rows: defaultPageSize}
      };
      this.listModel2(params);
      this.setState({
        pathName: selectedNodes[0].name ? selectedNodes[0].name : seiIntl.get({key: 'flow_000129', desc: '采购订单管理'})
      });
    }
  };

  //请求采购订单table
  listModel2 = (param) => {
    this.setState({loading: true});
    listBusinessModel2(param).then((result) => {
      this.setState({
        tableData: result, tableSelectRow: []
      });
    }).catch(err => {
    }).finally(() => {
      this.setState({loading: false});
    });
  };

  handleTableSearch = (quickValue) => {
    //刷新本地数据
    let params = {
      Q_EQ_orgId: this.state.selectedNode.id,
      quickValue,
      pageInfo: this.state.pageInfo
    };
    this.listModel2(params);
  };


  getPageData = () =>{
    //刷新本地数据
    let params = {
      Q_EQ_orgId: this.state.selectedNode.id,
      quickValue: this.state.tableSearchValue,
      pageInfo: this.state.pageInfo
    };
    this.listModel2(params);
  }

  handleSave = () => {
    this.ref.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let params = {}
        Object.assign(params, values);
        if (this.state.isAdd)
          delete params.id;//新增时id==="",保存可能会出错，需删除id
        this.setState({loading: true});
        saveBusinessModel(params).then(result => {
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            let params = {
              Q_EQ_orgId: this.state.selectedNode.id,
              quickValue: this.state.tableSearchValue,
              pageInfo: this.state.pageInfo
            };
            this.listModel2(params);
            this.setState({loading: false, modalVisible: false});
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
            this.setState({loading: false});
          }
        }).catch(e => {
          this.setState({loading: false});
        })
      }
    })
  };


  onAddClick = () => {
    if (this.state.selectedNode && JSON.stringify(this.state.selectedNode) !== "{}") {
      this.handleModalVisible(true, true, this.state.selectedNode.name);
    } else {
      message.error(seiIntl.get({key: 'flow_000113', desc: '请选择组织机构'}))
    }
  };

  onEditClick = (record) => {
    if (this.state.selectedNode && JSON.stringify(this.state.selectedNode) !== "{}") {
      this.setState({editData: record});
      this.handleModalVisible(true, false, this.state.selectedNode.name);
    } else {
      message.error(seiIntl.get({key: 'flow_000113', desc: '请选择组织机构'}));
    }
  };

  onHistroy = (record) => {
    this.setState({historyKey:record.id});
  };

  setHistoryKey=(id)=>{
    this.setState({historyKey:id});
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
        deleteBusinessModel2(id).then(result => {
          if (result.status === 'SUCCESS') {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            let params = {
              Q_EQ_orgId: thiz.state.selectedNode.id,
              quickValue: thiz.state.tableSearchValue,
              pageInfo: thiz.state.pageInfo
            };
            thiz.listModel2(params);
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
  handleModalVisible = (modalVisible, isAdd, pathName) => {
    this.setState({modalVisible, isAdd, pathName});
  };
  handleModalCancel = () => {
    this.handleModalVisible(false, false, this.state.pathName);
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
    this.listModel2(params);
  }

  render() {
    const columns = [
      {
        title: seiIntl.get({key: 'flow_000030', desc: '操作'}),
        width: 160,
        dataIndex: "operator",
        render: (text, record, index) => {
          let ops = () => {
            let ops = [];
            if ("INIT" == record.flowStatus) {
              ops.push(<a className={'row-operator-item'} key={"edit" + index} onClick={() => this.onEditClick(record)}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</a>);
              ops.push(<a className={'row-operator-item'} key={"delete" + index} onClick={() => this.onDeleteClick(record)}>{seiIntl.get({key: 'flow_000032', desc: '删除'})}</a>);
              ops.push(<StartFlow businessKey={record.id} linkStyle style={{marginRight: 8}} name={seiIntl.get({key: 'flow_000130', desc: '提交审批'})} callBack={this.getPageData}
                                  businessModelCode={'com.ecmp.flow.entity.DefaultBusinessModel2'}/>);
            }
            if ("INPROCESS" == record.flowStatus || "COMPLETED" == record.flowStatus) {
              ops.push(<a className={'row-operator-item'} key={"history" + index}
                          onClick={() => this.onHistroy(record)}>{seiIntl.get({key: 'flow_000131', desc: '流程历史'})}</a>);
            }
            return ops;
          }

          return (
            <div className={'row-operator'} key={"operator" + index} onClick={(e) => {
              e.stopPropagation()
            }}>
              <StandardDropdown operator={ops()}/>
            </div>
          )
        }
      },
      {
        title: seiIntl.get({key: 'flow_000132', desc: '业务单号'}),
        dataIndex: "businessCode",
        width: 120
      },
      {
        title: seiIntl.get({key: 'flow_000133', desc: '业务名称'}),
        dataIndex: 'name',
        width: 120
      },
      {
        title: seiIntl.get({key: 'flow_000134', desc: '申请说明'}),
        dataIndex: 'applyCaption',
        width: 120
      },
      {
        title: seiIntl.get({key: 'flow_000135', desc: '当前流程状态'}),
        dataIndex: 'flowStatus',
        width: 120,
        render(text, record) {
          if ('INIT' == text) {
            return seiIntl.get({key: 'flow_000136', desc: '未启动'});
          } else if ('INPROCESS' === text) {
            return seiIntl.get({key: 'flow_000110', desc: '处理中'});
          } else if ('COMPLETED' === text) {
            return seiIntl.get({key: 'flow_000137', desc: '流程结束'});
          }
          return "";
        }
      },
      {
        title: seiIntl.get({key: 'flow_000138', desc: '单价'}),
        dataIndex: 'unitPrice',
        width: 100
      },
      {
        title: seiIntl.get({key: 'flow_000139', desc: '数量'}),
        dataIndex: 'count',
        width: 100
      },
      {
        title: seiIntl.get({key: 'flow_000140', desc: '金额'}),
        dataIndex: 'sum',
        width: 100
      },
      {
        title: seiIntl.get({key: 'flow_000105', desc: '工作说明'}),
        dataIndex: 'workCaption',
        width: 120
      }
    ];

    const {loading, isAdd, modalVisible, editData, selectedNode = {}} = this.state;

    const button = () => {
      return [
        <Button key="addRule" className={"primaryButton"} type={"primary"} onClick={this.onAddClick}>{seiIntl.get({key: 'flow_000039', desc: '新增'})}</Button>
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Search
          key="search"
          placeholder={seiIntl.get({key: 'flow_000057', desc: '输入代码或名称查询'})}
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
          <EditBusinessModel2
            isAdd={isAdd}
            modalVisible={modalVisible}
            orgInfo={selectedNode}
            confirmLoading={loading}
            handleOk={this.handleSave}
            handleCancel={this.handleModalCancel}
            onRef={this.onRef}
            defaultValue={editData ? editData : {}}/>
        </Row>
        <ApproveHistory historyKey={this.state.historyKey} setHistoryKey={this.setHistoryKey}/>
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
)(BusinessModel2View)
