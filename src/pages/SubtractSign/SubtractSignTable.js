/**
 * <p/>
 * 实现功能：减签功能
 * <p/>
 *
 * @author 何灿坤
 */
import React, {Component} from 'react'
import {connect} from 'dva'
import {Input, Modal, Tooltip} from 'antd';
import {message} from 'suid';
import SimpleTable from "@/components/SimpleTable";
import {getAllCanDelSignList, setSubtractSignExecutorList} from "./SubtractSignService";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import SubtractSignSelected from './SubtractSignSelected';
import {commonUtils,} from '@/utils';
import {seiLocale} from 'sei-utils';

const {searchListByKeyWithTag} = commonUtils;
const {seiIntl} = seiLocale;
const Search = Input.Search;

class SubtractSignTable extends Component {

  selectedOne = null;
  currentRecord = null;


  constructor(props) {
    super(props);
    this.state = {
      data: [],
      modalVisible: false,
      selectedRows: [],
      selectUserModal: false,
      searchValue: "",
      currentActInstanceId: "",
      currentTaskActKey: "",
      isAdd: false
    };
  }

  componentWillMount() {
    this.getDataSource();
  };

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
    getAllCanDelSignList().then(data => {
      this.setState({data, selectedRows: [], searchValue: ""});
    }).catch(e => {
    }).finally(() => {
      this.toggoleGlobalLoading(false);
    })
  };
  okHandle = () => {
    let thiz = this;
    let params = {};
    if (this.selectedOne === null || this.selectedOne === []) {
      message.warn(seiIntl.get({key: 'flow_000061', desc: '没有实际减签的人！'}));
    }
    Object.assign(params, {
      actInstanceId: this.state.currentActInstanceId,
      taskActKey: this.state.currentTaskActKey,
      userIds: this.selectedOne.toString()
    });
    thiz.toggoleGlobalLoading(true);
    setSubtractSignExecutorList(params).then(res => {
      if (res.success) {
        this.currentRecord = null;
        this.selectedOne = null;
        message.success(res.message);
        thiz.getDataSource();
      } else {
        message.error(res.message);
      }
    }).catch(e => {
    }).finally(() => {
      thiz.toggoleGlobalLoading(false);
    });
    this.setState({selectUserModal: false});
  };
  handleRowSelectChange = (selectedRows) => {
    this.setState({selectedRows})
  };
  handleSearch = (value) => {
    searchListByKeyWithTag(this.state.data, {keyword: value}, ["flowName", "nodeName", "businessCode", "executorNameList"]).then(data => {
      this.setState({data, searchValue: value});
    })
  };

  render() {
    const columns = [
      {
        title: seiIntl.get({key: 'flow_000030', desc: '操作'}),
        width: 120,
        dataIndex: "operator",
        render: (text, record, index) => {
          return (
            <div className={'row-operator'} key={"operator" + index} onClick={(e) => {
              e.stopPropagation()
            }}>
              <a className={'row-operator-item'} onClick={() => {
                this.currentRecord = record;
                this.setState({
                  selectUserModal: true,
                  currentActInstanceId: record.actInstanceId,
                  currentTaskActKey: record.nodeKey
                });
              }}>{seiIntl.get({key: 'flow_000062', desc: '减签'})}</a>
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
        dataIndex: 'nodeName',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000132', desc: '业务单号'}),
        dataIndex: 'businessCode',
        width: 200,
      },
      {
        title: seiIntl.get({key: 'flow_000050', desc: '执行人名称'}),
        dataIndex: 'executorNameList',
        width: 220
      },
      {
        title: seiIntl.get({key: 'flow_000105', desc: '工作说明'}),
        dataIndex: 'businessModelRemark',
        width: 320,
      }
    ];

    //表头搜索框
    const search = () => {
      return [
        <Tooltip title={seiIntl.get({key: 'flow_000315', desc: '流程名称、任务名称、业务单号、执行人名称'})}>
          <Search
            key="search"
            placeholder={seiIntl.get({key: 'flow_000040', desc: '输入关键字搜索'})}
            onSearch={value => this.handleSearch(value)}
            style={{width: 220}}
            allowClear
          />
        </Tooltip>
      ]
    };
    const {searchValue, data, selectedRows} = this.state;
    return (

      <HeadBreadcrumb>
        <div className={"tbar-table"}>
          <div className={'tbar-box'}>
            <div className={'tbar-btn-box'}></div>
            <div className={'tbar-search-box'}>{search()}</div>
          </div>
          <SimpleTable
            rowsSelected={selectedRows}
            onSelectRow={this.handleRowSelectChange}
            data={searchValue ? data.filter(item => item.tag === true) : data}
            columns={columns}
          />
          <Modal
            title={seiIntl.get({key: 'flow_000070', desc: '会签减签'})}
            bodyStyle={{maxHeight: "720px", overflow: "auto"}}
            width={window.innerWidth * 0.8}
            visible={this.state.selectUserModal}
            onOk={this.okHandle}
            onCancel={() => {
              this.setState({selectUserModal: false});
              this.currentRecord = null
            }}
            destroyOnClose={true}
            maskClosable={false}
          >
            <SubtractSignSelected type='checkbox' actInstanceId={this.state.currentActInstanceId}
                                  taskActKey={this.state.currentTaskActKey}
                                  selectChange={(ids) => this.selectedOne = ids}/>
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
)(SubtractSignTable)



