/**
 * <p/>
 * 实现功能：流程实例管理
 * <p/>
 *
 * @author 何灿坤
 */
import React, {Component} from 'react'
import {connect} from 'dva'
import {Modal, Input, Checkbox, Tooltip} from 'antd';
import {message} from 'suid';
import SimpleTable from "@/components/SimpleTable";
import {getFlowInstance, endForce, taskFailTheCompensation} from "./FlowInstanceService";
import {ApproveHistory, OptGroup} from 'seid';
import SearchTable from "@/components/SearchTable";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import {mainTabAction} from 'sei-utils';
import {seiLocale} from 'sei-utils';
import {
  appModuleAuthConfig,
  businessModelByAppModelConfig,
  flowTypeByBusinessModelConfig,
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
      quickSearchValue: "",
      appModule: null,
      appModuleId: "",
      businessModel: null,
      businessModelId: "",
      flowType: null,
      flowTypeId: "",
      checkInFlow: false
    };
  }

  componentWillMount() {
  }

  toggoleGlobalLoading = (loading) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'global/updateState',
      payload: {
        globalLoading: loading,
      }
    });
  }

  getDataSource = (params = {}) => {
    this.toggoleGlobalLoading(true);
    const {appModuleId, businessModelId, flowTypeId, checkInFlow, pageInfo, quickSearchValue} = this.state
    if (!params.filters) {
      let filterList = [];
      //应用模块
      if (appModuleId) {
        filterList.push({
          fieldName: "flowDefVersion.flowDefination.flowType.businessModel.appModule.id",
          operator: "EQ",
          value: appModuleId,
          fieldType: "String"
        });
      }
      //业务实体
      if (businessModelId) {
        filterList.push({
          fieldName: "flowDefVersion.flowDefination.flowType.businessModel.id",
          operator: "EQ",
          value: businessModelId,
          fieldType: "String"
        });
      }
      //流程类型
      if (flowTypeId) {
        filterList.push({
          fieldName: "flowDefVersion.flowDefination.flowType.id",
          operator: "EQ",
          value: flowTypeId,
          fieldType: "String"
        });
      }
      //是否流程中
      if (!checkInFlow) {
        filterList.push({
          fieldName: "ended",
          operator: "EQ",
          value: false,
          fieldType: "Boolean"
        });
      }

      Object.assign(params, {
        filters: filterList
      });
    }

    params = {pageInfo, quickSearchValue, ...params};
    getFlowInstance(params).then(data => {
      this.setState({data, selectedRows: []});
    }).catch(e => {
    }).finally(() => {
      this.toggoleGlobalLoading(false);
    })
  };

  handleRowSelectChange = (selectedRows) => {
    this.setState({selectedRows})
  };
  handleDetail = (data) => {
    let uri = data.flowDefVersion.flowDefination.flowType.lookUrl;
    if (!uri) {
      uri = data.flowDefVersion.flowDefination.flowType.businessModel.lookUrl;
    }
    let url = data.webBaseAddressAbsolute.replace(/\/$/g, '') + '/' + uri.replace(/^\//g, '');
    if (url.indexOf('?') === -1) {
      url = `${url}?id=${data.businessId}`
    } else {
      url = `${url}&id=${data.businessId}`
    }
    mainTabAction.tabOpen({id: data.businessId, name: seiIntl.get({key: 'flow_000098', desc: '查看表单'}), featureUrl: url})
  };
  handleSearch = (value) => {
    this.setState({quickSearchValue: value}, () => this.getDataSource());
  };

  handleHistory = (data) => {
    this.setState({historyKey: data.businessId});
  };
  setHistoryKey = (id) => {
    this.setState({historyKey: id})
  };
  handleEnd = (record) => {
    let thiz = this;
    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: seiIntl.get({key: 'flow_000099', desc: '您确定要强制终止【{0}】吗？'}, [record.businessCode]),
      onOk: () => {
        thiz.toggoleGlobalLoading(true);
        endForce(record.id).then(res => {
          if (res.status === 'SUCCESS') {
            message.success(seiIntl.get({key: 'flow_000101', desc: '流程终止成功'}));
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
  handleNewTask = (record) => {
    let thiz = this;
    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: seiIntl.get({key: 'flow_000313', desc: '待办补偿是一种待办生成失败后的补偿方式，你确定要执行吗？'}),
      onOk: () => {
        thiz.toggoleGlobalLoading(true);
        taskFailTheCompensation(record.id).then(res => {
          if (res.success === true) {
            message.success(seiIntl.get({key: 'flow_000314', desc: '补偿成功！'}));
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
      this.setState({
        appModule: record,
        appModuleId: record.id,
        businessModel: null,
        businessModelId: ""
      }, () => this.getDataSource());
    } else {
      this.setState({
        appModule: null,
        appModuleId: "",
        businessModel: null,
        businessModelId: "",
        flowType: null,
        flowTypeId: ""
      }, () => this.getDataSource());
    }
  };
  selectChangeBusinessModel = (record) => {
    if (record && record.id) {
      this.setState({businessModel: record, businessModelId: record.id}, () => this.getDataSource());
    } else {
      this.setState({
        businessModel: null,
        businessModelId: "",
        flowType: null,
        flowTypeId: ""
      }, () => this.getDataSource());
    }
  };
  selectChangeFlowType = (record) => {
    if (record && record.id) {
      this.setState({flowType: record, flowTypeId: record.id}, () => this.getDataSource());
    } else {
      this.setState({flowType: null, flowTypeId: ""}, () => this.getDataSource());
    }
  };
  checkChangeInFlow = (checkInfo) => {
    this.setState({checkInFlow: !checkInfo.target.checked}, () => this.getDataSource());
  };
  pageChange = (pageInfo) => {
    this.setState({pageInfo: {...pageInfo}}, () => this.getDataSource());
  };

  render() {
    const columns = [
      {
        title: seiIntl.get({key: 'flow_000030', desc: '操作'}),
        width: 120,
        dataIndex: "operator",
        render: (text, record, index) => {

          const optList = [{
            title: seiIntl.get({key: 'flow_000102', desc: '查看'}),
            onClick: () => this.handleDetail(record),
          }, {
            title: seiIntl.get({key: 'flow_000103', desc: '历史'}),
            onClick: () => this.handleHistory(record),
          }];

          if (!record.ended) {
            optList.push({
              title: seiIntl.get({key: 'flow_000104', desc: '强制终止'}),
              onClick: () => this.handleEnd(record),
            });
            optList.push({
              title: seiIntl.get({key: 'flow_000312', desc: '待办补偿'}),
              onClick: () => this.handleNewTask(record),
            });
          }
          return (<OptGroup optList={optList}/>)
        }
      },
      {
        title: seiIntl.get({key: 'flow_000047', desc: '流程名称'}),
        dataIndex: 'flowName',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000132', desc: '业务单号'}),
        dataIndex: 'businessCode',
        width: 180
      },
      {
        title: seiIntl.get({key: 'flow_000105', desc: '工作说明'}),
        dataIndex: 'businessModelRemark',
        width: 360
      },
      {
        title: seiIntl.get({key: 'flow_000322', desc: '流程发起人'}),
        dataIndex: 'creatorName',
        width: 200,
        render: (text, record, index) => {
          if (record) {
            const res = `${record.creatorName}【${record.creatorAccount}】`;
            return <span title={res}>{res}</span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'flow_000106', desc: '开始时间'}),
        dataIndex: 'startDate',
        width: 180
      },
      {
        title: seiIntl.get({key: 'flow_000107', desc: '结束时间'}),
        dataIndex: 'endDate',
        width: 180
      },
      {
        title: seiIntl.get({key: 'flow_000108', desc: '流程状态'}),
        dataIndex: 'ended',
        width: 120,
        render: (text, record) => {
          if (record.manuallyEnd) {
            return seiIntl.get({key: 'flow_000104', desc: '强制终止'})
          } else if (record.ended) {
            return seiIntl.get({key: 'flow_000109', desc: '结束'})
          } else {
            return seiIntl.get({key: 'flow_000110', desc: '处理中'})
          }
        }
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
            style={{width: 180}}
            selectChange={this.selectChangeAppModel}/></span>,
        <span key={"selectBusinessModel"} className={"primaryButton"}>{seiIntl.get({key: 'flow_000053', desc: '业务实体：'})}
          <SearchTable
            title={seiIntl.get({key: 'flow_000054', desc: '业务实体'})}
            key="searchBusinessModelTable"
            initValue={false}
            isNotFormItem={true} params={{"appModuleId": this.state.appModuleId}} config={businessModelByAppModelConfig}
            style={{width: 180}}
            selectChange={this.selectChangeBusinessModel}/></span>,
        <span key={"selectFlowType"} className={"primaryButton"}>{seiIntl.get({key: 'flow_000055', desc: '流程类型：'})}
          <SearchTable
            title={seiIntl.get({key: 'flow_000056', desc: '流程类型'})}
            key="searchFlowType"
            initValue={false}
            isNotFormItem={true} params={{"businessModelId": this.state.businessModelId}}
            config={flowTypeByBusinessModelConfig}
            style={{width: 180}}
            selectChange={this.selectChangeFlowType}/></span>,
        <span key={"checkInFlow"} className={"primaryButton"}>{seiIntl.get({key: 'flow_000111', desc: '流程中：'})}
          <Checkbox defaultChecked={true} onChange={this.checkChangeInFlow}/></span>
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Tooltip title={seiIntl.get({key: 'flow_000321', desc: '流程名称、业务单号（ID）、工作说明、发起人名称（账户）'})}>
          <Search
            key="search"
            placeholder={seiIntl.get({key: 'flow_000160', desc: '输入关键字查询'})}
            onSearch={value => this.handleSearch(value)}
            style={{width: 220}}
            allowClear
          />
        </Tooltip>
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
        <ApproveHistory version="6" historyKey={this.state.historyKey} setHistoryKey={this.setHistoryKey}/>
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



