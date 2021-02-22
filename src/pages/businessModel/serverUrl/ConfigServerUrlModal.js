/**
 * @description 配置服务地址
 * @author 李艳
 */

import React, {Component} from 'react'
import {Button, Modal, Tooltip} from 'antd';
import {message} from 'suid';
import {
  deleteServiceUrl,
  listServiceUrl, saveServiceUrl,
} from "../BusinessModelService";
import SimpleTable from "@/components/SimpleTable";
import {Input} from "antd/lib/index";
import EditServerUrlModal from "./EditServerUrlModal";
import {connect} from "dva";
import {seiLocale} from 'sei-utils';

const {seiIntl} = seiLocale;
const Search = Input.Search;

class ConfigServerUrlModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      modalVisible: false,
      confirmLoading: false,
      selectedRows: [],
      isAdd: false,
      searchValue: "",
      loading: false
    };
  }

  componentWillMount() {
    this.getDataSource();
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
  getDataSource = (params = {}) => {
    let {businessModelId} = this.props;
    Object.assign(params, {
      filters: [{
        fieldName: "businessModel.id",//筛选字段
        operator: "EQ",//操作类型
        value: `${businessModelId}`,//筛选值
        fieldType: "String"//筛选类型
      }]
    });
    this.setState({loading: true});
    listServiceUrl(params).then(data => {
      this.setState({data, selectedRows: []})
    }).catch(e => {
    }).finally(() => {
      this.setState({loading: false});
    })
  };
  deleteClick = (record) => {
    let thiz = this;
    Modal.confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: seiIntl.get({key: 'flow_000029', desc: '删除后不可恢复，是否确定删除？'}),
      onOk() {
        let params = "";
        params = record.id;
        thiz.toggoleGlobalLoading(true);
        deleteServiceUrl(params).then(result => {
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            thiz.getDataSource({quickSearchValue: thiz.state.searchValue});
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
          }
        }).catch(e => {
        }).finally(() => {
          thiz.toggoleGlobalLoading(false);
        })
      }
    });
  }
  handleRowSelectChange = (selectedRows) => {
    this.setState({selectedRows})
  };
  handleModalVisible = (modalVisible, isAdd) => {
    this.setState({modalVisible, isAdd})
  };
  addClick = () => {
    this.handleModalVisible(true, true)
  };
  editClick = () => {
    if (!this.judgeSelected()) return;
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
        params.businessModel = {};
        params.businessModel.id = this.props.businessModelId;
        saveServiceUrl(params).then(result => {
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            this.getDataSource({quickSearchValue: this.state.searchValue});
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
    this.getDataSource({quickSearchValue: value});
  };
  pageChange = (pageInfo) => {
    this.setState({
      pageInfo: pageInfo,
    });
    this.getDataSource({quickSearchValue: this.state.searchValue, pageInfo})
  };

  render() {
    const columns = [
      {
        title: seiIntl.get({key: 'flow_000030', desc: '操作'}),
        width: 60,
        dataIndex: "operator",
        render: (text, record, index) => {
          return (
            <div className={'row-operator'} onClick={(e) => {
              e.stopPropagation()
            }}>
              <a className={'row-operator-item'}
                 onClick={() => this.deleteClick(record)}>{seiIntl.get({key: 'flow_000032', desc: '删除'})}</a>
            </div>
          )
        }
      },
      {
        title: seiIntl.get({key: 'flow_000021', desc: '代码'}),
        dataIndex: 'code',
        width: 150
      },
      {
        title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
        dataIndex: 'name',
        width: 150
      },
      {
        title: seiIntl.get({key: 'flow_000033', desc: 'URL地址'}),
        dataIndex: 'url',
        width: 320
      },
      {
        title: seiIntl.get({key: 'flow_000037', desc: '描述'}),
        dataIndex: 'depict',
        width: 320
      }
    ];
    const title = () => {
      return [
        <Button type={"primary"} key="edit" className={"primaryButton"}
                onClick={this.addClick}>{seiIntl.get({key: 'flow_000039', desc: '新增'})}</Button>,
        <Button key="check" className={"primaryButton"}
                onClick={this.editClick}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</Button>
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Tooltip title={seiIntl.get({key: 'flow_000318', desc: '代码、名称、URL地址、描述'})}>
          <Search
            key="search"
            placeholder={seiIntl.get({key: 'flow_000160', desc: '输入关键字查询'})}
            onSearch={value => this.handleSearch(value)}
            style={{width: 230}}
            allowClear
          />
        </Tooltip>
      ]
    };
    const {modalVisible, handleCancel} = this.props;
    return (
      <Modal title={seiIntl.get({key: 'flow_000150', desc: '配置服务地址'})}
             visible={modalVisible}
             width={1000}
             maskClosable={false}
             onCancel={handleCancel}
             bodyStyle={{minHeight: 400}}
             footer={false}
             centered={true}
      >
        <div>
          <div className={'tbar-box'}>
            <div className={'tbar-btn-box'}>{title()}</div>
            <div className={'tbar-search-box'}>{search()}</div>
          </div>
          <SimpleTable
            heightY={350}
            rowsSelected={this.state.selectedRows}
            onSelectRow={this.handleRowSelectChange}
            data={this.state.data}
            columns={columns}
            pageChange={this.pageChange}
            loading={this.state.loading}
          />
          <EditServerUrlModal
            isAdd={this.state.isAdd}
            modalVisible={this.state.modalVisible}
            confirmLoading={this.state.confirmLoading}
            handleOk={this.handleSave}
            handleCancel={this.handleModalCancel}
            onRef={this.onRef}
            defaultValue={this.state.selectedRows[0] ? this.state.selectedRows[0] : {}}/>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = ({}) => {
  return {};
};

export default connect(
  mapStateToProps,
)(ConfigServerUrlModal)


