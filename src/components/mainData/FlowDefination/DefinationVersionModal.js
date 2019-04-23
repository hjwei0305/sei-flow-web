/**
 * @description 配置服务地址
 * @author 李艳
 */

import React, {Component} from 'react'
import connect from "react-redux/es/connect/connect";
import {Button, Col, Row, message,Modal} from 'antd';
import {show, hide} from '../../../configs/SharedReducer'
import SimpleTable from "../../../commons/components/SimpleTable";
import {Input} from "antd/lib/index";
import {activateOrFreezeFlowDef, activateOrFreezeFlowVer, listFlowDefinationHistory} from "./FlowDefinationService";
import DefinaionModal from "./DefinaionModal";
import StandardDropdown from "../../../commons/components/StandardDropdown";

const Search = Input.Search;
const confirm=Modal.confirm;
class DefinationVersionModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            modalVisible: false,
            confirmLoading: false,
            selectedRows: [],
            isAdd: false,
            searchValue:"",
            loading:false
        };
    }

    componentWillMount() {
        this.getDataSource();
    }

    getDataSource = (params={}) => {
        let {flowDefinationId}=this.props;
        Object.assign(params,{filters:[{
                fieldName:"flowDefination.id",//筛选字段
                operator:"EQ",//操作类型
                value:`${flowDefinationId}`,//筛选值
                fieldType:"String"//筛选类型
            }]});
        this.setState({loading:true});
        listFlowDefinationHistory(params).then(data => {
            this.setState({data})
        }).catch(e => {
        }).finally(() => {
            this.setState({loading:false});
        })
    };

    handleRowSelectChange = (selectedRows) => {
        this.setState({selectedRows})
    };

    refClick = () => {
        if (!this.judgeSelected()) return;
      this.setState({editData: this.state.selectedRows[0]});
      this.setState({operator: "versionRef",definationModalVisible:true})
    };
    checkClick = (record) => {
      this.setState({editData: record});
      this.setState({operator: "versionView",definationModalVisible:true})
    };
    editClick = (record) => {
      this.setState({editData: record});
      this.setState({operator: "versionEdit",definationModalVisible:true})
    };
    judgeSelected = () => {
        if (this.state.selectedRows.length === 0) {
            message.error("请选择一行数据！");
            return false
        }
        return true
    };

    handleSearch = (value) => {
        this.setState({searchValue:value});
        this.getDataSource({quickSearchValue:value});
    };
    pageChange = (pageInfo) => {
        this.setState({
            pageInfo:pageInfo,
        });
        this.getDataSource({quickSearchValue:this.state.searchValue,pageInfo})
    };
  onActivateOrFreezeFlowDefClick = (record) => {
    let id = record.id;
    let status = '';
    let title = '';
    if (record.flowDefinationStatus !== "INIT") {
      if (record.flowDefinationStatus === 'Activate') {
        status = 'Freeze';
        title = '您确定要冻结吗？'
      } else if (record.flowDefinationStatus === 'Freeze') {
        status = 'Activate';
        title = '您确定要激活吗？'
      }
    }
    let thiz = this;
    confirm({
      title: title,
      onOk() {
        thiz.setState({loading: true});
        activateOrFreezeFlowVer(id, status).then(result => {
          if (result.status === 'SUCCESS') {
            message.success(result.message ? result.message : "请求成功");
            //刷新本地数据
            thiz.getDataSource()
          } else {
            message.error(result.message ? result.message : "请求失败");
          }
        }).catch(e => {
        }).finally(() => {
          thiz.setState({loading: false});
        })
      }
    });
  };
  handleModalCancel = () => {
    this.setState({definationModalVisible:false})
    //刷新本地数据
    this.getDataSource()
  };
    render() {
        const columns = [
          {
            title: "操作",
            width: 180,
            dataIndex: "operator",
            render: (text, record, index) => {
              let ops = () => {
                let ops = [];
                ops.push(<a className={'row-operator-item'} key={"edit" + index}
                            onClick={() => this.editClick(record)}>编辑</a>);
                ops.push(<a className={'row-operator-item'} key={"checkClick" + index}
                            onClick={() => this.checkClick(record)}>查看流程定义</a>);
                let statusText = '';
                if (record && record.flowDefinationStatus !== "INIT") {
                  if (record.flowDefinationStatus === 'Activate') {
                    statusText = '冻结'
                  } else if (record.flowDefinationStatus === 'Freeze') {
                    statusText = '激活'
                  }
                  ops.push(<a className={'row-operator-item'} key={"configWorkPage" + index}
                              onClick={() => this.onActivateOrFreezeFlowDefClick(record)}>{statusText}</a>);
                }
                return ops;
              }
              return (
                <div className={'row-operator'} onClick={(e) => {
                  e.stopPropagation()
                }}>
                  <StandardDropdown operator={ops()}/>
                </div>
              )
            }
          },
            {
                title: '名称',
                dataIndex: 'name',
                width: 200
            },
            {
                title: '定义KEY',
                dataIndex: 'defKey',
                width: 200
            },
            {
                title: '版本号',
                dataIndex: 'version',
                width: 120
            },
            {
                title: '优先级',
                dataIndex: 'priority',
                width: 120
            },
            {
                title: '流程定义状态',
                dataIndex: 'flowDefinationStatus',
                width: 120,
                render(text,record){
                    if('INIT' === text){
                        return '未发布';
                    }else if('Activate' === text){
                        return '激活';
                    }
                    else if('Freeze' === text){
                        return '冻结';
                    }
                    return "";
                }
            },
            {
                title: '描述',
                dataIndex: 'depict',
                width: 120
            },
        ];
        const title = () => {
            return [
                <Button key="refAdd" style={{marginRight: '8px'}}
                        onClick={this.refClick}>参考创建</Button>,
            ]
        };

        //表头搜索框
        const search = () => {
            return [
                <Search
                    key="search"
                    placeholder="输入代码或名称查询"
                    onSearch={value => this.handleSearch(value)}
                    style={{ width: 230}}
                    allowClear
                />
            ]
        };
        const {definationModalVisible,selectedRows,data,editData,operator}=this.state;
        const {modalVisible,handleCancel,selectedNode} = this.props;
        return (
            <Modal title={"流程定义版本管理"}
                   visible={modalVisible}
                   width={700}
                   maskClosable={false}
                   onCancel={handleCancel}
                   bodyStyle={{maxHeight:500}}
                   footer={false}
            >
                <div  className={'tbar-box'}>
                    <div  className={'tbar-btn-box'}>{title()}</div>
                    <div  className={'tbar-search-box'}>{search()}</div>
                </div>
                    <SimpleTable
                        rowsSelected={selectedRows}
                        onSelectRow={this.handleRowSelectChange}
                        data={data}
                        columns={columns}
                        pageChange={this.pageChange}
                        loading={this.state.loading}
                    />
              {definationModalVisible && <DefinaionModal
                operator={operator}
                handleCancel={this.handleModalCancel}
                modalVisible={definationModalVisible}
                selectedNode={selectedNode ? selectedNode : {}}
                editData={editData ? editData : {}}
                flowDefinationId={editData ? editData.id : ""}
              />}
            </Modal>
        );
    }


}

const mapStateToProps = (state) => {
    return {};
}

const mapDispatchToProps = (dispatch) => {
    return {
        show: () => {
            dispatch(show())
        },
        hide: () => {
            dispatch(hide())
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DefinationVersionModal)


