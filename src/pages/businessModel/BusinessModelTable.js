/**
 * <p/>
 * 实现功能：业务实体
 * <p/>
 *
 * @author 李艳
 */
import React, {Component} from 'react'
import {connect} from 'dva'
import {Button, Input, Modal, Tooltip} from 'antd';
import {message} from 'suid';
import SimpleTable from "@/components/SimpleTable";
import {deleteCorp, getBusinessModel, save} from "./BusinessModelService";
import SearchTable from "@/components/SearchTable";
import BusinessModelModal from "./BusinessModelModal";
import ConfigWorkPageModal from "./workPage/ConfigWorkPageModal";
import ConfigServerUrlModal from "./serverUrl/ConfigServerUrlModal";
import ConfigExUserModal from "./exUser/ConfigExUserModal";
import PropertiesForConditionPojoModal from "./propertiesForConditionPojo/PropertiesForConditionPojoModal";
import StandardDropdown from "@/components/StandardDropdown";
import {seiLocale} from 'sei-utils';
import {appModuleAuthConfig,} from '@/utils/CommonComponentsConfig';

const {seiIntl} = seiLocale;
const Search = Input.Search;
const confirm = Modal.confirm;

class BusinessModelTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      modalVisible: false,
      confirmLoading: false,
      selectedRows: [],
      operateFlag: "add",
      pageInfo: null,
      searchValue: "",
      appModule: {},
      workPageModalVisible: false,
      configServerUrlModalVisible: false,
      exUserModalVisible: false,
      checkModalVisible: false,
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
    getBusinessModel(params).then(data => {
      this.setState({data, selectedRows: []})
    }).catch(e => {
    }).finally(() => {
      this.toggoleGlobalLoading(false);
    })
  };

  handleRowSelectChange = (selectedRows) => {
    this.setState({selectedRows, editData: selectedRows[0] ? selectedRows[0] : null})
  };
  handleModalVisible = (modalVisible = false, workPageModalVisible = false, configServerUrlModalVisible = false, exUserModalVisible = false, checkModalVisible = false) => {
    this.setState({
      modalVisible,
      workPageModalVisible,
      configServerUrlModalVisible,
      exUserModalVisible,
      checkModalVisible
    })
  };
  addClick = () => {
    this.handleModalVisible(true);
    this.setState({operateFlag: 'add'})
  };
  refClick = () => {
    const {selectedRows} = this.state;
    if (selectedRows && selectedRows[0]) {
      this.handleModalVisible(true);
      this.setState({operateFlag: 'refAdd'})
    } else {
      message.error(seiIntl.get({key: 'flow_000027', desc: '请选择一行数据！'}))
    }

  };
  editClick = (record) => {
    this.setState({editData: record});
    this.handleModalVisible(true);
    this.setState({operateFlag: 'edit'})
  };
  configWorkPageClick = (record) => {
    this.setState({editData: record});
    this.handleModalVisible(false, true)
  };
  configServerUrlClick = (record) => {
    this.setState({editData: record});
    this.handleModalVisible(false, false, true)
  };
  configExUserClick = (record) => {
    this.setState({editData: record});
    this.handleModalVisible(false, false, false, true)
  };
  checkClick = (record) => {
    this.setState({editData: record});
    this.handleModalVisible(false, false, false, false, true)
  };
  handleSave = () => {
    const {operateFlag, appModule, searchValue} = this.state;
    this.ref.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let params = {};
        Object.assign(params, values);
        if (operateFlag === 'refAdd' || operateFlag === 'add') {
          delete params.id;
        }
        this.setState({confirmLoading: true});
        save(params).then(result => {
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //刷新本地数据
            this.getDataSource({
              quickSearchValue: searchValue, filters: [{
                fieldName: "appModule.id",//筛选字段
                operator: "EQ",//操作类型
                value: `${appModule.id}`,//筛选值
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

  handleModalCancel = () => {
    this.handleModalVisible()
  };

  handleSearch = (value) => {
    const {appModule} = this.state;
    this.setState({searchValue: value});
    this.getDataSource({
      quickSearchValue: value, filters: [{
        fieldName: "appModule.id",//筛选字段
        operator: "EQ",//操作类型
        value: `${appModule.id}`,//筛选值
        fieldType: "String"//筛选类型
      }]
    });
  };

  deleteClick = (record) => {
    this.setState({editData: record});
    let thiz = this;
    const {appModule, searchValue, pageInfo, selectedRows} = thiz.state;
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
              quickSearchValue: searchValue, pageInfo: pageInfo, filters: [{
                fieldName: "appModule.id",//筛选字段
                operator: "EQ",//操作类型
                value: `${appModule.id}`,//筛选值
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
    const {searchValue} = this.state;
    this.setState({appModule: record})
    this.getDataSource({
      quickSearchValue: searchValue, filters: [{
        fieldName: "appModule.id",//筛选字段
        operator: "EQ",//操作类型
        value: `${record.id}`,//筛选值
        fieldType: "String"//筛选类型
      }]
    });
  };
  pageChange = (pageInfo) => {
    const {appModule, searchValue} = this.state;
    this.setState({
      pageInfo: pageInfo,
    });
    this.getDataSource({
      quickSearchValue: searchValue, pageInfo, filters: [{
        fieldName: "appModule.id",//筛选字段
        operator: "EQ",//操作类型
        value: `${appModule.id}`,//筛选值
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
          let ops = [
            <a className={'row-operator-item'} key={"edit" + index}
               onClick={() => this.editClick(record)}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</a>,
            <a className={'row-operator-item'} key={"delete" + index}
               onClick={() => this.deleteClick(record)}>{seiIntl.get({key: 'flow_000032', desc: '删除'})}</a>,
            <a className={'row-operator-item'} key={"configWorkPage" + index}
               onClick={() => this.configWorkPageClick(record)}>{seiIntl.get({key: 'flow_000157', desc: '配置工作界面'})}</a>,
            <a className={'row-operator-item'} key={"configUrl" + index}
               onClick={() => this.configServerUrlClick(record)}>{seiIntl.get({
              key: 'flow_000150',
              desc: '配置服务地址'
            })}</a>,
            <a className={'row-operator-item'} key={"configExUser" + index}
               onClick={() => this.configExUserClick(record)}>{seiIntl.get({key: 'flow_000156', desc: '自定义执行人配置'})}</a>,
            <a className={'row-operator-item'} key={"check" + index}
               onClick={() => this.checkClick(record)}>{seiIntl.get({key: 'flow_000152', desc: '查看条件属性'})}</a>
          ]
          return (
            <div className={'row-operator'} onClick={(e) => {
              e.stopPropagation()
            }}>
              <StandardDropdown operator={ops}/>
            </div>
          )
        }
      },
      {
        title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
        dataIndex: 'name',
        width: 240
      },
      {
        title: seiIntl.get({key: 'flow_000158', desc: '类全路径'}),
        dataIndex: 'className',
        width: 400
      },
      {
        title: seiIntl.get({key: 'flow_000159', desc: '应用模块Code'}),
        dataIndex: 'appModule.code',
        width: 120,
      },
      {
        title: seiIntl.get({key: 'flow_000097', desc: '表单URL'}),
        dataIndex: 'lookUrl',
        width: 400,
      },
      {
        title: seiIntl.get({key: 'flow_000096', desc: '表单明细URL'}),
        dataIndex: 'businessDetailServiceUrl',
        width: 400,
      },
    ];

    const title = () => {
      return [
        <span key={"select"} className={"primaryButton"}>{seiIntl.get({key: 'flow_000038', desc: '应用模块：'})}
          <SearchTable
            key="searchTable"
            initValue={true}
            isNotFormItem={true} config={appModuleAuthConfig}
            style={{width: 220}}
            selectChange={this.selectChange}/></span>,
        <Button key="add" className={"primaryButton"} type={"primary"}
                onClick={this.addClick}>{seiIntl.get({key: 'flow_000039', desc: '新增'})}</Button>,
        <Button key="refAdd" className={"primaryButton"}
                onClick={this.refClick}>{seiIntl.get({key: 'flow_000114', desc: '参考创建'})}</Button>,
      ]
    };

    //表头搜索框
    const search = () => {
      return [
        <Tooltip title={seiIntl.get({key: 'flow_000317', desc: '名称、类路径、表单明细url、表单url'})}>
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
    const {
      appModule, selectedRows, operateFlag, data, confirmLoading, modalVisible, workPageModalVisible,
      configServerUrlModalVisible, exUserModalVisible, checkModalVisible, editData
    } = this.state;
    return (
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
        {modalVisible && <BusinessModelModal
          appModuleId={appModule ? appModule.id : ""}
          operateFlag={operateFlag}
          modalVisible={modalVisible}
          confirmLoading={confirmLoading}
          handleOk={this.handleSave}
          handleCancel={this.handleModalCancel}
          onRef={this.onRef}
          defaultValue={editData ? editData : {}}/>}
        {workPageModalVisible && <ConfigWorkPageModal
          appModuleId={appModule ? appModule.id : ""}
          businessModelId={editData ? editData.id : ""}
          modalVisible={workPageModalVisible}
          handleCancel={this.handleModalCancel}/>}
        {configServerUrlModalVisible && <ConfigServerUrlModal
          appModuleId={appModule ? appModule.id : ""}
          businessModelId={editData ? editData.id : ""}
          modalVisible={configServerUrlModalVisible}
          handleCancel={this.handleModalCancel}/>}
        {exUserModalVisible && <ConfigExUserModal
          appModuleId={appModule ? appModule.id : ""}
          businessModelId={editData ? editData.id : ""}
          modalVisible={exUserModalVisible}
          handleCancel={this.handleModalCancel}/>}
        {checkModalVisible && <PropertiesForConditionPojoModal
          appModuleId={appModule ? appModule.id : ""}
          className={editData ? editData.className : ""}
          modalVisible={checkModalVisible}
          handleCancel={this.handleModalCancel}/>
        }
      </div>
    )
  }
}

const mapStateToProps = ({}) => {
  return {};
};


export default connect(
  mapStateToProps,
)(BusinessModelTable)



