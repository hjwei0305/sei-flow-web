import React, {Component} from 'react'
import {connect} from 'dva'
import {Button, Input, Modal, Tooltip} from 'antd';
import {message} from 'suid';
import SimpleTable from "@/components/SimpleTable";
import {updateStatusById, getAllList, save} from "./TaskMakeOverPowerService";
import AddTaskMakeOverPowerModal from "./AddTaskMakeOverPowerModal";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import {seiLocale} from 'sei-utils';
import moment from 'moment';
import {commonUtils} from '@/utils';

const {searchListByKeyWithTag,} = commonUtils;
const {seiIntl} = seiLocale;
const Search = Input.Search;
const confirm = Modal.confirm;


class TaskMakeOverPowerTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      modalVisible: false,
      confirmLoading: false,
      selectedRows: [],
      isAdd: false
    };
  }

  componentWillMount() {
    this.getDataSource()
  }

  toggoleGlobalLoading = (loading) => {
    const {dispatch,} = this.props;
    dispatch({
      type: 'global/updateState',
      payload: {
        globalLoading: loading,
      }
    });
  }

  onRef = (ref) => {
    this.ref = ref
  };
  getDataSource = () => {
    this.toggoleGlobalLoading(true);
    getAllList().then(data => {
      if (data.success) {
        this.setState({data: data.data, selectedRows: [], searchValue: ""});
      }
    }).catch(e => {
    }).finally(() => {
      this.toggoleGlobalLoading(false);
    })
  };

  handleRowSelectChange = (selectedRows) => {
    this.setState({selectedRows})
  };
  handleModalVisible = (modalVisible, isAdd) => {
    this.setState({modalVisible, isAdd})
  };
  addClick = () => {
    this.handleModalVisible(true, true)
  };
  editClick = (record) => {
    this.setState({editData: record});
    this.handleModalVisible(true, false)
  };
  handleSave = () => {
    this.ref.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let params = {}
        Object.assign(params, values);
        if (this.state.isAdd) {
          delete params.id;//新增时id==="",保存可能会出错，需删除id
        }
        this.setState({confirmLoading: true});
        save(params).then(result => {
          if (result.success) {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            this.getDataSource();
            //清空model数据
            this.ref.setStateNull();
            this.setState({confirmLoading: false, modalVisible: false});
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
            this.setState({confirmLoading: false});
          }
        }).catch(e => {
          this.setState({confirmLoading: false});
        })
      }
    });
  };

  handleModalCancel = () => {
    //清空model数据
    this.ref.setStateNull();
    this.handleModalVisible(false)
  };

  handleSearch = (value) => {
    searchListByKeyWithTag(this.state.data, {keyword: value}, ["userName", "userAccount", "powerUserName", "powerUserAccount"]).then(data => {
      this.setState({data, searchValue: value})
    })
  };

  updateStatusClick = (record) => {
    let thiz = this;
    let msg = "";
    if (record.openStatus == true) {
      msg = seiIntl.get({key: 'flow_000209', desc: '你确定要禁用吗？'});
    } else {
      msg = seiIntl.get({key: 'flow_000210', desc: '你确定要启用吗？'});
    }

    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: msg,
      onOk() {
        let params = {};
        params.id = record.id;
        thiz.toggoleGlobalLoading(true);
        /*修改状态*/
        updateStatusById(params).then(result => {
          if (result.success) {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            thiz.getDataSource();
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
          }
        }).catch(e => {
        }).finally(() => {
          thiz.toggoleGlobalLoading(false);
        })
      }
    });
  };

  render() {
    const columns = [
      {
        title: seiIntl.get({key: 'flow_000030', desc: '操作'}),
        width: 120,
        dataIndex: "operator",
        render: (text, record, index) => {
          if (record.openStatus == true) {
            return (
              <div className={'row-operator'} onClick={(e) => {
                e.stopPropagation()
              }}>
                <a className={'row-operator-item'}
                   onClick={() => this.editClick(record)}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</a>
                <a className={'row-operator-item'}
                   onClick={() => this.updateStatusClick(record)}>{seiIntl.get({key: 'flow_000208', desc: '禁用'})}</a>
              </div>
            )
          } else {
            return (
              <div className={'row-operator'} onClick={(e) => {
                e.stopPropagation()
              }}>
                <a className={'row-operator-item'}
                   onClick={() => this.editClick(record)}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</a>
                <a className={'row-operator-item'}
                   onClick={() => this.updateStatusClick(record)}>{seiIntl.get({key: 'flow_000207', desc: '启用'})}</a>
              </div>
            )
          }
        }
      },
      {
        title: seiIntl.get({key: 'flow_000295', desc: '授权类型'}),
        dataIndex: 'makeOverPowerType',
        width: 110,
        render: (text, record) => {
          if (record.makeOverPowerType == "sameToSee") {
            return "协办模式";
          } else if (record.makeOverPowerType == "turnToDo") {
            return "转办模式";
          } else {
            return "";
          }
        }
      },
      {
        title: seiIntl.get({key: 'flow_000291', desc: '授权用户'}),
        dataIndex: 'userName',
        width: 200,
        render: (text, record, index) => {
          if (record) {
            const res = `${record.userName}【${record.userAccount}】`;
            return <span title={res}>{res}</span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'flow_000292', desc: '代理用户'}),
        dataIndex: 'powerUserName',
        width: 200,
        render: (text, record, index) => {
          if (record) {
            const res = `${record.powerUserName}【${record.powerUserAccount}】`;
            return <span title={res}>{res}</span>;
          }
          return null;
        }
      },
      {
        title: seiIntl.get({key: 'flow_000041', desc: '应用模块'}),
        dataIndex: 'appModuleName',
        width: 130,
        render: (text, record) => {
          if (record.appModuleName) {
            return record.appModuleName;
          } else {
            return "--";
          }
        }
      },
      {
        title: seiIntl.get({key: 'flow_000054', desc: '业务实体'}),
        dataIndex: 'businessModelName',
        width: 130,
        render: (text, record) => {
          if (record.businessModelName) {
            return record.businessModelName;
          } else {
            return "--";
          }
        }
      },
      {
        title: seiIntl.get({key: 'flow_000056', desc: '流程类型'}),
        dataIndex: 'flowTypeName',
        width: 130,
        render: (text, record) => {
          if (record.flowTypeName) {
            return record.flowTypeName;
          } else {
            return "--";
          }
        }
      },
      {
        title: seiIntl.get({key: 'flow_000263', desc: '开始日期'}),
        dataIndex: 'powerStartDate',
        width: 130,
        render: (text, record) => {
          if (record.powerStartDate) {
            return moment(record.powerStartDate).format("YYYY-MM-DD");
          } else {
            return "";
          }
        }
      },
      {
        title: seiIntl.get({key: 'flow_000264', desc: '结束日期'}),
        dataIndex: 'powerEndDate',
        width: 130,
        render: (text, record) => {
          if (record.powerEndDate) {
            return moment(record.powerEndDate).format("YYYY-MM-DD");
          } else {
            return "";
          }
        }
      },
      // {
      //   title: seiIntl.get({key: 'flow_000293', desc: '授权文件'}),
      //   dataIndex: 'authorizationFile',
      //   width: 180,
      //   render: (text, record) => {
      //     return "无";
      //   }
      // },
      {
        title: seiIntl.get({key: 'flow_000270', desc: '启用状态'}),
        dataIndex: 'openStatus',
        width: 100,
        render: (text, record) => {
          if (record.openStatus == true) {
            return "启用";
          } else {
            return "禁用";
          }
        }
      }
    ];

    const title = () => {
      return [
        <Button type={"primary"} className={"primaryButton"} key="edit"
                onClick={this.addClick}>{seiIntl.get({key: 'flow_000039', desc: '新增'})}</Button>,
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Tooltip title={seiIntl.get({key: 'flow_000323', desc: '当前用户、代理用户'})}>
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
    const {editData, searchValue, data, selectedRows, isAdd, modalVisible, confirmLoading} = this.state;
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
            data={searchValue ? data.filter(item => item.tag === true) : data}
            columns={columns}
          />
        </div>
        <AddTaskMakeOverPowerModal
          isAdd={isAdd}
          modalVisible={modalVisible}
          confirmLoading={confirmLoading}
          handleOk={this.handleSave}
          handleCancel={this.handleModalCancel}
          onRef={this.onRef}
          defaultValue={editData ? editData : {}}/>
      </HeadBreadcrumb>
    )
  }
}

const mapStateToProps = ({}) => {
  return {};
};


export default connect(
  mapStateToProps,
)(TaskMakeOverPowerTable)



