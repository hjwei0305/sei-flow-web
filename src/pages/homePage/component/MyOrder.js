/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/15
 */
import React, { Component } from 'react';
// import SimpleTable from "../../../commons/components/SimpleTable";
import StandardDropdown from "@/components/StandardDropdown";
import {ApproveHistory, OptGroup, SimpleTable } from 'seid';
import {Modal,message} from 'antd';
import {endTask} from '../service';
import { mainTabAction } from 'sei-utils';
import { seiLocale } from 'sei-utils';

const { seiIntl } = seiLocale;
const confirm = Modal.confirm
class MyOrder extends Component {

  state = {
    historyKey: '',
    instanceKey:''
  }

  handleHistory = (record) => {
    this.setState({ historyKey: record.businessId,instanceKey:record.flowInstanceId })
  }

  setHistoryKey = (id) => {
    this.setState({ historyKey: id })
  }

  handleDetail = (data) => {
    let uri = data.lookUrl;
    let url = data.webBaseAddressAbsolute.replace(/\/$/g, '') + '/' + uri.replace(/^\//g, '');
    if (url.indexOf('?') === -1) {
      url = `${url}?id=${data.businessId}`
    } else {
      url = `${url}&id=${data.businessId}`
    }
    mainTabAction.tabOpen({ id: data.businessId, name: seiIntl.get({key: 'common_000223', desc: '查看表单'}), featureUrl: url })
  }

  handleEnd=(record)=>{
    let thiz = this
    confirm({
	    title: seiIntl.get({key: 'tips', desc: '温馨提示'}),
	    content: `您确定要终止【${record.businessCode}】吗？`,
	    onOk: () => {
          endTask(record.flowInstanceId).then(res=>{
            if(res.status==='SUCCESS'){
              message.success(seiIntl.get({key: 'common_000235', desc: '流程终止成功'}))
              thiz.props.refresh();
            }else{
              message.error(res.message)
            }
          })
	    }
	  });
  }

  getColumns = (selectOrderType) => {

    const  showData = [{
      title: seiIntl.get({key: 'operation', desc: '操作'}),
      width: 180,
      dataIndex: "operator",
      render: (text, record, index) => {
        //终止
        let endFlowHtml = record.canManuallyEnd
        const optList = [];

        if(endFlowHtml){
          optList.push({
            title: seiIntl.get({key: 'common_000236', desc: '终止'}),
            onClick: ()=>this.handleEnd(record),
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
      }
    },
      {
        title: seiIntl.get({key: 'common_000219', desc: '单号'}),
        dataIndex: 'businessCode',
        width: 110,
        sorter:true,
        render: (text, record, index) => {
          if (text) {
            return <span title={text}> {text} </span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'common_000237', desc: '单据名称'}),
        dataIndex: 'businessName',
        width: 200,
        render: (text, record, index) => {
          if (text) {
            return <span title={text}> {text} </span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'common_000220', desc: '说明'}),
        dataIndex: 'businessModelRemark',
        width: 250,
        render: (text, record, index) => {
          if (text) {
            return <span title={text}>{text}</span>;
          }
          return null;
        }
      },
      // {
      //   title: seiIntl.get({key: 'basic_0011146', desc: '流程发起人'}),
      //   dataIndex: 'creatorName',
      //   width: 200,
      //   render: (text, record, index) => {
      //     if (record) {
      //       const res = `${record.creatorName}【${record.creatorAccount}】`;
      //       return <span title={res}>{res}</span>;
      //     }
      //     return null;
      //   }
      // },
      {
        title: seiIntl.get({key: 'common_000238', desc: '发起时间'}),
        dataIndex: 'createdDate',
        sorter:true,
        width: 200,
        render: (text, record, index) => {
          if (text) {
            return <span title={text}> {text} </span>;
          }
          return null;
        }
      }
     ];

    if(selectOrderType==="all"){
      showData.push({
        title: seiIntl.get({key: 'common_001096', desc: '流程状态'}),
        dataIndex: 'flowState',
        width: 200,
        render: (text, record, index) => {
          if(!record.ended){
            return <span title='流程中'>流程中</span>;
          }else if(record.ended&&record.manuallyEnd){
            return <span title='异常结束'>异常结束</span>;
          }else if(record.ended&&!record.manuallyEnd){
            return <span title='正常完成'>正常完成</span>;
          }
          return null;
        }
      });
      showData.push({
        title: seiIntl.get({key: 'common_001094', desc: '任务处理人'}),
        dataIndex: 'taskExecutors',
        width: 200,
        render: (text, record, index) => {
          if(!record.ended){
            let textString = text.replace("anonymous【anonymous】","待分配执行人");
            return <span title={textString}>{textString}</span>;
          }
          return null;
        }
      });
      showData.push({
        title: seiIntl.get({key: 'common_001093', desc: '结束时间'}),
        dataIndex: 'endDate',
        sorter:true,
        width: 200,
        render: (text, record, index) => {
          if(record.ended&&text){
            return <span title={text}> {text} </span>;
          }
          return null;
        }
      });

    }else if(selectOrderType==="inFlow"){

      showData.push({
        title: seiIntl.get({key: 'common_001094', desc: '任务处理人'}),
        dataIndex: 'taskExecutors',
        width: 200,
        render: (text, record, index) => {
          if(!record.ended){
            let textString = text.replace("anonymous【anonymous】","待分配执行人");
            return <span title={textString}>{textString}</span>;
          }
          return null;
        }
      });

    }else if(selectOrderType==="ended"||selectOrderType==="abnormalEnd"){

      showData.push({
        title: seiIntl.get({key: 'common_001093', desc: '结束时间'}),
        dataIndex: 'endDate',
        width: 200,
        render: (text, record, index) => {
          if(record.ended&&text){
            return <span title={text}> {text} </span>;
          }
          return null;
        }
      });

    }

    return showData;
  }

  render() {
    const { selectedRows, dataSource, handleRowSelectChange,selectOrderType, handlePageChange ,onChange, visible = false } = this.props;
    return (
      <>
        {visible && <SimpleTable
          rowsSelected={selectedRows}
          onSelectRow={handleRowSelectChange}
          data={dataSource}
          columns={this.getColumns(selectOrderType)}
          // pageChange={handlePageChange}
          onChange={onChange}
          defaultPageSize={50}
          pageSizeOptions={['50', '100', '200']}
        />}
        <ApproveHistory historyKey={this.state.historyKey} instanceKey ={this.state.instanceKey} setHistoryKey={this.setHistoryKey} />
      </>
    );
  }
}

export default MyOrder;
