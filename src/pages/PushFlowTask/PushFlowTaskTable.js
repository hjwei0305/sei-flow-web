/**
 * <p/>
 * 实现功能：推送任务管理
 * <p/>
 *
 * @author 何灿坤
 */
import React, {Component} from 'react'
import {connect} from 'dva'
import {Modal, Input, Button, Tooltip} from 'antd';
import {message} from 'suid';
import SimpleTable from "@/components/SimpleTable";
import {getPushTaskControl, pushAgainByControlId, cleaningPushHistoryData} from "./PushFlowTaskService";
import SearchTable from "@/components/SearchTable";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import ResetPushFlowTaskModal from "./ResetPushFlowTaskModal";
import {seiLocale} from 'sei-utils';
import {allflowTypeConfig} from '@/utils/CommonComponentsConfig';


const {seiIntl} = seiLocale;
const confirm = Modal.confirm
const Search = Input.Search;

class FlowInstanceTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectedRows: [],
      historyKey: "",
      pageInfo: null,
      searchValue: "",
      changeValue: "",
      flowType: null,
      flowTypeId: "",
      modalVisible: false,
      confirmLoading: false,
    };
  }

  componentWillMount() {
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

  getDataSource = (params = {}) => {
    this.toggoleGlobalLoading(true);
    if (!params.filters) {
      let filter = [];
      //筛选字段（业务单号）
      if (this.state.changeValue) {
        filter.push({
          fieldName: "businessCode",//筛选字段（流程类型）
          operator: "EQ",//操作类型
          value: this.state.changeValue,//筛选值
          fieldType: "String"//筛选类型
        });
      }else{
        //筛选字段（流程类型）
        if (this.state.flowTypeId) {
          filter.push({
            fieldName: "flowTypeId",//筛选字段（流程类型）
            operator: "EQ",//操作类型
            value: this.state.flowTypeId,//筛选值
            fieldType: "String"//筛选类型
          });
        }else{
          message.error(seiIntl.get({key: 'flow_000217', desc: '请选择流程类型!'}));
          this.toggoleGlobalLoading(false);
          return;
        }
      }

      Object.assign(params, {filters: filter});
    }
    getPushTaskControl(params).then(data => {
      this.setState({data, selectedRows: [], searchValue: this.state.searchValue});
    }).catch(e => {
    }).finally(() => {
      this.toggoleGlobalLoading(false);
    })
  };

  handleRowSelectChange = (selectedRows) => {
    this.setState({selectedRows})
  };
  handleSearch = (value) => {
    this.setState({searchValue: value});
    this.getDataSource();
  };
  changeSearch = (e) => {
    this.setState({changeValue: e.target.value});
  };
  pushAgain = (record) => {
    let thiz = this;
    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: seiIntl.get({key: 'flow_000073', desc: '您确定要重新推送当前任务吗？'}),
      onOk: () => {
        thiz.toggoleGlobalLoading(true);
        pushAgainByControlId(record.id).then(res => {
          if (res.status === 'SUCCESS') {
            message.success(seiIntl.get({key: 'flow_000074', desc: '推送成功'}));
            thiz.getDataSource();
          } else {
            message.error(res.message);
          }
        }).catch(e => {
        }).finally(() => {
          thiz.toggoleGlobalLoading(false);
        });
      }
    });
  };

  selectChangeFlowType = (record) => {
    if (record && record.id) {
      this.setState({flowType: record, flowTypeId: record.id});
    } else {
      this.setState({flowType: null, flowTypeId: ""});
    }
  };
  pageChange = (pageInfo) => {
    this.setState({
      pageInfo: pageInfo,
    });
    this.getDataSource({ pageInfo})
  };

  queryClick = () => {
    this.getDataSource({ pageInfo: this.state.pageInfo});
  };

  restClick = () => {
    this.setState({modalVisible: true})
  };

  handleSave = () => {
    this.ref.props.form.validateFieldsAndScroll((err, values) => {
      message.destroy();
      if (!err) {
        let params = {}
        Object.assign(params, values);
        if(params.flowTypeId === ""){
          message.error(seiIntl.get({key: 'flow_000217', desc: '请选择流程类型!'}));
          return;
        }
        this.setState({confirmLoading: true});
        cleaningPushHistoryData(params).then(result => {
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            this.getDataSource();
            this.setState({confirmLoading: false, modalVisible: false});
            //清空model数据
            this.ref.setStateNull();
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
            this.setState({confirmLoading: false});
          }
        }).catch(e => {
          this.setState({confirmLoading: false});
        })
      }
    });
  };

  handleModalCancel = () => {
    //清空model数据
    this.ref.setStateNull();
    this.setState({modalVisible: false})
  };

  onRef = (ref) => {
    this.ref = ref
  };


  render() {
    const columns = [
      {
        title: seiIntl.get({key: 'flow_000030', desc: '操作'}),
        width: 100,
        dataIndex: "operator",
        render: (text, record, index) => {
          return (
            <div className={'row-operator'} key={"operator" + index} onClick={(e) => {
              e.stopPropagation()
            }}>
              <a className={'row-operator-item'} key={"end" + index}
                 onClick={() => this.pushAgain(record)}>{seiIntl.get({key: 'flow_000075', desc: '重新推送'})}</a>
            </div>
          )
        }
      },
      {
        title: seiIntl.get({key: 'flow_000048', desc: '任务名称'}),
        dataIndex: 'flowTaskName',
        width: 180
      },
      {
        title: seiIntl.get({key: 'flow_000132', desc: '业务单号'}),
        dataIndex: 'businessCode',
        width: 180
      },
      {
        title: seiIntl.get({key: 'flow_000079', desc: '推送状态'}),
        dataIndex: 'pushStatus',
        width: 120,
        render: (text, record) => {
          if (record.pushStatus == "init") {   //推送业务模块状态
            return seiIntl.get({key: 'flow_000080', desc: '待办'})
          } else if (record.pushStatus == "completed") {  //推送业务模块状态
            return seiIntl.get({key: 'flow_000081', desc: '已办'})
          } else if (record.pushStatus == "delete") { //推送业务模块状态
            return seiIntl.get({key: 'flow_000084', desc: '删除待办'})
          } else if (record.pushStatus == "new") {  //推送basic状态
            return seiIntl.get({key: 'flow_000082', desc: '新增待办'})
          } else if (record.pushStatus == "old") {  //推送basic状态
            return seiIntl.get({key: 'flow_000083', desc: '待办转已办'})
          } else if (record.pushStatus == "del") {  //推送basic状态
            return seiIntl.get({key: 'flow_000084', desc: '删除待办'})
          } else if (record.pushStatus == "end") {  //推送basic状态
            return seiIntl.get({key: 'flow_000085', desc: '归档（终止）'})
          } else {
            return "";
          }
        }
      },
      {
        title: seiIntl.get({key: 'flow_000050', desc: '执行人名称'}),
        dataIndex: 'executorNameList',
        width: 220
      },
      {
        title: seiIntl.get({key: 'flow_000086', desc: '推送总次数'}),
        dataIndex: 'pushNumber',
        width: 80
      },
      {
        title: seiIntl.get({key: 'flow_000087', desc: '成功次数'}),
        dataIndex: 'pushSuccess',
        width: 80
      }, {
        title: seiIntl.get({key: 'flow_000088', desc: '失败次数'}),
        dataIndex: 'pushFalse',
        width: 80
      },
      {
        title: seiIntl.get({key: 'flow_000047', desc: '流程名称'}),
        dataIndex: 'flowInstanceName',
        width: 180
      }, {
        title: seiIntl.get({key: 'flow_000089', desc: '第一次推送时间'}),
        dataIndex: 'pushStartDate',
        width: 180
      }, {
        title: seiIntl.get({key: 'flow_000090', desc: '最后推送时间'}),
        dataIndex: 'pushEndDate',
        width: 180
      }
    ];

    const title = () => {
      return [
        <span key={"selectFlowType"} className={"primaryButton"}>{seiIntl.get({key: 'flow_000055', desc: '流程类型：'})}
          <SearchTable
            title={seiIntl.get({key: 'flow_000056', desc: '流程类型'})}
            key="searchFlowType"
            initValue={false}
            isNotFormItem={true}
            config={allflowTypeConfig}
            style={{width: 300}}
            selectChange={this.selectChangeFlowType}/></span>,
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Tooltip key="tooltip" title={seiIntl.get({key: 'flow_000309', desc: '完整的业务单号'})}>
          <Search
            key="search"
            placeholder={seiIntl.get({key: 'flow_000310', desc: '请输入完整的业务单号'})}
            onChange={this.changeSearch}
            onSearch={value => this.handleSearch(value)}
            style={{width: 220}}
            allowClear
          />
        </Tooltip>,
        <Button type={"primary"} style={{"marginLeft": "10px"}} className={"primaryButton"} key="query"
                onClick={this.queryClick}>{seiIntl.get({key: 'flow_000250', desc: '查询'})}</Button>
        , <Button type="danger" icon="rest" key="rest" onClick={this.restClick}/>
      ]
    };
    const {data, selectedRows, modalVisible, confirmLoading, flowTypeId} = this.state;
    return (
      <HeadBreadcrumb>
        <div className={"tbar-table"}>
          <div className={'tbar-box'}>
            <div className={'tbar-btn-box'}>{title()}</div>
            <div className={'tbar-search-box'}>{search()}</div>
          </div>
          <SimpleTable
            rowsSelected={selectedRows}
            onSelectRow={this.handleRowSelectChange}
            data={data}
            columns={columns}
            pageChange={this.pageChange}
          />
        </div>
        <ResetPushFlowTaskModal
          modalVisible={modalVisible}
          confirmLoading={confirmLoading}
          handleOk={this.handleSave}
          handleCancel={this.handleModalCancel}
          onRef={this.onRef}
          defaultValue={{flowTypeId: flowTypeId}}
        />
      </HeadBreadcrumb>

    )
  }
}

const mapStateToProps = ({}) => {
  return {};
};


export default connect(
  mapStateToProps,
)(FlowInstanceTable)



