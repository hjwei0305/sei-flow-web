/**
 * <p/>
 * 实现功能：任意转办（管理员）
 * <p/>
 *
 * @author 何灿坤
 */
import React, {Component} from 'react'
import {connect} from 'dva'
import {Modal, message, Input} from 'antd';
import SimpleTable from "@/components/SimpleTable";
import {getAllTaskByTenant,taskTurnToDo} from "./TurnToDoService";
import SearchTable from "@/components/SearchTable";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import StandardDropdown from "@/components/StandardDropdown";
import TurnToDoSelected from './TurnToDoSelected';
import { seiLocale } from 'sei-utils';
import { appModuleAuthConfig,businessModelByAppModelConfig,flowTypeByBusinessModelConfig, } from '@/utils/CommonComponentsConfig';

const { seiIntl } = seiLocale;
const Search = Input.Search;

class TurnToDoTable extends Component {
  selectedOne=null;
  currentRecord=null;

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectedRows: [],
      selectUserModal:false,
      pageInfo: null,
      searchValue: "",
      appModule: null,
      appModuleId:"",
      businessModel: null,
      businessModelId:"",
      flowType: null,
      flowTypeId:""
    };
  }

  componentWillMount() {
    // this.getDataSource()
  }

  toggoleGlobalLoading = (loading) => {
    const { dispatch, } = this.props;
    dispatch({
      type: 'global/updateState',
      payload: {
        globalLoading: loading,
      }
    });
  }

  getDataSource = (params = {}) => {
    this.toggoleGlobalLoading(true);
    if (!params.appModuleId&&!params.businessModelId&&!params.flowTypeId) {
      Object.assign(params, {
        appModuleId: this.state.appModuleId,
        businessModelId: this.state.businessModelId,
        flowTypeId: this.state.flowTypeId
      })
    }
    getAllTaskByTenant(params).then(data => {
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
  okHandle=()=>{
    let thiz = this;
    thiz.toggoleGlobalLoading(true);
    taskTurnToDo(this.currentRecord.id,this.selectedOne.toString()).then(res=>{
      if(res.status==='SUCCESS'){
        this.currentRecord=null;
        message.success(seiIntl.get({key: 'flow_000045', desc: '流程转办成功'}));
        thiz.getDataSource();
      }else{
        message.error(res.message)
      }
    }).catch(e => {
    }).finally(() => {
      thiz.toggoleGlobalLoading(false);
    });;
    this.setState({selectUserModal:false});
  };
  selectChangeAppModel  = (record) =>{
    if (record && record.id) {
      this.setState({appModule: record,appModuleId:record.id,businessModel: null,businessModelId:""});
      this.getDataSource({
        filters: [],
        appModuleId:`${record.id}`,
        businessModelId:"",
        flowTypeId:"",
        quickSearchValue: this.state.searchValue
      });
    } else {
      this.setState({appModule: null,appModuleId:"",businessModel: null,businessModelId:"",flowType:null,flowTypeId:""});
      this.getDataSource({
        filters: [],
        appModuleId:"",
        businessModelId:"",
        flowTypeId:"",
        quickSearchValue: this.state.searchValue});
    }
  };
  selectChangeBusinessModel = (record) => {
    if (record && record.id) {
      this.setState({businessModel: record,businessModelId:record.id});
      this.getDataSource({
        filters: [],
        appModuleId:this.state.appModuleId,
        businessModelId:`${record.id}`,
        flowTypeId:"",
        quickSearchValue: this.state.searchValue
      });
    } else {
      this.setState({businessModel: null,businessModelId:"",flowType:null,flowTypeId:""});
      this.getDataSource({
        filters: [],
        appModuleId:this.state.appModuleId,
        businessModelId:"",
        flowTypeId:"",
        quickSearchValue: this.state.searchValue});
    }
  };
  selectChangeFlowType = (record) => {
    if (record && record.id) {
      this.setState({flowType: record,flowTypeId:record.id});
      this.getDataSource({
        filters: [],
        appModuleId:this.state.appModuleId,
        businessModelId:this.state.businessModelId,
        flowTypeId:`${record.id}`,
        quickSearchValue: this.state.searchValue
      });
    } else {
      this.setState({flowType: null,flowTypeId:""});
      this.getDataSource({
        filters: [],
        appModuleId:this.state.appModuleId,
        businessModelId:this.state.businessModelId,
        flowTypeId:"",
        quickSearchValue: this.state.searchValue});
    }
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
        title: seiIntl.get({key: 'flow_000030', desc: '操作'}),
        width: 100,
        dataIndex: "operator",
        render: (text, record, index) => {
          let ops = [
            <a className={'row-operator-item'} key="delegate" onClick={()=>{
              this.currentRecord=record;
              this.setState({selectUserModal:true});}}>{seiIntl.get({key: 'flow_000046', desc: '转办'})}</a>
            ]
          return (
            <div className={'row-operator'} key={"operator" + index} onClick={(e) => {
              e.stopPropagation()
            }}>
              <StandardDropdown operator={ops}/>
            </div>
          )
        }
      },
      {
        title: seiIntl.get({key: 'flow_000047', desc: '流程名称'}),
        dataIndex: 'flowName',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000048', desc: '任务名称'}),
        dataIndex: 'taskName',
        width: 150
      },
      {
        title: seiIntl.get({key: 'flow_000049', desc: '业务编码'}),
        dataIndex: 'flowInstance.businessCode',
        width: 150
      },
      {
        title: seiIntl.get({key: 'flow_000050', desc: '执行人名称'}),
        dataIndex: 'executorName',
        width: 150
      },
      {
        title: seiIntl.get({key: 'flow_000051', desc: '执行人账号'}),
        dataIndex: 'executorAccount',
        width: 150
      },
      {
        title: seiIntl.get({key: 'flow_000037', desc: '描述'}),
        dataIndex: 'depict',
        width: 300
      },
      {
        title: seiIntl.get({key: 'flow_000052', desc: '创建时间'}),
        dataIndex: 'createdDate',
        width: 180
      }
    ];

    const title = () => {
      return [
        <span key={"selectAppModel"} className={"primaryButton"} >{seiIntl.get({key: 'flow_000038', desc: '应用模块：'})}
                  <SearchTable
                    title={seiIntl.get({key: 'flow_000041', desc: '应用模块'})}
                    key="searchAppModelTable"
                    initValue={true}
                    isNotFormItem={true} config={appModuleAuthConfig}
                    style={{width: 180}}
                    selectChange={this.selectChangeAppModel}/></span>,
        <span key={"selectBusinessModel"} className={"primaryButton"} >{seiIntl.get({key: 'flow_000053', desc: '业务实体：'})}
                  <SearchTable
                    title={seiIntl.get({key: 'flow_000054', desc: '业务实体'})}
                    key="searchBusinessModelTable"
                    initValue={false}
                    isNotFormItem={true} params = {{"appModuleId":this.state.appModuleId}} config={businessModelByAppModelConfig}
                    style={{width: 180}}
                    selectChange={this.selectChangeBusinessModel}/></span>,
        <span key={"selectFlowType"} className={"primaryButton"} >{seiIntl.get({key: 'flow_000055', desc: '流程类型：'})}
                  <SearchTable
                    title={seiIntl.get({key: 'flow_000056', desc: '流程类型'})}
                    key="searchFlowType"
                    initValue={false}
                    isNotFormItem={true} params = {{"businessModelId":this.state.businessModelId}} config={flowTypeByBusinessModelConfig}
                    style={{width: 180}}
                    selectChange={this.selectChangeFlowType}/></span>
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Search
          key="search"
          placeholder={seiIntl.get({key: 'flow_000057', desc: '输入代码或名称查询'})}
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
          <Modal
            title={seiIntl.get({key: 'flow_000058', desc: '指定转办人'})}
            bodyStyle={{maxHeight:"720px",overflow:"auto"}}
            width={window.innerWidth*0.8}
            visible={this.state.selectUserModal}
            onOk={this.okHandle}
            onCancel={()=>{this.setState({selectUserModal:false});this.currentRecord=null}}
            destroyOnClose={true}
            maskClosable={false}
          >
            <TurnToDoSelected type='radio' selectChange={(id)=>this.selectedOne=id}/>
          </Modal>
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
)(TurnToDoTable)



