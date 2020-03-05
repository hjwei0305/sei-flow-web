/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/15
 */
import React, {Component} from 'react';
import StandardDropdown from "@/components/StandardDropdown";
import {Modal,Input,message} from 'antd';
import {mainTabAction} from 'sei-utils';
import AnyOneSelected from './AnyOneSelected';
import {taskTurnToDo,taskTrustToDo,reject,endTask} from '../service';
import { ApproveHistory, OptGroup, SimpleTable, } from 'seid';
import { seiLocale } from 'sei-utils';
import { commonUtils, } from '@/utils';

const {countDate} = commonUtils;
const { seiIntl } = seiLocale;
const { TextArea } = Input;
const confirm = Modal.confirm;
class TodoTask extends Component {

  selectedOne=null;
  currentClick=null;
  currentRecord=null

  state={
    selectUserModal:false,
    rejectModal:false,
    historyKey:'',
    opinion:''
  }

  handleTodo = (record) => {
    let url = '';
    if(record.taskFormUrl.includes('?')){
      url = `${record.taskFormUrl}&taskId=${record.id}&instanceId=${record.flowInstance.id}&id=${record.flowInstance.businessId}&trustState=${record.trustState}`;
    }else{
      url = `${record.taskFormUrl}?taskId=${record.id}&instanceId=${record.flowInstance.id}&id=${record.flowInstance.businessId}&trustState=${record.trustState}`;
    }
    mainTabAction.tabOpen({id:record.id,name:record.flowName,featureUrl:url})
  }

  handleDetail = (data) =>{
    let uri = data.flowInstance.flowDefVersion.flowDefination.flowType.lookUrl;
    if (!uri) {
      uri = data.flowInstance.flowDefVersion.flowDefination.flowType.businessModel.lookUrl;
    }
    let url = data.lookWebBaseAddressAbsolute.replace(/\/$/g,'')+'/'+uri.replace(/^\//g,'');
    if(url.indexOf('?') === -1){
      url=`${url}?id=${data.flowInstance.businessId}`
    } else {
      url=`${url}&id=${data.flowInstance.businessId}`
    }
    mainTabAction.tabOpen({id:data.flowInstance.businessId,name:seiIntl.get({key: 'common_000223', desc: '查看表单'}),featureUrl:url})
  }

  handleEnd=(record)=>{
    endTask(record.flowInstance.id).then(res=>{
      if(res.status==='SUCCESS'){
        message.success(seiIntl.get({key: 'common_000235', desc: '流程终止成功'}))
        this.props.refresh();
      }else{
        message.error(res.message)
      }
    })
  }

  handleHistory=(record)=>{
    this.setState({historyKey:record.flowInstance.businessId})
  }

  setHistoryKey=(id)=>{
    this.setState({historyKey:id})
  }

  rejectHandle=()=>{
    if(!this.state.opinion || this.state.opinion.trim()===''){
      message.error(seiIntl.get({key: 'common_000242', desc: '请填写处理意见'}))
      return;
    }
    reject(this.currentRecord.id,this.state.opinion).then(res=>{
      if(res.status==='SUCCESS'){
        message.success(seiIntl.get({key: 'common_000243', desc: '流程驳回成功'}));
        this.currentRecord=null;
        this.setState({opinion:'',rejectModal:false});
        this.props.refresh();
      }else{
        message.error(res.message);
      }
    })
  }

  okHandle=()=>{
    switch (this.currentClick) {
      case seiIntl.get({key: 'common_000244', desc: '转办'}):
        taskTurnToDo(this.currentRecord.id,this.selectedOne.toString()).then(res=>{
          if(res.status==='SUCCESS'){
            this.currentRecord=null;
            message.success(seiIntl.get({key: 'common_000245', desc: '流程转办成功'}));
            this.props.refresh()
          }else{
            message.error(res.message)
          }
        })
        break;
      case seiIntl.get({key: 'common_000246', desc: '委托'}):
        taskTrustToDo(this.currentRecord.id,this.selectedOne.toString()).then(res=>{
          if(res.status==='SUCCESS'){
            this.currentRecord=null;
            message.success(seiIntl.get({key: 'common_000247', desc: '流程委托成功'}));
            this.props.refresh()
          }else{
            message.error(res.message)
          }
        })
        break;
      default:
        break;
    }
    this.setState({selectUserModal:false});
  }

  commonConfirm=(title,okHandle,record)=>{
    confirm({
	    title: seiIntl.get({key: 'tips', desc: '温馨提示'}),
	    content: `您确定要${title}吗？`,
	    onOk: () => {
	    	okHandle(record)
	    }
	  });
  }

  getColumns = () => {
    return [
      {
        title: seiIntl.get({key: 'operation', desc: '操作'}),
        width: 120,
        dataIndex: "operator",
        render: (text, record, index) => {

          const optList = [{
            title: seiIntl.get({key: 'common_000249', desc: '处理'}),
            onClick: () => this.handleTodo(record),
          }];


          const buttons = [<a className={'row-operator-item'} key="todo" onClick={() => this.handleTodo(record)}>{seiIntl.get({key: 'common_000249', desc: '处理'})}</a>]
          //是否显示驳回按钮
          let rejectFlag = record.trustState !== 2 && record.canReject;
          var nodeType = JSON.parse(record.taskJsonDef).nodeType;
          //签收
          let claimTaskHtml = nodeType === "SingleSign" && record.trustState !== 2 && !record.actClaimTime
          //转办
          let transferHtml = (nodeType === "Normal" || nodeType === "Approve" || nodeType === "CounterSign") && record.trustState === null && JSON.parse(record.taskJsonDef).nodeConfig.normal.allowTransfer;
          //委托
          let entrustHtml = nodeType === "Approve" && record.trustState === null && JSON.parse(record.taskJsonDef).nodeConfig.normal.allowEntrust;
          var flowInstanceCreatorId = record.flowInstance ? record.flowInstance.creatorId : "";
          //终止
          let endFlowHtml = record.canSuspension && record.trustState !== 2 && flowInstanceCreatorId === record.executorId;
          if (entrustHtml) {
            optList.push({
              title: seiIntl.get({key: 'common_000246', desc: '委托'}),
              onClick: () => {
                this.currentClick=seiIntl.get({key: 'common_000246', desc: '委托'});
                this.currentRecord=record
                this.setState({selectUserModal:true});
              }
            });
          }
          if (transferHtml) {
            optList.push({
              title: seiIntl.get({key: 'common_000244', desc: '转办'}),
              onClick: () => {
                this.currentClick=seiIntl.get({key: 'common_000244', desc: '转办'});
                this.currentRecord=record
                this.setState({selectUserModal:true});
              }
            });
          }

          if (rejectFlag) {
            optList.push({
              title: seiIntl.get({key: 'common_000250', desc: '驳回'}),
              onClick: () => {
                this.currentRecord = record;
                this.setState({rejectModal:true});
              }
            });
          }

          if (endFlowHtml) {
            optList.push({
              title: seiIntl.get({key: 'common_000236', desc: '终止'}),
              onClick: () => {
                this.commonConfirm(seiIntl.get({key: 'common_000236', desc: '终止'}),this.handleEnd,record)
              }
            });
          }

          optList.push({
            title: seiIntl.get({key: 'common_000228', desc: '查看'}),
            onClick: () => this.handleDetail(record),
          });
          optList.push({
            title: seiIntl.get({key: 'common_000229', desc: '流程历史'}),
            onClick: () => this.handleHistory(record),
          });

          return (<OptGroup optList={optList} />)

          if(entrustHtml){
            buttons.push(<a className={'row-operator-item'} key="turn" onClick={()=>{
                          this.currentClick=seiIntl.get({key: 'common_000246', desc: '委托'});
                          this.currentRecord=record
                          this.setState({selectUserModal:true});
                        }}>{seiIntl.get({key: 'common_000246', desc: '委托'})}</a>)
          }
          if(transferHtml){
            buttons.push(<a className={'row-operator-item'} key="delegate" onClick={()=>{
                          this.currentClick=seiIntl.get({key: 'common_000244', desc: '转办'});
                          this.currentRecord=record
                          this.setState({selectUserModal:true});
                        }}>{seiIntl.get({key: 'common_000244', desc: '转办'})}</a>)
          }
          if(rejectFlag){
            buttons.push(<a className={'row-operator-item'} key="revert" onClick={()=>{
              this.currentRecord = record;
              this.setState({rejectModal:true});
            }}>{seiIntl.get({key: 'common_000250', desc: '驳回'})}</a>)
          }
          if(endFlowHtml){
            buttons.push(<a className={'row-operator-item'} key="stop" onClick={()=>this.commonConfirm(seiIntl.get({key: 'common_000236', desc: '终止'}),this.handleEnd,record)}>{seiIntl.get({key: 'common_000236', desc: '终止'})}</a>)
          }
          buttons.push(<a className={'row-operator-item'} key="detail" onClick={() => this.handleDetail(record)}>{seiIntl.get({key: 'common_000228', desc: '查看'})}</a>)
          buttons.push(<a className={'row-operator-item'} key="history" onClick={() => this.handleHistory(record)}>{seiIntl.get({key: 'common_000229', desc: '流程历史'})}</a>)
          return (
            <div className={'row-operator'} onClick={(e) => {
              e.stopPropagation()
            }}>
              <StandardDropdown
                operator={buttons}
              />
            </div>
          )
        }
      },
      {
        title: seiIntl.get({key: 'common_000217', desc: '流程名称'}),
        width: 200,
        dataIndex: 'flowName',
        render: (text, record, index) => {
          if (text) {
            return <span title={text}>{text}</span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'common_000218', desc: '任务名称'}),
        dataIndex: 'taskName',
        width: 200,
        render: (text, record, index) => {
          if (record) {
            const res = `${record.taskName}`;
            if(record.priority >=3 ){
              return <span title={res}>{res}<span style={{color: "red"}}>【紧急】</span></span>;
            }
            if(record.priority ===2 ){
              return <span title={res}>{res}<span style={{color: "red"}}>【{seiIntl.get({key: 'common_000555', desc: '撤销'})}】</span></span>;
            }
            if(record.priority ===1 ){
              return <span title={res}>{res}<span style={{color: "red"}}>【{seiIntl.get({key: 'common_000250', desc: '驳回'})}】</span></span>;
            }
            return <span title={res}>{res}</span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'common_000219', desc: '单号'}),
        dataIndex: 'businessCode',
        width: 110,
        render: (text, record, index) => {
          if (record) {
            const res = `${record.flowInstance?record.flowInstance.businessCode:""}`;
            return <span title={res}>
              {res}
            </span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'common_000220', desc: '说明'}),
        dataIndex: 'businessModelRemark',
        width: 250,
        render: (text, record, index) => {
          if (record) {
            const res = `${record.flowInstance?record.flowInstance.businessModelRemark:""}`;
            return <span title={res}>{res}</span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'common_000221', desc: '任务发起人'}),
        dataIndex: 'creatorName',
        width: 200,
        render: (text, record, index) => {
          if (record) {
            const res = `${record.creatorName }【${record.creatorAccount}】`;
            return <span title={res}>{res}</span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'common_000222', desc: '任务到达时间'}),
        dataIndex: 'createdDate',
        width: 100,
        render: (text, record, index) => {
          if (record) {
            const res = `${countDate(record.createdDate)}`;
            return <span title={res}>{res}</span>;
          }
          return null;
        }
      }
    ];
  }

  render() {
    const {selectedRows, dataSource,handleRowSelectChange,handlePageChange,visible=false} = this.props;
    return (
      <>
      {visible &&  <SimpleTable
          rowsSelected={selectedRows}
          onSelectRow={handleRowSelectChange}
          data={dataSource}
          columns={this.getColumns()}
          pageChange={handlePageChange}
          defaultPageSize={50}
          pageSizeOptions={['50', '100', '200']}
        />}
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
        <Modal
                title={seiIntl.get({key: 'common_000253', desc: '驳回意见'})}
                bodyStyle={{maxHeight:"480px",overflow:"auto"}}
                visible={this.state.rejectModal}
                onOk={this.rejectHandle}
                onCancel={()=>{this.setState({rejectModal:false,opinion:''});this.currentRecord=null}}
                destroyOnClose={true}
                maskClosable={false}
            >
          <TextArea value={this.state.opinion} onChange={(e)=>this.setState({opinion:e.target.value})}/>
        </Modal>
        <ApproveHistory version="6" historyKey={this.state.historyKey} setHistoryKey={this.setHistoryKey}/>
      </>
    );
  }
}

export default TodoTask;
