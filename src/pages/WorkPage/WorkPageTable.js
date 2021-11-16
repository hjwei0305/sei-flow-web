/**
 * <p/>
 * 实现功能：工作界面配置
 * <p/>
 *
 * @author 李艳
 */
import React, {Component} from 'react'
import {connect} from 'dva'
import {Button, Input, Modal, Tooltip} from 'antd';
import {message} from 'suid';
import SimpleTable from "@/components/SimpleTable";
import {deleteCorp, getWorkPage, save} from "./WorkPageService";
import SearchTable from "@/components/SearchTable";
import WorkPageModal from "./WorkPageModal";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import {seiLocale} from 'sei-utils';
import {appModuleConfig,} from '@/utils/CommonComponentsConfig';

const {seiIntl} = seiLocale;
const Search = Input.Search;
const confirm = Modal.confirm;

class WorkPageTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      modalVisible: false,
      confirmLoading: false,
      selectedRows: [],
      isAdd: false,
      pageInfo: null,
      searchValue: "",
      appModule: {}
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

  onRef = (ref) => {
    this.ref = ref
  };
  getDataSource = (params) => {
    this.toggoleGlobalLoading(true);
    getWorkPage(params).then(data => {
      this.setState({data, selectedRows: [], searchValue: ""})
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
    const {appModule} = this.state;
    if (appModule && appModule.id) {
      this.handleModalVisible(true, true)
    } else {
      message.error(seiIntl.get({key: 'flow_000024', desc: '请选择应用模块！'}))
    }

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
        if (this.state.isAdd)
          delete params.id;//新增时id==="",保存可能会出错，需删除id
        this.setState({confirmLoading: true});
        save(params).then(result => {
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            this.getDataSource({
              quickSearchValue: this.state.searchValue,
              pageInfo: this.state.pageInfo,
              filters: [{
                fieldName: "appModuleId",//筛选字段
                operator: "EQ",//操作类型
                value: `${this.state.appModule.id}`,//筛选值
                fieldType: "String"//筛选类型
              }]
            });
            this.setState({confirmLoading: false, modalVisible: false});
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
            this.setState({confirmLoading: false});
          }
        }).catch(e => {
          this.setState({confirmLoading: false});
        })
      }
    })
  };
  judgeSelected = () => {
    if (this.state.selectedRows.length === 0) {
      message.error(seiIntl.get({key: 'flow_000027', desc: '请选择一行数据！'}));
      return false
    }
    return true
  };

  handleModalCancel = () => {
    this.handleModalVisible(false)
  };

  handleSearch = (value) => {
    this.setState({searchValue: value});
    this.getDataSource({
      quickSearchValue: value,
      pageInfo: this.state.pageInfo,
      filters: [{
        fieldName: "appModuleId",//筛选字段
        operator: "EQ",//操作类型
        value: `${this.state.appModule.id}`,//筛选值
        fieldType: "String"//筛选类型
      }]
    });
  };

  deleteClick = (record) => {
    let thiz = this;
    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: seiIntl.get({key: 'flow_000029', desc: '删除后不可恢复，是否确定删除？'}),
      onOk() {
        let params = {};
        params = record.id;
        thiz.toggoleGlobalLoading(true);
        deleteCorp(params).then(result => {
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            thiz.getDataSource({
              quickSearchValue: thiz.state.searchValue, pageInfo: thiz.state.pageInfo, filters: [{
                fieldName: "appModuleId",//筛选字段
                operator: "EQ",//操作类型
                value: `${thiz.state.appModule.id}`,//筛选值
                fieldType: "String"//筛选类型
              }]
            });
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
  selectChange = (record) => {
    this.setState({appModule: record});
    this.getDataSource({
      quickSearchValue: this.state.searchValue,
      pageInfo: this.state.pageInfo,
      filters: [{
        fieldName: "appModuleId",//筛选字段
        operator: "EQ",//操作类型
        value: `${record.id}`,//筛选值
        fieldType: "String"//筛选类型
      }]
    });
  };
  pageChange = (pageInfo) => {
    this.setState({
      pageInfo: pageInfo,
    });
    this.getDataSource({
      quickSearchValue: this.state.searchValue,
      pageInfo: pageInfo,
      filters: [{
        fieldName: "appModuleId",//筛选字段
        operator: "EQ",//操作类型
        value: `${this.state.appModule.id}`,//筛选值
        fieldType: "String"//筛选类型
      }]
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
            <div className={'row-operator'} onClick={(e) => {
              e.stopPropagation()
            }}>
              <a className={'row-operator-item'} key={"edit" + index}
                 onClick={() => this.editClick(record)}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</a>
              <a className={'row-operator-item'} key={"delete" + index}
                 onClick={() => this.deleteClick(record)}>{seiIntl.get({key: 'flow_000032', desc: '删除'})}</a>
            </div>
          )
        }
      },
      {
        title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
        dataIndex: 'name',
        width: 260
      },
      {
        title: seiIntl.get({key: 'flow_000033', desc: 'URL地址'}),
        dataIndex: 'url',
        width: 360
      },
      {
        title: seiIntl.get({key: 'flow_000223', desc: '移动端地址'}),
        dataIndex: 'phoneUrl',
        width: 320
      },
      {
        title: seiIntl.get({key: 'flow_000034', desc: '必须提交'}),
        dataIndex: 'mustCommit',
        width: 100,
        render: (text, record) => {
          if (record.mustCommit) {
            return seiIntl.get({key: 'flow_000035', desc: '是'})
          } else {
            return seiIntl.get({key: 'flow_000036', desc: '否'})
          }
        }
      },
      {
        title: seiIntl.get({key: 'flow_000037', desc: '描述'}),
        dataIndex: 'depict',
        width: 400,
      },
    ];

    const title = () => {
      return [
        <span key={"select"} className={"primaryButton"}>{seiIntl.get({key: 'flow_000038', desc: '应用模块：'})}
          <SearchTable
            key="searchTable"
            initValue={true}
            isNotFormItem={true} config={appModuleConfig}
            style={{width: 220}}
            selectChange={this.selectChange}/>
                </span>,
        <Button key={"add"} className={"primaryButton"} onClick={this.addClick}
                type={"primary"}>{seiIntl.get({key: 'flow_000039', desc: '新增'})}</Button>,
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Tooltip title={seiIntl.get({key: 'flow_000316', desc: '名称、URL地址、描述'})}>
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
    const {editData, data, selectedRows, isAdd, modalVisible, confirmLoading, appModule} = this.state;
    return (
      <HeadBreadcrumb>
        <div>
          <div className={'tbar-box'}>
            <div className={'tbar-btn-box'}>{title()}</div>
            <div className={'tbar-search-box'}>{search()}</div>
          </div>
          <SimpleTable
            rowsSelected={selectedRows}
            onSelectRow={this.handleRowSelectChange}
            data={data}
            columns={columns}
            pageChange={this.pageChange}
          />
          <WorkPageModal
            isAdd={isAdd}
            modalVisible={modalVisible}
            confirmLoading={confirmLoading}
            handleOk={this.handleSave}
            handleCancel={this.handleModalCancel}
            onRef={this.onRef}
            defaultValue={editData ? editData : {}}
            appModule={appModule}/>
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
)(WorkPageTable)



