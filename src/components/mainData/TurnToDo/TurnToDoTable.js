/**
 * <p/>
 * 实现功能：任意转办（管理员）
 * <p/>
 *
 * @author 何灿坤
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Modal, message, Input} from 'antd';
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import {getAllTaskByTenant,taskTurnToDo} from "./TurnToDoService";
import {appModuleAuthConfig,businessModelByAppModelConfig,flowTypeByBusinessModelConfig} from "../../../configs/CommonComponentsConfig";
import SearchTable from "../../../commons/components/SearchTable";
import HeadBreadcrumb from "../../../commons/components/breadcrumb/HeadBreadcrumb";
import StandardDropdown from "../../../commons/components/StandardDropdown";
import AnyOneSelected from './AnyOneSelected';

const confirm = Modal.confirm
const Search = Input.Search;

class FlowInstanceTable extends Component {
  selectedOne=null;
  currentClick=null;
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

  getDataSource = (params = {}) => {
    this.props.show();
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
  okHandle=()=>{
    let thiz = this;
    thiz.props.show();
    taskTurnToDo(this.currentRecord.id,this.selectedOne.toString()).then(res=>{
      if(res.status==='SUCCESS'){
        this.currentRecord=null;
        message.success('流程转办成功');
        thiz.getDataSource();
      }else{
        message.error(res.message)
      }
    }).catch(e => {
    }).finally(() => {
      thiz.props.hide();
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
        title: "操作",
        width: 100,
        dataIndex: "operator",
        render: (text, record, index) => {
          let ops = [
            <a className={'row-operator-item'} key="delegate" onClick={()=>{
              this.currentClick="转办";
              this.currentRecord=record;
              this.setState({selectUserModal:true});}}>转办</a>
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
        title: '流程名称',
        dataIndex: 'flowName',
        width: 200
      },
      {
        title: '任务名称',
        dataIndex: 'taskName',
        width: 150
      },
      {
        title: '业务编码',
        dataIndex: 'flowInstance.businessCode',
        width: 150
      },
      {
        title: '执行人名称',
        dataIndex: 'executorName',
        width: 150
      },
      {
        title: '执行人账号',
        dataIndex: 'executorAccount',
        width: 150
      },
      {
        title: '描述',
        dataIndex: 'depict',
        width: 300
      },
      {
        title: '创建时间',
        dataIndex: 'createdDate',
        width: 180
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
                    selectChange={this.selectChangeFlowType}/></span>
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
          <Modal
            title={`指定${this.currentClick}人`}
            bodyStyle={{maxHeight:"720px",overflow:"auto"}}
            width={window.innerWidth*0.8}
            visible={this.state.selectUserModal}
            onOk={this.okHandle}
            onCancel={()=>{this.setState({selectUserModal:false});this.currentRecord=null}}
            destroyOnClose={true}
            maskClosable={false}
          >
            <AnyOneSelected type='radio' selectChange={(id)=>this.selectedOne=id}/>
          </Modal>
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



