/**
 * <p/>
 * 实现功能：推送任务管理
 * <p/>
 *
 * @author 何灿坤
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Modal, message, Input, Checkbox} from 'antd';
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import {getPushTaskControl, pushAgainByControlId} from "./PushFlowTaskService";
import {
  appModuleAuthConfig,
  businessModelByAppModelConfig,
  flowTypeByBusinessModelConfig
} from "../../../configs/CommonComponentsConfig";
import SearchTable from "../../../commons/components/SearchTable";
import HeadBreadcrumb from "../../../commons/components/breadcrumb/HeadBreadcrumb";

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
      appModule: null,
      appModuleId: "",
      businessModel: null,
      businessModelId: "",
      flowType: null,
      flowTypeId: "",
      checkInBasic: false
    };
  }

  componentWillMount() {
    // this.getDataSource()
  }

  getDataSource = (params = {}) => {
    this.props.show();
    if (!params.filters) {
      Object.assign(params, {
        filters: [{
          fieldName: "appModuleId",//筛选字段(应用模块)
          operator: "EQ",//操作类型
          value: this.state.appModuleId,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "businessModelId",//筛选字段（业务实体）
          operator: "EQ",//操作类型
          value: this.state.businessModelId,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "flowTypeId",//筛选字段（流程类型）
          operator: "EQ",//操作类型
          value: this.state.flowTypeId,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "pushType",
          operator: "EQ",//操作类型
          value: this.state.checkInBasic == false ? "basic" : "",//筛选值
          fieldType: "String"//筛选类型
        }]
      })
    }
    getPushTaskControl(params).then(data => {
      this.setState({data, selectedRows: [], searchValue: this.state.searchValue});
    }).catch(e => {
    }).finally(() => {
      this.props.hide();
    })
  };

  handleRowSelectChange = (selectedRows) => {
    this.setState({selectedRows})
  };
  handleSearch = (value) => {
    this.setState({searchValue: value});
    this.getDataSource({quickSearchValue: value});
  };
  pushAgain = (record) => {
    let thiz = this;
    confirm({
      title: '温馨提示',
      content: `您确定要重新推送当前任务吗？`,
      onOk: () => {
        thiz.props.show();
        pushAgainByControlId(record.id).then(res => {
          if (res.status === 'SUCCESS') {
            message.success('推送成功');
            thiz.getDataSource();
          } else {
            message.error(res.message);
          }
        }).catch(e => {
        }).finally(() => {
          thiz.props.hide();
        });
      }
    });
  };
  selectChangeAppModel = (record) => {
    if (record && record.id) {
      this.setState({appModule: record, appModuleId: record.id, businessModel: null, businessModelId: ""});
      this.getDataSource({
        filters: [{
          fieldName: "appModuleId",//筛选字段(应用模块)
          operator: "EQ",//操作类型
          value: `${record.id}`,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "pushType",
          operator: "EQ",//操作类型
          value: this.state.checkInBasic == false ? "basic" : "",//筛选值
          fieldType: "String"//筛选类型
        }], quickSearchValue: this.state.searchValue
      });
    } else {
      this.setState({
        appModule: null,
        appModuleId: "",
        businessModel: null,
        businessModelId: "",
        flowType: null,
        flowTypeId: ""
      });
      this.getDataSource({
        filters: [{
          fieldName: "appModuleId",//筛选字段(应用模块)
          operator: "EQ",//操作类型
          value: "",//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "pushType",
          operator: "EQ",//操作类型
          value: this.state.checkInBasic == false ? "basic" : "",//筛选值
          fieldType: "String"//筛选类型
        }], quickSearchValue: this.state.searchValue
      });
    }
  };
  selectChangeBusinessModel = (record) => {
    if (record && record.id) {
      this.setState({businessModel: record, businessModelId: record.id});
      this.getDataSource({
        filters: [{
          fieldName: "appModuleId",//筛选字段(应用模块)
          operator: "EQ",//操作类型
          value: this.state.appModuleId,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "businessModelId",//筛选字段（业务实体）
          operator: "EQ",//操作类型
          value: `${record.id}`,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "pushType",
          operator: "EQ",//操作类型
          value: this.state.checkInBasic == false ? "basic" : "",//筛选值
          fieldType: "String"//筛选类型
        }], quickSearchValue: this.state.searchValue
      });
    } else {
      this.setState({businessModel: null, businessModelId: "", flowType: null, flowTypeId: ""});
      this.getDataSource({
        filters: [{
          fieldName: "appModuleId",//筛选字段(应用模块)
          operator: "EQ",//操作类型
          value: this.state.appModuleId,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "pushType",
          operator: "EQ",//操作类型
          value: this.state.checkInBasic == false ? "basic" : "",//筛选值
          fieldType: "String"//筛选类型
        }], quickSearchValue: this.state.searchValue
      });
    }
  };
  selectChangeFlowType = (record) => {
    if (record && record.id) {
      this.setState({flowType: record, flowTypeId: record.id});
      this.getDataSource({
        filters: [{
          fieldName: "appModuleId",//筛选字段(应用模块)
          operator: "EQ",//操作类型
          value: this.state.appModuleId,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "businessModelId",//筛选字段（业务实体）
          operator: "EQ",//操作类型
          value: this.state.businessModelId,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "flowTypeId",//筛选字段（流程类型）
          operator: "EQ",//操作类型
          value: `${record.id}`,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "pushType",
          operator: "EQ",//操作类型
          value: this.state.checkInBasic == false ? "basic" : "",//筛选值
          fieldType: "String"//筛选类型
        }], quickSearchValue: this.state.searchValue
      });
    } else {
      this.setState({flowType: null, flowTypeId: ""});
      this.getDataSource({
        filters: [{
          fieldName: "appModuleId",//筛选字段(应用模块)
          operator: "EQ",//操作类型
          value: this.state.appModuleId,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "businessModelId",//筛选字段（业务实体）
          operator: "EQ",//操作类型
          value: this.state.businessModelId,//筛选值
          fieldType: "String"//筛选类型
        }, {
          fieldName: "pushType",
          operator: "EQ",//操作类型
          value: this.state.checkInBasic == false ? "basic" : "",//筛选值
          fieldType: "String"//筛选类型
        }], quickSearchValue: this.state.searchValue
      });
    }
  };
  checkChangeInBasic = (checkInfo) => {
    this.setState({checkInBasic: !checkInfo.target.checked});
    this.getDataSource({
      filters: [{
        fieldName: "appModuleId",//筛选字段(应用模块)
        operator: "EQ",//操作类型
        value: this.state.appModuleId,//筛选值
        fieldType: "String"//筛选类型
      }, {
        fieldName: "businessModelId",//筛选字段（业务实体）
        operator: "EQ",//操作类型
        value: this.state.businessModelId,//筛选值
        fieldType: "String"//筛选类型
      }, {
        fieldName: "flowTypeId",//筛选字段（流程类型）
        operator: "EQ",//操作类型
        value: this.state.flowTypeId,//筛选值
        fieldType: "String"//筛选类型
      }, {
        fieldName: "pushType",
        operator: "EQ",//操作类型
        value: ((!checkInfo.target.checked) == false) ? "basic" : "",//筛选值
        fieldType: "String"//筛选类型
      }], quickSearchValue: this.state.searchValue
    });
  };
  pageChange = (pageInfo) => {
    this.setState({
      pageInfo: pageInfo,
    });
    this.getDataSource({quickSearchValue: this.state.searchValue, pageInfo})
  };

  render() {
    const columns = [
      {
        title: "操作",
        width: 120,
        dataIndex: "operator",
        render: (text, record, index) => {
          return (
            <div className={'row-operator'} key={"operator" + index} onClick={(e) => {
              e.stopPropagation()
            }}>
              <a className={'row-operator-item'} key={"end" + index} onClick={() => this.pushAgain(record)}>重新推送</a>
            </div>
          )
        }
      },
      {
        title: '流程名称',
        dataIndex: 'flowInstanceName',
        width: 200
      },
      {
        title: '任务名称',
        dataIndex: 'flowTaskName',
        width: 200
      },
      {
        title: '业务编号',
        dataIndex: 'businessCode',
        width: 150
      },
      {
        title: '推送类型',
        dataIndex: 'pushType',
        width: 120,
        render: (text, record) => {
          if (record.pushType == "business") {   //推送到业务实体
            return "业务模块"
          } else if (record.pushType == "basic") {  //推送到basic
            return "BASIC"
          } else {
            return "";
          }
        }
      },
      {
        title: '推送状态',
        dataIndex: 'pushStatus',
        width: 120,
        render: (text, record) => {
          if (record.pushStatus == "init") {   //推送业务模块状态
            return "待办"
          } else if (record.pushStatus == "completed") {  //推送业务模块状态
            return "已办"
          } else if (record.pushStatus == "new") {  //推送basic状态
            return "新增待办"
          } else if (record.pushStatus == "old") {  //推送basic状态
            return "待办转已办"
          } else if (record.pushStatus == "del") {  //推送basic状态
            return "删除待办"
          } else if (record.pushStatus == "end") {  //推送basic状态
            return "归档（终止）"
          } else {
            return "";
          }
        }
      },
      {
        title: '执行人名称',
        dataIndex: 'executorNameList',
        width: 360
      },
      {
        title: '推送总次数',
        dataIndex: 'pushNumber',
        width: 100
      },
      {
        title: '成功次数',
        dataIndex: 'pushSuccess',
        width: 100
      }, {
        title: '失败次数',
        dataIndex: 'pushFalse',
        width: 100
      }, {
        title: '第一次推送时间',
        dataIndex: 'pushStartDate',
        width: 180
      }, {
        title: '最后推送时间',
        dataIndex: 'pushEndDate',
        width: 180
      }
    ];

    const title = () => {
      return [
        <span key={"selectAppModel"} className={"primaryButton"}>应用模块：
                  <SearchTable
                    title={"应用模块"}
                    key="searchAppModelTable"
                    initValue={true}
                    isNotFormItem={true} config={appModuleAuthConfig}
                    style={{width: 180}}
                    selectChange={this.selectChangeAppModel}/></span>,
        <span key={"selectBusinessModel"} className={"primaryButton"}>业务实体：
                  <SearchTable
                    title={"业务实体"}
                    key="searchBusinessModelTable"
                    initValue={false}
                    isNotFormItem={true} params={{"appModuleId": this.state.appModuleId}}
                    config={businessModelByAppModelConfig}
                    style={{width: 180}}
                    selectChange={this.selectChangeBusinessModel}/></span>,
        <span key={"selectFlowType"} className={"primaryButton"}>流程类型：
                  <SearchTable
                    title={"流程类型"}
                    key="searchFlowType"
                    initValue={false}
                    isNotFormItem={true} params={{"businessModelId": this.state.businessModelId}}
                    config={flowTypeByBusinessModelConfig}
                    style={{width: 180}}
                    selectChange={this.selectChangeFlowType}/></span>,
        <span key={"checkInBasic"} className={"primaryButton"}> 推送BASIC：
                   <Checkbox defaultChecked={true} onChange={this.checkChangeInBasic}/></span>
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Search
          key="search"
          placeholder="输入代码或名称查询"
          onSearch={value => this.handleSearch(value)}
          style={{width: 220}}
          allowClear
        />
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
)(FlowInstanceTable)



