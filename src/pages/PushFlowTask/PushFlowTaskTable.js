/**
 * <p/>
 * 实现功能：推送任务管理
 * <p/>
 *
 * @author 何灿坤
 */
import React, {Component} from 'react'
import {connect} from 'dva'
import {Modal, Input, Checkbox, Button} from 'antd';
import {message} from 'suid';
import SimpleTable from "@/components/SimpleTable";
import {getPushTaskControl, pushAgainByControlId} from "./PushFlowTaskService";
import SearchTable from "@/components/SearchTable";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import {seiLocale} from 'sei-utils';
import {
  appModuleAuthConfig,
  businessModelByAppModelConfig,
  flowTypeByBusinessModelConfig
} from '@/utils/CommonComponentsConfig';


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
      appModule: null,
      appModuleId: "",
      businessModel: null,
      businessModelId: "",
      flowType: null,
      flowTypeId: ""
      // , checkInBasic: true
    };
  }

  componentWillMount() {
    // this.getDataSource()
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
      //筛选字段(应用模块)
      if (this.state.appModuleId) {
        filter.push({
          fieldName: "appModuleId",//筛选字段(应用模块)
          operator: "EQ",//操作类型
          value: this.state.appModuleId,//筛选值
          fieldType: "String"//筛选类型
        });
      }
      //筛选字段（业务实体）
      if (this.state.businessModelId) {
        filter.push({
          fieldName: "businessModelId",//筛选字段（业务实体）
          operator: "EQ",//操作类型
          value: this.state.businessModelId,//筛选值
          fieldType: "String"//筛选类型
        });
      }
      //筛选字段（流程类型）
      if (this.state.flowTypeId) {
        filter.push({
          fieldName: "flowTypeId",//筛选字段（流程类型）
          operator: "EQ",//操作类型
          value: this.state.flowTypeId,//筛选值
          fieldType: "String"//筛选类型
        });
      }
      // filter.push({
      //   fieldName: "pushType",
      //   operator: "EQ",//操作类型
      //   value: this.state.checkInBasic ? "basic" : "business",//筛选值
      //   fieldType: "String"//筛选类型
      // });
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
    this.getDataSource({quickSearchValue: value});
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

  selectChangeAppModel = (record) => {
    if (record && record.id) {
      this.setState({appModule: record, appModuleId: record.id, businessModel: null, businessModelId: ""});
    } else {
      this.setState({
        appModule: null,
        appModuleId: "",
        businessModel: null,
        businessModelId: "",
        flowType: null,
        flowTypeId: ""
      });
    }
  };
  selectChangeBusinessModel = (record) => {
    if (record && record.id) {
      this.setState({businessModel: record, businessModelId: record.id});
    } else {
      this.setState({businessModel: null, businessModelId: "", flowType: null, flowTypeId: ""});
    }
  };
  selectChangeFlowType = (record) => {
    if (record && record.id) {
      this.setState({flowType: record, flowTypeId: record.id});
    } else {
      this.setState({flowType: null, flowTypeId: ""});
    }
  };
  // checkChangeInBasic = (checkInfo) => {
  //   this.setState({checkInBasic: checkInfo.target.checked});
  //   this.getDataSource();
  // };
  pageChange = (pageInfo) => {
    this.setState({
      pageInfo: pageInfo,
    });
    this.getDataSource({quickSearchValue: this.state.changeValue, pageInfo})
  };

  queryClick = () => {
    this.getDataSource({quickSearchValue: this.state.changeValue, pageInfo : this.state.pageInfo});
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
        title: seiIntl.get({key: 'flow_000076', desc: '业务编号'}),
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
      // {
      //   title: seiIntl.get({key: 'flow_000077', desc: '推送类型'}),
      //   dataIndex: 'pushType',
      //   width: 80,
      //   render: (text, record) => {
      //     if (record.pushType == "business") {   //推送到业务实体
      //       return seiIntl.get({key: 'flow_000078', desc: '业务模块'})
      //     } else if (record.pushType == "basic") {  //推送到basic
      //       return "BASIC"
      //     } else {
      //       return "";
      //     }
      //   }
      // },
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
        <span key={"selectAppModel"} className={"primaryButton"}>{seiIntl.get({key: 'flow_000038', desc: '应用模块：'})}
          <SearchTable
            title={seiIntl.get({key: 'flow_000041', desc: '应用模块'})}
            key="searchAppModelTable"
            initValue={true}
            isNotFormItem={true} config={appModuleAuthConfig}
            style={{width: 150}}
            selectChange={this.selectChangeAppModel}/></span>,
        <span key={"selectBusinessModel"} className={"primaryButton"}>{seiIntl.get({key: 'flow_000053', desc: '业务实体：'})}
          <SearchTable
            title={seiIntl.get({key: 'flow_000054', desc: '业务实体'})}
            key="searchBusinessModelTable"
            initValue={false}
            isNotFormItem={true} params={{"appModuleId": this.state.appModuleId}}
            config={businessModelByAppModelConfig}
            style={{width: 150}}
            selectChange={this.selectChangeBusinessModel}/></span>,
        <span key={"selectFlowType"} className={"primaryButton"}>{seiIntl.get({key: 'flow_000055', desc: '流程类型：'})}
          <SearchTable
            title={seiIntl.get({key: 'flow_000056', desc: '流程类型'})}
            key="searchFlowType"
            initValue={false}
            isNotFormItem={true} params={{"businessModelId": this.state.businessModelId}}
            config={flowTypeByBusinessModelConfig}
            style={{width: 150}}
            selectChange={this.selectChangeFlowType}/></span>,
        // <span key={"checkInBasic"} className={"primaryButton"}> BASIC/{seiIntl.get({key: 'flow_000091', desc: '业务模块：'})}
        //   <Checkbox defaultChecked={true} onChange={this.checkChangeInBasic}/></span>
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Search
          key="search"
          placeholder={seiIntl.get({key: 'flow_000057', desc: '输入代码或名称查询'})}
          onChange={this.changeSearch}
          onSearch={value => this.handleSearch(value)}
          style={{width: 220}}
          allowClear
        />,
        <Button type={"primary"}  style={{ "margin-left":"10px"}} className={"primaryButton"}  key="query" onClick={this.queryClick}>{seiIntl.get({key: 'flow_000250', desc: '查询'})}</Button>
      ]
    };
    const {data, selectedRows} = this.state;
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



