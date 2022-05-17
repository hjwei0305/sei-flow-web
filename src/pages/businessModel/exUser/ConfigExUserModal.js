/**
 * @description 配置自定义执行人
 * @author 李艳
 */

import React, {Component} from 'react'
import {Button, Modal, Tooltip} from 'antd';
import {message} from 'suid';
import {
  deleteExUser,
  listExUser, saveExUser
} from "../BusinessModelService";
import SimpleTable from "@/components/SimpleTable";
import {Input} from "antd/lib/index";
import ExUserModal from "./ExUserModal";
import {seiLocale} from 'sei-utils';

const {seiIntl} = seiLocale;

const Search = Input.Search;
const confirm = Modal.confirm;

class ConfigExUserModal extends Component {
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
    this.getDataSource()
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
    listExUser(params).then(data => {
      this.setState({data, selectedRows: []})
    }).catch(e => {
    }).finally(() => {
      this.setState({loading: false});
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
        saveExUser(params).then(result => {
          if (result.success) {
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

  deleteClick = () => {
    if (!this.judgeSelected()) return;
    let thiz = this;
    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: seiIntl.get({key: 'flow_000029', desc: '删除后不可恢复，是否确定删除？'}),
      onOk() {
        let params = {};
        params = thiz.state.selectedRows[0].id;
        thiz.setState({loading: true});
        deleteExUser(params).then(result => {
          if (result.success) {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            thiz.getDataSource({quickSearchValue: thiz.state.searchValue, pageInfo: thiz.state.pageInfo})
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
          }
        }).catch(e => {
        }).finally(() => {
          thiz.setState({loading: false});
        })
      }
    });
  };

  render() {
    const columns = [
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
        title: seiIntl.get({key: 'flow_000153', desc: 'API地址'}),
        dataIndex: 'url',
        width: 320
      },
      {
        title: seiIntl.get({key: 'flow_000155', desc: '参数'}),
        dataIndex: 'param',
        width: 200
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
                onClick={this.editClick}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</Button>,
        <Button key="delete" className={"primaryButton"}
                onClick={this.deleteClick}>{seiIntl.get({key: 'flow_000032', desc: '删除'})}</Button>,
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Tooltip title={seiIntl.get({key: 'flow_000319', desc: '代码、名称、API地址、参数、描述'})}>
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
      <Modal title={seiIntl.get({key: 'flow_000156', desc: '自定义执行人配置'})}
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
          <ExUserModal
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

export default ConfigExUserModal


