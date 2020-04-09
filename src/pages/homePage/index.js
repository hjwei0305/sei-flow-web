/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/12
 */
import React, {Component} from 'react';
import {connect} from "dva";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import HomeHead from "./component/HomeHead";
import {listCompleteTask, listFlowTaskWithAllCount, listMyBills,findCommonTaskSumHeader} from "./service";
import HomeContent from "./component/HomeContent";
import BatchApprove from './component/BatchApprove';
import { seiLocale } from 'sei-utils';
import { userUtils, constants, } from '@/utils';

import "./index.css";

const { TASK_TYPE, } = constants;
const  { getCurrentUser, } = userUtils;

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageInfo: null,
      searchValue: {},
      taskType: TASK_TYPE.TODO,
      selectedRows: [],
      todoDataSource: [],
      completeDataSource: [],
      orderDataSource: [],
      batchApproveShow:false,
      selectOrderType:"all",
      aprroveHead:[]
    }
    this.cacheParams = {
      [TASK_TYPE.TODO]: {},
      [TASK_TYPE.COMPLETE]: {},
      [TASK_TYPE.ORDER]: {},

    }
  }

  componentDidMount() {
    this.getDataSource();
    window.parent.frames.addEventListener('message',this.clickRfresh,false);
    const __portal__ = window.parent.__portal__;
    if (__portal__ && __portal__.eventBus) {
      __portal__.eventBus.on(`${window.frameElement.id}_refresh`, () => {
        this.refresh();
      });
    }
  }

  componentWillUnmount(){
    window.parent.frames.removeEventListener('message',this.clickRfresh,false)
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

  clickRfresh=(e)=>{
    const {data={}}=e
    if(data.tabAction==='clickChange' && data.tabKey==='homeView'){
      this.refresh()
    }
  }

  refresh=()=>{
    const { taskType, } = this.state;
    this.getDataSource({...this.state.searchValue, ...this.cacheParams[taskType]});
  }

  getTaskType = (taskType) => {
    this.setState({taskType}, () => this.getDataSource(this.cacheParams[taskType]))
  }
  getDataSource = (params = {}) => {
    params = {pageInfo:{page: 1, rows: 50},...params};
    this.toggoleGlobalLoading(true);
    const {taskType} = this.state;
    if (taskType === TASK_TYPE.ORDER) {
      const initParams = {
        "Q_EQ_ended_Boolean": null
      };
      params = {
        ...initParams,
        ...params,
      };
      if(params.Q_EQ_ended_Boolean==null){
         this.setState({selectOrderType:"all"});
      }else if(params.Q_EQ_ended_Boolean==false){
        this.setState({selectOrderType:"inFlow"});
      }else if(params.Q_EQ_ended_Boolean==true){
        if(params.Q_EQ_manuallyEnd_Boolean==true){
          this.setState({selectOrderType:"abnormalEnd"});
        }else{
          this.setState({selectOrderType:"ended"});
        }
      }
    }
    this.getService(params)
      .then(res => {
        if (res.success) {
          switch (taskType) {
            case TASK_TYPE.TODO:
              this.setState({todoDataSource: res && res.data ? res.data : []});
              break;
            case TASK_TYPE.COMPLETE:
              this.setState({completeDataSource: res && res.data ? res.data : []});
              break;
            case TASK_TYPE.ORDER:
              this.setState({orderDataSource: res && res.data ? res.data : []});
              break;
            default:
              break;
          }
        }
      })
      .finally(() => {
          this.toggoleGlobalLoading(false);
        }
      );
  }

  getService = (params) => {
    const {taskType} = this.state;
    this.cacheParams[taskType] = params;
    switch (taskType) {
      case TASK_TYPE.TODO:
        return listFlowTaskWithAllCount(params);
      case TASK_TYPE.COMPLETE:
        return listCompleteTask(params);
      case TASK_TYPE.ORDER:
        return listMyBills(params);
      default:
        break;
    }
  }
  handleRowSelectChange = (selectedRows) => {
    this.setState({selectedRows})
  };
  handlePageChange = (pageInfo) => {
    this.setState({pageInfo},()=>this.getDataSource({...this.state.searchValue,pageInfo:pageInfo}));
  }

  //我的单据排序、分页
  onChange =(...rest)=>{
    const  sortOrders = [];
    if(rest[2]&&rest[2].field){
      sortOrders.push({property:rest[2].field,direction:(rest[2].order=="ascend"?"ASC":"DESC")});
    }else{
      sortOrders.push({property:"createdDate",direction:"DESC"});
    }
    if(rest[0]&&rest[0].page){
      const  pageInfo =  rest[0];
      this.setState({pageInfo,sortOrders},()=>this.getDataSource({...this.state.searchValue,pageInfo:pageInfo,sortOrders:sortOrders}));
    }else{
      this.setState({sortOrders},()=>this.getDataSource({...this.state.searchValue,sortOrders:sortOrders}));
    }
  }

  handleSearchValue = (searchValue) => {
    this.setState({searchValue:searchValue},()=>this.getDataSource({...searchValue}));
  }

  handleBatchApproce = (batchApproveShow) =>{
    if(batchApproveShow){
      findCommonTaskSumHeader().then(res=>{
        this.setState({batchApproveShow:true,aprroveHead:res})
      })
    }else{
      this.setState({batchApproveShow:false})
    }

  }

  render() {
    const user = getCurrentUser();
    const {selectedRows, taskType, todoDataSource,selectOrderType, completeDataSource, orderDataSource,batchApproveShow} = this.state;
    return (
      <HeadBreadcrumb
        className={"todo-page"}
      >
        {batchApproveShow?<BatchApprove aprroveHead={this.state.aprroveHead} handleBatchApproce={this.handleBatchApproce}/>:
        <div className={"tbar-table tbar-table-back"}>
          <HomeHead
            getTaskType={this.getTaskType}
            handleSearchValue={this.handleSearchValue}
            handleBatchApproce={this.handleBatchApproce}
            count={todoDataSource ? todoDataSource.length : 0}
          />
          <HomeContent
            taskType={taskType}
            refresh={this.refresh}
            handleRowSelectChange={this.handleRowSelectChange}
             handlePageChange={this.handlePageChange}
            selectOrderType = {selectOrderType}
            selectedRows={selectedRows}
            onChange ={this.onChange}
            dataSource={{
              [TASK_TYPE.TODO]: todoDataSource,
              [TASK_TYPE.COMPLETE]: completeDataSource,
              [TASK_TYPE.ORDER]: orderDataSource
            }}
          />
        </div>}
      </HeadBreadcrumb>
    );
  }
}

const mapStateToProps = ({}) => {
  return {};
};
export default connect(mapStateToProps)(HomePage);
