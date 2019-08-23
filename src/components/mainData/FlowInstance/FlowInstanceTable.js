/**
 * <p/>
 * 实现功能：流程实例管理
 * <p/>
 *
 * @author 何灿坤
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Modal, message, Input, Checkbox} from 'antd';
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import {getFlowInstance,endForce} from "./FlowInstanceService";
import {ApproveHistory} from 'seid';
import {appModuleAuthConfig,businessModelByAppModelConfig,flowTypeByBusinessModelConfig} from "../../../configs/CommonComponentsConfig";
import SearchTable from "../../../commons/components/SearchTable";
import HeadBreadcrumb from "../../../commons/components/breadcrumb/HeadBreadcrumb";
import { mainTabAction } from 'sei-utils';

const confirm = Modal.confirm
const Search = Input.Search;

class FlowInstanceTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectedRows: [],
      historyKey:"",
      pageInfo: null,
      searchValue: "",
      appModule: null,
      appModuleId:"",
      businessModel: null,
      businessModelId:"",
      flowType: null,
      flowTypeId:"",
      checkInFlow:false
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
          fieldName: "flowDefVersion.flowDefination.flowType.businessModel.appModule.id",//筛选字段(应用模块)
          operator: "EQ",//操作类型
          value: this.state.appModuleId,//筛选值
          fieldType: "String"//筛选类型
        },{
          fieldName: "flowDefVersion.flowDefination.flowType.businessModel.id",//筛选字段（业务实体）
          operator: "EQ",//操作类型
          value: this.state.businessModelId,//筛选值
          fieldType: "String"//筛选类型
        },{
          fieldName: "flowDefVersion.flowDefination.flowType.id",//筛选字段（流程类型）
          operator: "EQ",//操作类型
          value: this.state.flowTypeId,//筛选值
          fieldType: "String"//筛选类型
        },{
          fieldName: "manuallyEnd",
          operator: "EQ",//操作类型
          value: this.state.checkInFlow==false?false:"",//筛选值
          fieldType: "Boolean"//筛选类型
        },{
          fieldName: "ended",
          operator: "EQ",//操作类型
          value: this.state.checkInFlow==false?false:"",//筛选值
          fieldType: "Boolean"//筛选类型
        }]
      })
    }
    getFlowInstance(params).then(data => {
      this.setState({data, selectedRows: [], searchValue: this.state.searchValue});
    }).catch(e => {
    }).finally(() => {
      this.props.hide();
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
    let url = data.webBaseAddressAbsolute.replace(/\/$/g,'')+'/'+uri.replace(/^\//g,'');
    if(url.indexOf('?') === -1){
      url=`${url}?id=${data.businessId}`
    } else {
      url=`${url}&id=${data.businessId}`
    }
    mainTabAction.tabOpen({id:data.businessId,name:'查看表单',featureUrl:url})
  };
  handleSearch = (value) => {
    this.setState({searchValue: value});
    this.getDataSource({quickSearchValue: value});
  };

  handleHistory = (data) => {
    this.setState({historyKey:data.businessId});
  };
  setHistoryKey=(id)=>{
    this.setState({historyKey:id})
  };
  handleEnd = (record) =>{
    let thiz = this;
    confirm({
      title: '温馨提示',
      content: `您确定要强制终止【${record.businessCode}】吗？`,
      onOk: () => {
        thiz.props.show();
        endForce(record.id).then(res=>{
          if(res.status==='SUCCESS'){
            message.success('流程终止成功');
            thiz.getDataSource();
          }else{
            message.error(res.message);
          }
        }).catch(e => {
        }).finally(() => {
          thiz.props.hide();
        });
      }
    });
  };
  selectChangeAppModel  = (record) =>{
    if (record && record.id) {
        this.setState({appModule: record,appModuleId:record.id,businessModel: null,businessModelId:""});
        this.getDataSource({
          filters: [{
            fieldName: "flowDefVersion.flowDefination.flowType.businessModel.appModule.id",//筛选字段(应用模块)
            operator: "EQ",//操作类型
            value: `${record.id}`,//筛选值
            fieldType: "String"//筛选类型
          },{
            fieldName: "manuallyEnd",
            operator: "EQ",//操作类型
            value: this.state.checkInFlow==false?false:"",//筛选值
            fieldType: "Boolean"//筛选类型
          },{
            fieldName: "ended",
            operator: "EQ",//操作类型
            value: this.state.checkInFlow==false?false:"",//筛选值
            fieldType: "Boolean"//筛选类型
          }], quickSearchValue: this.state.searchValue
        });
    } else {
      this.setState({appModule: null,appModuleId:"",businessModel: null,businessModelId:"",flowType:null,flowTypeId:""});
      this.getDataSource({
        filters: [{
          fieldName: "flowDefVersion.flowDefination.flowType.businessModel.appModule.id",//筛选字段(应用模块)
          operator: "EQ",//操作类型
          value: "",//筛选值
          fieldType: "String"//筛选类型
        },{
          fieldName: "manuallyEnd",
          operator: "EQ",//操作类型
          value: this.state.checkInFlow==false?false:"",//筛选值
          fieldType: "Boolean"//筛选类型
        },{
          fieldName: "ended",
          operator: "EQ",//操作类型
          value: this.state.checkInFlow==false?false:"",//筛选值
          fieldType: "Boolean"//筛选类型
        }],quickSearchValue: this.state.searchValue});
    }
  };
  selectChangeBusinessModel = (record) => {
    if (record && record.id) {
        this.setState({businessModel: record,businessModelId:record.id});
        this.getDataSource({
          filters: [{
            fieldName: "flowDefVersion.flowDefination.flowType.businessModel.appModule.id",//筛选字段(应用模块)
            operator: "EQ",//操作类型
            value: this.state.appModuleId,//筛选值
            fieldType: "String"//筛选类型
          },{
            fieldName: "flowDefVersion.flowDefination.flowType.businessModel.id",//筛选字段（业务实体）
            operator: "EQ",//操作类型
            value: `${record.id}`,//筛选值
            fieldType: "String"//筛选类型
          },{
            fieldName: "manuallyEnd",
            operator: "EQ",//操作类型
            value: this.state.checkInFlow==false?false:"",//筛选值
            fieldType: "Boolean"//筛选类型
          },{
            fieldName: "ended",
            operator: "EQ",//操作类型
            value: this.state.checkInFlow==false?false:"",//筛选值
            fieldType: "Boolean"//筛选类型
          }], quickSearchValue: this.state.searchValue
        });
    } else {
      this.setState({businessModel: null,businessModelId:"",flowType:null,flowTypeId:""});
      this.getDataSource({
        filters: [{
          fieldName: "flowDefVersion.flowDefination.flowType.businessModel.appModule.id",//筛选字段(应用模块)
          operator: "EQ",//操作类型
          value: this.state.appModuleId,//筛选值
          fieldType: "String"//筛选类型
        },{
          fieldName: "manuallyEnd",
          operator: "EQ",//操作类型
          value: this.state.checkInFlow==false?false:"",//筛选值
          fieldType: "Boolean"//筛选类型
        },{
          fieldName: "ended",
          operator: "EQ",//操作类型
          value: this.state.checkInFlow==false?false:"",//筛选值
          fieldType: "Boolean"//筛选类型
        }],quickSearchValue: this.state.searchValue});
    }
  };
  selectChangeFlowType = (record) => {
    if (record && record.id) {
        this.setState({flowType: record,flowTypeId:record.id});
        this.getDataSource({
          filters: [{
            fieldName: "flowDefVersion.flowDefination.flowType.businessModel.appModule.id",//筛选字段(应用模块)
            operator: "EQ",//操作类型
            value: this.state.appModuleId,//筛选值
            fieldType: "String"//筛选类型
          },{
            fieldName: "flowDefVersion.flowDefination.flowType.businessModel.id",//筛选字段（业务实体）
            operator: "EQ",//操作类型
            value: this.state.businessModelId,//筛选值
            fieldType: "String"//筛选类型
          },{
            fieldName: "flowDefVersion.flowDefination.flowType.id",//筛选字段（流程类型）
            operator: "EQ",//操作类型
            value: `${record.id}`,//筛选值
            fieldType: "String"//筛选类型
          },{
            fieldName: "manuallyEnd",
            operator: "EQ",//操作类型
            value: this.state.checkInFlow==false?false:"",//筛选值
            fieldType: "Boolean"//筛选类型
          },{
            fieldName: "ended",
            operator: "EQ",//操作类型
            value: this.state.checkInFlow==false?false:"",//筛选值
            fieldType: "Boolean"//筛选类型
          }], quickSearchValue: this.state.searchValue
        });
    } else {
      this.setState({flowType: null,flowTypeId:""});
      this.getDataSource({
        filters: [{
        fieldName: "flowDefVersion.flowDefination.flowType.businessModel.appModule.id",//筛选字段(应用模块)
        operator: "EQ",//操作类型
        value: this.state.appModuleId,//筛选值
        fieldType: "String"//筛选类型
      },{
        fieldName: "flowDefVersion.flowDefination.flowType.businessModel.id",//筛选字段（业务实体）
        operator: "EQ",//操作类型
        value: this.state.businessModelId,//筛选值
        fieldType: "String"//筛选类型
      },{
          fieldName: "manuallyEnd",
          operator: "EQ",//操作类型
          value: this.state.checkInFlow==false?false:"",//筛选值
          fieldType: "Boolean"//筛选类型
        },{
          fieldName: "ended",
          operator: "EQ",//操作类型
          value: this.state.checkInFlow==false?false:"",//筛选值
          fieldType: "Boolean"//筛选类型
        }], quickSearchValue: this.state.searchValue});
    }
  };
  checkChangeInFlow = (checkInfo) => {
    this.setState({checkInFlow: !checkInfo.target.checked});
    this.getDataSource({
      filters: [{
        fieldName: "flowDefVersion.flowDefination.flowType.businessModel.appModule.id",//筛选字段(应用模块)
        operator: "EQ",//操作类型
        value: this.state.appModuleId,//筛选值
        fieldType: "String"//筛选类型
      }, {
        fieldName: "flowDefVersion.flowDefination.flowType.businessModel.id",//筛选字段（业务实体）
        operator: "EQ",//操作类型
        value: this.state.businessModelId,//筛选值
        fieldType: "String"//筛选类型
      }, {
        fieldName: "flowDefVersion.flowDefination.flowType.id",//筛选字段（流程类型）
        operator: "EQ",//操作类型
        value: this.state.flowTypeId,//筛选值
        fieldType: "String"//筛选类型
      }, {
        fieldName: "manuallyEnd",
        operator: "EQ",//操作类型
        value: ((!checkInfo.target.checked)==false)?false:"",//筛选值
        fieldType: "Boolean"//筛选类型
      }, {
        fieldName: "ended",
        operator: "EQ",//操作类型
        value: ((!checkInfo.target.checked)==false)?false:"",//筛选值
        fieldType: "Boolean"//筛选类型
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
        width: 200,
        dataIndex: "operator",
        render: (text, record, index) => {
          let ops = () => {
            let ops = [];
            ops.push(<a className={'row-operator-item'} key={"detail" + index} onClick={() => this.handleDetail(record)}>查看</a>);
            ops.push(<a className={'row-operator-item'} key={"history" + index} onClick={() => this.handleHistory(record)}>历史</a>);
            if (!record.ended) {
              ops.push(<a className={'row-operator-item'} key={"end" + index} onClick={() => this.handleEnd(record)}>强制终止</a>);
            }
            return ops;
          }

          return (
            ops()
          )
        }
      },
      {
        title: '流程名称',
        dataIndex: 'flowName',
        width: 200
      },
      {
        title: '业务编号',
        dataIndex: 'businessCode',
        width: 150
      },
      {
        title: '工作说明',
        dataIndex: 'businessModelRemark',
        width: 360
      },
      {
        title: '开始时间',
        dataIndex: 'startDate',
        width: 180
      },
      {
        title: '结束时间',
        dataIndex: 'endDate',
        width: 180
      },
      {
        title: '流程状态',
        dataIndex: 'ended',
        width: 120,
        render: (text, record) => {
          if (record.manuallyEnd) {
            return "强制终止"
          } else  if(record.ended) {
            return "结束"
          } else {
            return "处理中"
          }
        }
      }
    ];

    const title = () => {
      return [
          <span key={"selectAppModel"} className={"primaryButton"} >应用模块：
                  <SearchTable
                    title={"应用模块"}
                    key="searchAppModelTable"
                    initValue={true}
                    isNotFormItem={true} config={appModuleAuthConfig}
                    style={{width: 180}}
                    selectChange={this.selectChangeAppModel}/></span>,
          <span key={"selectBusinessModel"} className={"primaryButton"} >业务实体：
                  <SearchTable
                    title={"业务实体"}
                    key="searchBusinessModelTable"
                    initValue={false}
                    isNotFormItem={true} params = {{"appModuleId":this.state.appModuleId}} config={businessModelByAppModelConfig}
                    style={{width: 180}}
                    selectChange={this.selectChangeBusinessModel}/></span>,
        <span key={"selectFlowType"} className={"primaryButton"} >流程类型：
                  <SearchTable
                    title={"流程类型"}
                    key="searchFlowType"
                    initValue={false}
                    isNotFormItem={true} params = {{"businessModelId":this.state.businessModelId}} config={flowTypeByBusinessModelConfig}
                    style={{width: 180}}
                    selectChange={this.selectChangeFlowType}/></span>,
        <span key={"checkInFlow"} className={"primaryButton"} >流程中：
                   <Checkbox  defaultChecked={true} onChange={this.checkChangeInFlow} /></span>
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
)(FlowInstanceTable)



