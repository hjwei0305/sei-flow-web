/**
 * <p/>
 * 实现功能：减签功能
 * <p/>
 *
 * @author 何灿坤
 */
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {message, Input, Modal} from 'antd';
import SimpleTable from "../../../commons/components/SimpleTable";
import {hide, show} from "../../../configs/SharedReducer";
import {getAllCanDelSignList, setSubtractSignExecutorList} from "./SubtractSignService";
import {searchListByKeyWithTag} from "../../../commons/utils/CommonUtils";
import HeadBreadcrumb from "../../../commons/components/breadcrumb/HeadBreadcrumb";
import AssSignSelected from './SubtractSignSelected';
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;
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

  onRef = (ref) => {
    this.ref = ref
  };
  getDataSource = () => {
    this.props.show();
    getAllCanDelSignList().then(data => {
      this.setState({data, selectedRows: [], searchValue: ""});
    }).catch(e => {
    }).finally(() => {
      this.props.hide();
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
    thiz.props.show();
    setSubtractSignExecutorList(params).then(res => {
      if (res.status === 'SUCCESS') {
        this.currentRecord = null;
        this.selectedOne = null;
        message.success(res.message);
        thiz.getDataSource();
      } else {
        message.error(res.message);
      }
    }).catch(e => {
    }).finally(() => {
      thiz.props.hide();
    });
    this.setState({selectUserModal: false});
  };
  handleRowSelectChange = (selectedRows) => {
    this.setState({selectedRows})
  };
  handleSearch = (value) => {
    searchListByKeyWithTag(this.state.data, {keyword: value}, ["flowDefKey", "flowName", "nodeKey", "nodeName", "businessCode", "businessName"]).then(data => {
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
              <a className={'row-operator-item'}  onClick={() => {
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
        title: seiIntl.get({key: 'flow_000063', desc: '流程定义key'}),
        dataIndex: 'flowDefKey',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000047', desc: '流程名称'}),
        dataIndex: 'flowName',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000064', desc: '流程节点key'}),
        dataIndex: 'nodeKey',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000065', desc: '流程节点名称'}),
        dataIndex: 'nodeName',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000066', desc: '业务单据编号'}),
        dataIndex: 'businessCode',
        width: 200,
      },
      {
        title: seiIntl.get({key: 'flow_000067', desc: '业务单据名称'}),
        dataIndex: 'businessName',
        width: 200,
      },
      {
        title: seiIntl.get({key: 'flow_000068', desc: '业务摘要'}),
        dataIndex: 'businessModelRemark',
        width: 200,
      }
    ];

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
            title={`{seiIntl.get({key: 'flow_000070', desc: '会签减签'})}`}
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
            <AssSignSelected type='checkbox' actInstanceId={this.state.currentActInstanceId}
                             taskActKey={this.state.currentTaskActKey}
                             selectChange={(ids) => this.selectedOne = ids}/>
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
)(SubtractSignTable)



