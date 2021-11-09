/**
 * <p/>
 * 实现功能：替换固化执行人（管理员）
 * <p/>
 *
 * @author 何灿坤
 */
import React, {Component} from 'react'
import {connect} from 'dva'
import {Modal, message, Input, Col, Button, Row} from 'antd';
import SimpleTable from "@/components/SimpleTable";
import {getSolidifyFlowInstanceByUserId, replaceSolidifyExecutorByVo} from "./ReplaceSolidifyExecutorService";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import ReplaceSolidifyExecutorSelected from './ReplaceSolidifyExecutorSelected';
import {seiLocale} from 'sei-utils';
import {commonUtils,} from '@/utils';

const {searchListByKeyWithTag} = commonUtils;
const {seiIntl} = seiLocale;
const Search = Input.Search;
const confirm = Modal.confirm;

class ReplaceSolidifyExecutorTable extends Component {
  selectedOldId = null;
  selectedNewId = null;

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectedRows: [],
      selectUserModal: false,
      pageInfo: null,
      searchValue: "",
      userType: "",
      selectedOldName: "",
      replaceDisabled: true
    };
  }

  componentWillMount() {
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

  getDataSource = (params = {}) => {
    getSolidifyFlowInstanceByUserId(this.selectedOldId).then(data => {
      if (data.success) {
        this.setState({data: data.data, selectedRows: [], searchValue: this.state.searchValue});
      } else {
        message.error(data.message);
      }
    });
  };

  handleRowSelectChange = (selectedRows) => {
    this.setState({selectedRows});
    if (selectedRows.length > 0) {
      this.setState({replaceDisabled: false});
    } else {
      this.setState({replaceDisabled: true});
    }
  };

  handleSearch = (value) => {
    searchListByKeyWithTag(this.state.data, {keyword: value}, ["flowName", "businessCode"]).then(data => {
      this.setState({data, searchValue: value});
    })
  };

  okHandle = () => {
    if (this.state.userType === "old") {
      if (this.selectedOldId == null) {
        message.warn(seiIntl.get({key: 'flow_000341', desc: '请选择需要被替换的人员！'}));
        return;
      } else {
        this.toggoleGlobalLoading(true);
        this.getDataSource();
        this.toggoleGlobalLoading(false);
      }
    } else if (this.state.userType === "new") {
      if (this.selectedNewId == null) {
        message.warn(seiIntl.get({key: 'flow_000340', desc: '请选择替换的人员！'}));
        return;
      } else {
        confirm({
          title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
          content: seiIntl.get({key: 'flow_000339', desc: '替换后不可恢复，是否确定替换？'}),
          okText: seiIntl.get({key: "flow_000258", desc: "确定"}),
          cancelText: seiIntl.get({key: "flow_000259", desc: "取消"}),
          onCancel: () => {
          },
          onOk: () => {
            this.toggoleGlobalLoading(true);
            replaceSolidifyExecutorByVo(this.selectedOldId, this.selectedNewId, this.state.selectedRows.map(row => row.businessId)).then(data => {
              if (data.success) {
                message.success(data.message ? data.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
                this.getDataSource();
                this.setState({selectedRows:[],replaceDisabled: true});
              } else {
                message.error(data.message);
              }
            }).catch(e => {
            }).finally(() => {
              this.toggoleGlobalLoading(false);
            });
          }
        });
      }
    }
    this.setState({selectUserModal: false});
  };

  selectOldUser = () => {
    this.selectedOldId = null;
    this.setState({selectUserModal: true, userType: "old"});
  };

  selectNewUser = () => {
    this.selectedNewId = null;
    this.setState({selectUserModal: true, userType: "new"});
  };

  userSelectChange = (rightData) => {
    if (this.state.userType === "old") {
      this.selectedOldId = rightData[0].id;
      this.setState({selectedOldName: rightData[0].userName});
    } else if (this.state.userType === "new") {
      this.selectedNewId = rightData[0].id;
    }
  }


  render() {
    const columns = [
      {
        title: seiIntl.get({key: 'flow_000047', desc: '流程名称'}),
        dataIndex: 'flowName',
        width: 250
      },
      {
        title: seiIntl.get({key: 'flow_000076', desc: '业务编号'}),
        dataIndex: 'businessCode',
        width: 180
      },
      {
        title: seiIntl.get({key: 'flow_000105', desc: '工作说明'}),
        dataIndex: 'businessModelRemark',
        width: 360
      },
      {
        title: seiIntl.get({key: 'flow_000106', desc: '开始时间'}),
        dataIndex: 'startDate',
        width: 180
      },
      {
        title: seiIntl.get({key: 'flow_000108', desc: '流程状态'}),
        dataIndex: 'ended',
        width: 120,
        render: (text, record) => {
          if (record.manuallyEnd) {
            return seiIntl.get({key: 'flow_000104', desc: '强制终止'})
          } else if (record.ended) {
            return seiIntl.get({key: 'flow_000109', desc: '结束'})
          } else {
            return seiIntl.get({key: 'flow_000110', desc: '处理中'})
          }
        }
      }
    ];


    const title = () => {
      return [
        <Row gutter={40}>
          <Col span={10}>
            <Input id={"oldUser"} disabled style={{width: "100%"}} value={this.state.selectedOldName}/>
          </Col>
          <Col span={6}>
            <Button disabled={false} type="primary" onClick={this.selectOldUser}>{seiIntl.get({
              key: 'flow_000337',
              desc: '原执行人'
            })}</Button>
          </Col>
          <Col span={1}>
            <Button disabled={this.state.replaceDisabled} type="primary" onClick={this.selectNewUser}>{seiIntl.get({
              key: 'flow_000338',
              desc: '替换'
            })}</Button>
          </Col>
        </Row>
      ]
    };


    //表头搜索框
    const search = () => {
      return [
        <Search
          key="search"
          placeholder={seiIntl.get({key: 'common_000051', desc: '输入代码或名称查询'})}
          onSearch={value => this.handleSearch(value)}
          style={{width: 220}}
          allowClear
        />
      ]
    };


    const {data, selectedRows, userType, searchValue} = this.state;
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
            checkBox={true}
          />
          <Modal
            title={userType === "new" ? seiIntl.get({
              key: 'flow_000336',
              desc: '新执行人'
            }) : seiIntl.get({key: 'flow_000337', desc: '原执行人'})}
            bodyStyle={{maxHeight: "720px", overflow: "auto"}}
            width={window.innerWidth * 0.8}
            visible={this.state.selectUserModal}
            onOk={this.okHandle}
            onCancel={() => {
              this.setState({selectUserModal: false});
            }}
            destroyOnClose={true}
            maskClosable={false}
          >
            <ReplaceSolidifyExecutorSelected type='radio'
                                             selectChange={(rightData) => this.userSelectChange(rightData)}/>
          </Modal>
        </div>
      </HeadBreadcrumb>

    )
  }
}

const mapStateToProps = (state) => {
  return {};
};



export default connect(
  mapStateToProps
)(ReplaceSolidifyExecutorTable)



