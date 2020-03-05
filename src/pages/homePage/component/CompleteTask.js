/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/15
 */
import React, {Component} from 'react';
// import SimpleTable from "../../../commons/components/SimpleTable";
import StandardDropdown from "@/components/StandardDropdown";
import {ApproveHistory, OptGroup, SimpleTable, } from 'seid';
import {rollBackTo} from '../service';
import {Modal,Input,message} from 'antd';
import {mainTabAction} from 'sei-utils';
import { seiLocale } from 'sei-utils';

const { seiIntl } = seiLocale;
const confirm = Modal.confirm
const { TextArea } = Input;
class CompleteTask extends Component {


  state={
    historyKey:'',
    instanceKey:''
  }

  opinion='';

  opinionChange = (e) => {
    this.opinion=e.target.value;
  }

  handleHistory = (record) => {
    this.setState({historyKey:record.flowInstance.businessId,instanceKey:record.flowInstance.id})
  }

  setHistoryKey=(id)=>{
    this.setState({historyKey:id})
  }

  handleDetail = (data) =>{
    let uri = data.flowInstance.flowDefVersion.flowDefination.flowType.lookUrl;
    if (!uri) {
      uri = data.flowInstance.flowDefVersion.flowDefination.flowType.businessModel.lookUrl;
    }
    let url = data.webBaseAddressAbsolute.replace(/\/$/g,'')+'/'+uri.replace(/^\//g,'');
    if(url.indexOf('?') === -1){
      url=`${url}?id=${data.flowInstance.businessId}`
    } else {
      url=`${url}&id=${data.flowInstance.businessId}`
    }
    mainTabAction.tabOpen({id:data.flowInstance.businessId,name:seiIntl.get({key: 'common_000223', desc: '查看表单'}),featureUrl:url})
  }

  drawBack=(record)=>{
    let thiz = this
    confirm({
      title:seiIntl.get({key: 'common_000224', desc: '撤回原因'}),
      content: <TextArea placeholder={seiIntl.get({key: 'common_000225', desc: '请填写撤回原因'})} onChange={thiz.opinionChange} rows={2} />,
      onOk: () => {
        if (!this.opinion || this.opinion.trim() === '') {
          message.error(seiIntl.get({key: 'common_000225', desc: '请填写撤回原因'}))
          return;
        }
        rollBackTo(record.id,thiz.opinion).then(res=>{
          if(res.status==='SUCCESS'){
            message.success(seiIntl.get({key: 'common_000226', desc: '流程撤回成功'}));
            thiz.opinion=''
            this.props.refresh()
          }else{
            message.error(res.message)
          }
        })
      },
      onCancel: ()=>{
        thiz.opinion=''
      }
    });
  }


  getColumns = () => {
    return [
      {
        title: seiIntl.get({key: 'operation', desc: '操作'}),
        width: 180,
        dataIndex: "operator",
        render: (text, record, index) => {
          const optList = [];
          const buttons = [];
          if(record.canCancel==true&&record.taskStatus == "COMPLETED"&&record.flowInstance.ended == false){
            // buttons.push(<a className={'row-operator-item'} key="drawBack" onClick={() => this.drawBack(record)}>{seiIntl.get({key: 'common_000227', desc: '撤回'})}</a>);
            optList.push({
              title: seiIntl.get({key: 'common_000227', desc: '撤回'}),
              onClick: () => this.drawBack(record),
            });
          }
          optList.push({
            title: seiIntl.get({key: 'common_000228', desc: '查看'}),
            onClick: () => this.handleDetail(record),
          }, {
            title: seiIntl.get({key: 'common_000229', desc: '流程历史'}),
            onClick: () => this.handleHistory(record),
          });

          return (<OptGroup optList={optList} />);

  /*        buttons.push( <a className={'row-operator-item'} key="detail" onClick={() => this.handleDetail(record)}>{seiIntl.get({key: 'common_000228', desc: '查看'})}</a>,
          <a className={'row-operator-item'} key="history" onClick={() => this.handleHistory(record)}>{seiIntl.get({key: 'common_000229', desc: '流程历史'})}</a>)
          return (
            <div className={'row-operator'} onClick={(e) => {
              e.stopPropagation()
            }}>
              <StandardDropdown
                operator={buttons}
              />
            </div>
          )*/
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
        dataIndex: 'flowTaskName',
        width: 200,
        render: (text, record, index) => {
          if (text) {
            return <span title={text}>{text}</span>;
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
            return <span title={res}>{res}</span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'common_000234', desc: '有效性'}),
        dataIndex: 'validity',
        width: 250,
        render: (text, record, index) => {
          if (record) {
            if(record.flowExecuteStatus=="end"||record.flowExecuteStatus=="auto"){
              return <span title='记录数据'>记录数据</span>;
            }else{
              return <span title='有效数据'>有效数据</span>;
            }
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
        title: seiIntl.get({key: 'basic_0011146', desc: '流程发起人'}),
        dataIndex: 'creatorName',
        width: 200,
        render: (text, record, index) => {
          if (record) {
            const res = `${record.flowInstance.creatorName }【${record.flowInstance.creatorAccount}】`;
            return <span title={res}>{res}</span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'common_000230', desc: '处理时间'}),
        dataIndex: 'actEndTime',
        width: 200,
        render: (text, record, index) => {
            return <span title={text}>{text}</span>;
        }
      }
    ];
  }

  render() {
    const {selectedRows, dataSource,handleRowSelectChange,handlePageChange, visible=false} = this.props;
    return (
      <>
        {visible && <SimpleTable
          rowsSelected={selectedRows}
          rowKey={'businessId'}
          onSelectRow={handleRowSelectChange}
          data={dataSource}
          columns={this.getColumns()}
          pageChange={handlePageChange}
          defaultPageSize={50}
          pageSizeOptions={['50', '100', '200']}
        />}
        <ApproveHistory version="6" historyKey={this.state.historyKey} instanceKey={this.state.instanceKey} setHistoryKey={this.setHistoryKey}/>
      </>
    );
  }
}

export default CompleteTask;
