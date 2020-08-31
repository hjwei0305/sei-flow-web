/**
 * @description 常用联系组/人管理
 * @author 何灿坤
 */
import {Component} from "react";
import React from "react";
import {connect} from "react-redux"
import {Input, Button, Row, Col, message, Checkbox, Modal} from "antd";
import SimpleTable from "@/components/SimpleTable";
import {
  getAllGroupByUser,saveCommonContactGroup,deleteCommonContactGroup,
  findCommonContactPeopleByGroupId,deleteCommonContactPeople,saveCommonContactPeople
} from "./CommonContactService";
import CommonContactGroupModal from "./CommonContactGroupModal";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import DetailCard from "@/components/DetailCard";
import StandardDropdown from "@/components/StandardDropdown";
import {seiLocale} from 'sei-utils';
import CommonContactPeopleSelected from "./CommonContactPeopleSelected";
import { constants } from '@/utils';

const { searchListByKeyWithTag, rowGutter, } = constants;
const { seiIntl } = seiLocale;
const Search = Input.Search;
const confirm = Modal.confirm;

class CommonContactView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leftSearchValue: "",
      rightSearchValue: "",
      leftData: [],
      rightData: [],
      rightSelectedRows: [],
      leftSelectedRows: [],
      rightModalVisible: false,
      leftModalVisible: false,
      confirmLoading: false,
      rightFlag: "add",
      isLeftAdd: true
    }
  }

  onLeftModalRef = (ref) => {
    this.LeftModalRef = ref;
  };

  componentWillMount() {
    this.getLeftDataSource()
  };


  /******************************** 左边操作 *******************************************/


  /*请求当前用户的常用联系组*/
  getLeftDataSource = () => {
    this.setState({confirmLoading: true});
    getAllGroupByUser().then((result) => {
      this.setState({
        leftData: result, leftSelectedRows: [], leftSearchValue: ""
      });
    }).catch(err => {
    }).finally(() => {
      this.setState({confirmLoading: false});
    });
  };

  /*常用联系组本地搜索*/
  handleLeftSearch = (value) => {
    searchListByKeyWithTag(this.state.leftData, {keyword: value}, ["name"]).then(res => {
      this.setState({leftData: res, leftSearchValue: value})
    })
  };

  /*新增常用联系组*/
  onAddLeftClick = () => {
    this.setState({
      leftModalVisible: true,
      isLeftAdd: true
    })
  };

  /*编辑常用联系组*/
  onEditLeftClick = (record) => {
    this.setState({
      leftEditData: record,
      leftModalVisible: true,
      isLeftAdd: false
    })
  };

  /*关闭常用联系组弹窗*/
  handleLeftModalCancel = () => {
    this.setState({leftModalVisible: false})
  };

  /*常用联系组选择事件*/
  onLeftTableSelectRow = (tableSelectRow) => {
    this.setState({leftSelectedRows: tableSelectRow, leftEditData: tableSelectRow[0] ? tableSelectRow[0] : {}});
    if (tableSelectRow[0]) {
      this.getRightDataSource({commonContactGroupId: tableSelectRow[0].id})
    }
  };

  /*新增或编辑常用联系组*/
  handleLeftEdit = () => {
    if (this.LeftModalRef && this.LeftModalRef.props.form) {
      this.LeftModalRef.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          this.setState({confirmLoading: true, leftModalVisible: true});
          if (this.state.isLeftAdd) {
            delete values.id
          }
          saveCommonContactGroup(values).then((result) => {
            if (result.status === "SUCCESS") {
              message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
              this.getLeftDataSource();
              this.setState({confirmLoading: false, leftModalVisible: false});
            } else {
              message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
              this.setState({confirmLoading: false});
            }
          }).catch(err => {
            this.setState({confirmLoading: false});
          })
        }
      })
    }
  };

  /*删除常用联系组*/
  onDeleteLeftClick = (record) => {
    let param = record.id;
    let thiz = this;
    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: seiIntl.get({key: 'flow_000029', desc: '删除后不可恢复，是否确定删除？'}),
      onOk() {
        deleteCommonContactGroup(param).then((result) => {
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            thiz.getLeftDataSource();
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
          }
        }).catch((err) => {
        }).finally(() => {
        })
      },
      onCancel() {
      },
    });
  };


  /******************************** 右边操作 *******************************************/

  /*请求常用联系组下的常用联系人*/
  getRightDataSource = (param) => {
    this.setState({confirmLoading: true});
    findCommonContactPeopleByGroupId(param).then((result) => {
      this.setState({
        rightData: result, rightSelectedRows: [], rightSearchValue: ""
      });
    }).catch(err => {
    }).finally(() => {
      this.setState({confirmLoading: false});
    });
  };


  /*添加常用联系人*/
  onAddRightClick = () => {
    if (!this.judgeLeftSelected()) return;
    this.setState({
      rightModalVisible: true,
      rightFlag: "add"
    })
  };

  /*新增或编辑常用联系组*/
  handleRightEdit = () => {
    if(this.state.rightSelectedRows == []){
      message.error(seiIntl.get({key: 'flow_000306', desc: '请选择常用联系人！'}));
    }
    let  peoples = [];
    this.state.rightSelectedRows.forEach((item, index, arr) =>{
        let people = {};
        people.userId = item.id;
        people.userCode = item.code;
        people.userName = item.userName;
        people.orgId = item.organizationId;
        people.orgCode = item.organizationCode;
        people.orgName = item.organizationName;
        people.commonContactGroupId = this.state.leftSelectedRows[0].id;
        peoples.push(people);
    });

    this.setState({confirmLoading: true});
    saveCommonContactPeople(peoples).then((result) => {
      if (result.status === "SUCCESS") {
        message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
        let params = {commonContactGroupId: this.state.leftSelectedRows[0].id};
        this.getRightDataSource(params);
        this.setState({confirmLoading: false, rightModalVisible: false});
      } else {
        message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
        this.setState({confirmLoading: false});
      }
    }).catch(err => {
      this.setState({confirmLoading: false});
    })
  };

  handleRightModalCancel = () => {
    this.setState({rightModalVisible: false})
  };

  onDeleteRightClick = (record) => {
    let param = record.id;
    let thiz = this;
    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: seiIntl.get({key: 'flow_000029', desc: '删除后不可恢复，是否确定删除？'}),
      onOk() {
        deleteCommonContactPeople(param).then((result) => {
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'flow_000025', desc: '请求成功'}));
            //请求table数据刷新本地数据
            let params = {commonContactGroupId: thiz.state.leftSelectedRows[0].id};
            thiz.getRightDataSource(params);
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'flow_000026', desc: '请求失败'}));
          }
        }).catch((err) => {
        }).finally(() => {
        })
      },
      onCancel() {
      },
    });
  };

  judgeLeftSelected = () => {
    if (!this.state.leftSelectedRows[0]) {
      message.error(seiIntl.get({key: 'flow_000304', desc: '请选择常用联系组！'}));
      return false;
    }
    return true;
  };


  /*常用联系人查询*/
  handleRightSearch = (value) => {
    searchListByKeyWithTag(this.state.rightData, {keyword: value}, ["userCode", "userName", "orgName", "orgCode"]).then(res => {
      this.setState({rightData: res, rightSearchValue: value})
    })
  };


  render() {
    const leftColumns = [
      {
        title: seiIntl.get({key: 'flow_000030', desc: '操作'}),
        width: 120,
        dataIndex: "operator",
        render: (text, record, index) => {
          return (
            <div className={'row-operator'} onClick={(e) => {
              e.stopPropagation()
            }}>
                <a className={'row-operator-item'} onClick={() => this.onEditLeftClick(record)}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</a>
                <a className={'row-operator-item'} onClick={() => this.onDeleteLeftClick(record)}>{seiIntl.get({key: 'flow_000032', desc: '删除'})}</a>
            </div>
          )
        }
      },
      {
        title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
        dataIndex: 'name',
        width: 200
      },
      {
        title: seiIntl.get({key: 'flow_000177', desc: '排序'}),
        dataIndex: 'rank',
        width: 80
      }
    ];


    const rightColumns = [
      {
        title: seiIntl.get({key: 'flow_000030', desc: '操作'}),
        width: 60,
        dataIndex: "operator",
        render: (text, record, index) => {
          const button = [
              <a className={'row-operator-item'} onClick={() => this.onDeleteRightClick(record)}>{seiIntl.get({key: 'flow_000032', desc: '删除'})}</a>
          ];
          return (
            <div className={'row-operator'} onClick={(e) => {
              e.stopPropagation()
            }}>
              <StandardDropdown
                operator={button}
              />
            </div>
          )
        }
      },

      {
        title: seiIntl.get({key: 'flow_000021', desc: '代码'}),
        dataIndex: 'userCode',
        // sorter: true,
        width: 120
      },
      {
        title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
        dataIndex: 'userName',
        width: 120
      },
      {
        title: seiIntl.get({key: 'flow_000126', desc: '组织机构'}),
        dataIndex: 'orgName',
        width: 250
      },
      {
        title: seiIntl.get({key: 'flow_000307', desc: '组织机构代码'}),
        dataIndex: 'orgCode',
        width: 120
      },
    ];

    //联系组表头按钮
    const leftTitle = () => {
      return [
          <Button onClick={this.onAddLeftClick} className={"primaryButton"} type={"primary"}>{seiIntl.get({key: 'flow_000039', desc: '新增'})}</Button>
      ]
    };

    //联系组表头搜索框
    const leftSearch = () => {
      return [
        <Search
          key="leftSearch"
          placeholder={seiIntl.get({key: 'flow_000234', desc: '输入名称查询'})}
          onSearch={value => this.handleLeftSearch(value)}
          style={{width: 220}}
          allowClear
        />
      ]
    };

    //联系人表头按钮
    const rightTitle = () => {
      return [
          <Button onClick={this.onAddRightClick} className={"primaryButton"} type={"primary"} >{seiIntl.get({key: 'flow_000039', desc: '新增'})}</Button>
      ]
    };

    //联系人表头搜索框
    const rightSearch = () => {
      return [
        <Search
          key="search"
          placeholder={seiIntl.get({key: 'flow_000069', desc: '输入名称或代码进行查询'})}
          onSearch={value => this.handleRightSearch(value)}
          style={{width: 220}}
          allowClear
        />
      ]
    };


    return (
      <HeadBreadcrumb
        className={"allocation-page"}
        style={{overflow: "hidden"}}
      >
        <Row gutter={rowGutter} style={{height: "100%", display: "block" }}>
          {/*左边联系组控件*/}
          <Col span={10} style={{height: "100%"}}>
            <DetailCard
              title={seiIntl.get({key: 'flow_000300', desc: '常用联系组'})}
              style={{height: "100%"}}
            >
              <div className={'tbar-box'}>
                <div className={'tbar-btn-box'}>{leftTitle()}</div>
                <div className={'tbar-search-box'}>{leftSearch()}</div>
              </div>
              <SimpleTable
                data={this.state.leftSearchValue ? this.state.leftData.filter(item => item.tag === true) : this.state.leftData}
                columns={leftColumns}
                onSelectRow={this.onLeftTableSelectRow}
                rowsSelected={this.state.leftSelectedRows}
              />
              <CommonContactGroupModal
                modalVisible={this.state.leftModalVisible}
                confirmLoading={this.state.confirmLoading}
                handleOk={this.handleLeftEdit}
                handleCancel={this.handleLeftModalCancel}
                onRef={this.onLeftModalRef}
                defaultValue={this.state.leftEditData ? this.state.leftEditData : {}}
                isAdd={this.state.isLeftAdd}
              />
            </DetailCard>
          </Col>
          {/*右边联系人控件*/}
          <Col span={14} style={{height: "100%"}}>
            <DetailCard
              title={seiIntl.get({key: 'flow_000303', desc: '常用联系人'})}
              className={"child-card"}
              style={{height: "100%"}}
            >
              <div className={'tbar-box'}>
                <div className={'tbar-btn-box'}>{rightTitle()}</div>
                <div className={'tbar-search-box'}>{rightSearch()}</div>
              </div>
              <SimpleTable
                data={this.state.rightSearchValue ? this.state.rightData.filter(item => item.tag === true) : this.state.rightData}
                columns={rightColumns}
              />

              <Modal
                title={seiIntl.get({key: 'flow_000305', desc: '选择常用联系人'})}
                bodyStyle={{maxHeight:"720px",overflow:"auto"}}
                width={window.innerWidth*0.8}
                visible={this.state.rightModalVisible}
                onOk={this.handleRightEdit}
                onCancel={this.handleRightModalCancel}
                destroyOnClose={true}
                maskClosable={false}
              >
                <CommonContactPeopleSelected type='checkbox' selectChange={(right)=>this.state.rightSelectedRows = right}/>
              </Modal>

            </DetailCard>
          </Col>
        </Row>
      </HeadBreadcrumb>
    )
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps
)(CommonContactView)
