import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Button, message, Input, Modal} from 'antd';
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import {updateStatusById, getAllList, save} from "./TaskMakeOverPowerService";
import {searchListByKeyWithTag} from "../../../commons/utils/CommonUtils";
import AddTaskMakeOverPowerModal from "./AddTaskMakeOverPowerModal";
import HeadBreadcrumb from "../../../commons/components/breadcrumb/HeadBreadcrumb";
import {seiLocale} from 'sei-utils';
import moment from 'moment';

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

  onRef = (ref) => {
    this.ref = ref
  };
  getDataSource = () => {
    this.props.show();
    getAllList().then(data => {
      if (data.success) {
        this.setState({data: data.data, selectedRows: [], searchValue: ""});
      }
    }).catch(e => {
    }).finally(() => {
      this.props.hide();
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
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            this.getDataSource();
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
    this.handleModalVisible(false)
  };

  handleSearch = (value) => {
    searchListByKeyWithTag(this.state.data, {keyword: value}, ["code", "name"]).then(data => {
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
        thiz.props.show();
        /*修改状态*/
        updateStatusById(params).then(result => {
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            thiz.getDataSource();
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
          }
        }).catch(e => {
        }).finally(() => {
          thiz.props.hide();
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
        title: seiIntl.get({key: 'flow_000291', desc: '当前用户'}),
        dataIndex: 'userName',
        width: 250
      },
      {
        title: seiIntl.get({key: 'flow_000292', desc: '代理用户'}),
        dataIndex: 'powerUserName',
        width: 250
      },
      {
        title: seiIntl.get({key: 'flow_000263', desc: '开始日期'}),
        dataIndex: 'powerStartDate',
        width: 200,
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
        width: 220,
        render: (text, record) => {
          if (record.powerEndDate) {
            return moment(record.powerEndDate).format("YYYY-MM-DD");
          } else {
            return "";
          }
        }
      },
      {
        title: seiIntl.get({key: 'flow_000270', desc: '启动状态'}),
        dataIndex: 'openStatus',
        width: 220,
        render: (text, record) => {
          if (record.openStatus == true) {
            return "启用"
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
        <Search
          key="search"
          placeholder={seiIntl.get({key: 'flow_000069', desc: '输入名称或代码进行查询'})}
          onSearch={value => this.handleSearch(value)}
          style={{width: 220}}
          allowClear
        />
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
)(TaskMakeOverPowerTable)



