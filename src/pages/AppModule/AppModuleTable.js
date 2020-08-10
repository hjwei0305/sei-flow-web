/**
 * <p/>
 * 实现功能：应用模块
 * <p/>
 *
 * @author 李艳
 */
import React, {Component} from 'react'
import {connect} from 'dva'
import {Button, Input, Modal} from 'antd';
import { message } from 'suid';
import SimpleTable from "@/components/SimpleTable";
import {deleteCorp, getAllList, save} from "./AppModuleService";
import EditAppModuleModal from "./EditAppModuleModal";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import {getWorkPage} from "../WorkPage/WorkPageService";
import {getBusinessModel} from "../businessModel/BusinessModelService";
import { seiLocale } from 'sei-utils';
import { commonUtils } from '@/utils';

const {searchListByKeyWithTag} = commonUtils;
const { seiIntl } = seiLocale;
const Search = Input.Search;
const confirm = Modal.confirm;

class AppModuleTable extends Component {
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
    const { dispatch, } = this.props;
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
    this.handleModalVisible(true, true)
  };
  editClick = (record) => {
    this.setState({editData:record});
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
    })
  };

  handleModalCancel = () => {
    this.handleModalVisible(false)
  };

  handleSearch = (value) => {
    searchListByKeyWithTag(this.state.data, {keyword: value},["code","name"]).then(data => {
      this.setState({data, searchValue: value})
    })
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
        /*校验下面是否有业务实体和工作界面配置:建议改为后端校验*/
        getBusinessModel({filters: [{
            fieldName: "appModule.id",//筛选字段
            operator: "EQ",//操作类型
            value: params,//筛选值
            fieldType: "String"//筛选类型
          }]}).then(data=>{
          if(data.records > 0){
            message.warn(seiIntl.get({key: 'flow_000181', desc: '该应用模块下面配置有业务实体，不能删除！'}))
            thiz.toggoleGlobalLoading(false);
            return;
          }
          getWorkPage({
            filters: [{
              fieldName: "appModuleId",//筛选字段
              operator: "EQ",//操作类型
              value: params,//筛选值
              fieldType: "String"//筛选类型
            }]
          }).then(data => {
            if(data.records > 0){
              message.warn(seiIntl.get({key: 'flow_000182', desc: '该应用模块下面配置有工作界面，不能删除！'}))
              thiz.toggoleGlobalLoading(false);
              return;
            }
            /*删除*/
            deleteCorp(params).then(result => {
              if (result.status === "SUCCESS") {
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
          });
        });
      }
    });
  };

  render() {
    const columns = [
      {
        title: seiIntl.get({key: 'flow_000030', desc: '操作'}),
        width:120,
        dataIndex: "operator",
        render: (text, record, index) => {
          return (
            <div className={'row-operator'}  onClick={(e) => {
              e.stopPropagation()
            }}>
              <a className={'row-operator-item'} onClick={()=>this.editClick(record)}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</a>
              <a className={'row-operator-item'} onClick={()=>this.deleteClick(record)}>{seiIntl.get({key: 'flow_000032', desc: '删除'})}</a>
            </div>
          )
        }
      },
      {
        title: seiIntl.get({key: 'flow_000021', desc: '代码'}),
        dataIndex: 'code',
      },
      {
        title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
        dataIndex: 'name',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000037', desc: '描述'}),
        dataIndex: 'remark',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000183', desc: 'web服务代码'}),
        dataIndex: 'webBaseAddress',
        width: 220
      },
      {
        title: seiIntl.get({key: 'flow_000184', desc: 'api服务代码'}),
        dataIndex: 'apiBaseAddress',
        width: 220,
      },
      {
        title: seiIntl.get({key: 'flow_000177', desc: '排序'}),
        dataIndex: 'rank',
        width: 80
      }
    ];

    const title = () => {
      return [
        <Button type={"primary"}  className={"primaryButton"}  key="edit" onClick={this.addClick}>{seiIntl.get({key: 'flow_000039', desc: '新增'})}</Button>,
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
      const {editData,searchValue,data,selectedRows,isAdd,modalVisible,confirmLoading}=this.state;
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
            data={searchValue ?data.filter(item => item.tag === true) : data}
            columns={columns}
          />
        </div>
        <EditAppModuleModal
          isAdd={isAdd}
          modalVisible={modalVisible}
          confirmLoading={confirmLoading}
          handleOk={this.handleSave}
          handleCancel={this.handleModalCancel}
          onRef={this.onRef}
          defaultValue={editData? editData : {}}/>
      </HeadBreadcrumb>
    )
  }
}

const mapStateToProps = ({}) => {
  return {};
};


export default connect(
  mapStateToProps,
)(AppModuleTable)



