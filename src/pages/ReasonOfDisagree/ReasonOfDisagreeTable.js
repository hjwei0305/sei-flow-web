/**
 * @description 不同意原因配置
 * @author 何灿坤
 */
import React, {Component} from "react";
import {connect} from 'dva'
import {Button, Col, Input, message, Modal, Row, Tooltip} from "antd";
import EditRightModal from "./EditRightModal";
import SimpleTable from "@/components/SimpleTable";
import HeadBreadcrumb from "@/components/breadcrumb/HeadBreadcrumb";
import DetailCard from "@/components/DetailCard";
import {constants, commonUtils} from '@/utils';
import {seiLocale} from 'sei-utils';
import {
  findReasonOfDisagree,
  getDisagreeReasonByTypeId,
  updateStatusById,
  saveDisagreeReason
} from "./ReasonOfDisagreeService";

const {rowGutter} = constants;
const {searchListByKeyWithTag} = commonUtils;
const {seiIntl} = seiLocale;
const Search = Input.Search;
const confirm = Modal.confirm;

class ReasonOfDisagreeTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      leftData: [],
      rightData: [],
      leftSearchValue: "",
      rightSearchValue: "",
      leftSelectedRow: [],
      rightSelectRow: [],
      rightModalVisible: false,
      isRightAdd: true
    }
  }

  componentWillMount() {
    this.getLeftData()
  };

  toggoleGlobalLoading = (loading) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'global/updateState',
      payload: {
        globalLoading: loading,
      }
    });
  }

  onRightModalRef = (ref) => {
    this.rightModalRef = ref;
  };


  //请求左边table数据
  getLeftData = (param) => {
    this.toggoleGlobalLoading(true);
    findReasonOfDisagree(param).then((result) => {
      this.setState({leftData: result, leftSelectedRow: []})
    }).catch(err => {
    }).finally(() => {
      this.toggoleGlobalLoading(false);
    });
  };

  handleLeftSearch = (value) => {
    searchListByKeyWithTag(this.state.leftData, {keyword: value}, ["code", "name"]).then(data => {
      this.setState({leftData: data, leftSearchValue: value})
    })
  };


  onLeftSelectRow = (tableSelectRow) => {
    if (tableSelectRow[0]) {
      this.getDisagreeReasonByTypeId({typeId: tableSelectRow[0].id})
      this.setState({leftSelectedRow: tableSelectRow})
    } else {
      this.setState({leftSelectedRow: [], rightData: []})
    }
  };

  //请求右边table数据
  getDisagreeReasonByTypeId = (param) => {
    this.toggoleGlobalLoading(true);
    getDisagreeReasonByTypeId(param).then((result) => {
      this.setState({
        rightData: result && result.data ? result.data : [], rightSelectRow: [], rightSearchValue: ""
      });
    }).catch(err => {
    }).finally(() => {
      this.toggoleGlobalLoading(false);
    });
  };


  onTableSelectRow = (tableSelectRow) => {
    this.setState({rightSelectRow: tableSelectRow});
  };

  judgeLeftSelected = () => {
    if (!this.state.leftSelectedRow[0]) {
      message.error(seiIntl.get({key: 'flow_000217', desc: '请选择流程类型！'}));
      return false;
    }
    return true;
  };

  onAddRightClick = () => {
    if (!this.judgeLeftSelected()) return;
    this.setState({rightModalVisible: true, isRightAdd: true})
  };

  onEditRightClick = (record) => {
    this.setState({rightModalVisible: true, isRightAdd: false, rightEditData: record})
  };

  handleRightSearch = (value) => {
    searchListByKeyWithTag(this.state.rightData, {keyword: value}, ["code", "depict", "name"]).then(res => {
      this.setState({rightData: res, rightSearchValue: value})
    })
  };

  //新增或编辑保存事件
  handleEditRight = () => {
    if (this.rightModalRef && this.rightModalRef.props.form) {
      this.rightModalRef.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          //如果表单验证通过，则进行网络请求保存更改或新增的数据
          this.toggoleGlobalLoading(true);
          if (this.state.isRightAdd) {
            delete values.id
          }
          saveDisagreeReason(values).then((result) => {
            if (result.status === "SUCCESS") {
              message.success(result.message ? result.message : seiIntl.get({key: 'common_000002', desc: '保存成功'}));
              this.setState({rightModalVisible: false});
              this.getDisagreeReasonByTypeId({typeId: this.state.leftSelectedRow[0] ? this.state.leftSelectedRow[0].id : null})
            } else {
              message.error(result.message ? result.message : seiIntl.get({key: 'common_000003', desc: '保存失败'}));
            }
          }).catch(err => {
          }).finally(() => {
            this.toggoleGlobalLoading(false);
          });
        }
      })
    }
  };

  handleRightModalCancel = () => {
    this.setState({rightModalVisible: false})
  };

  updateRightStatusClick = (record) => {
    let thiz = this;
    let msg;
    if (record.status == true) {
      msg = seiIntl.get({key: 'flow_000209', desc: '你确定要禁用吗？'});
    } else {
      msg = seiIntl.get({key: 'flow_000210', desc: '你确定要启用吗？'});
    }
    confirm({
      title: seiIntl.get({key: 'flow_000028', desc: '温馨提示'}),
      content: msg,
      onOk() {
        let params = {'id': record.id};
        thiz.toggoleGlobalLoading(true);
        updateStatusById(params).then((result) => {
          if (result.status === "SUCCESS") {
            message.success(result.message ? result.message : seiIntl.get({key: 'common_000000', desc: '请求成功'}));
            thiz.getDisagreeReasonByTypeId({typeId: thiz.state.leftSelectedRow[0] ? thiz.state.leftSelectedRow[0].id : null})
          } else {
            message.error(result.message ? result.message : seiIntl.get({key: 'common_000001', desc: '请求失败'}));
          }
        }).catch((err) => {
        }).finally(() => {
          thiz.toggoleGlobalLoading(false);
        })
      },
      onCancel() {
      },
    });
  };

  render() {
    const leftColumns = [
      {
        title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
        dataIndex: 'name',
        width: 220
      },
      {
        title: seiIntl.get({key: 'flow_000021', desc: '代码'}),
        dataIndex: 'code',
        width: 220
      },
      {
        title: seiIntl.get({key: 'flow_000092', desc: '所属业务实体模型'}),
        dataIndex: 'businessModel.name',
        width: 220
      },
      {
        title: seiIntl.get({key: 'flow_000037', desc: '描述'}),
        dataIndex: 'depict',
        width: 300
      }
    ];

    const leftTitle = () => {
      return []
    };

    //左边表头搜索框
    const leftSearch = () => {
      return [
        <Search
          key="search"
          placeholder={seiIntl.get({key: 'flow_000069', desc: '输入名称或代码进行查询'})}
          onSearch={value => this.handleLeftSearch(value)}
          style={{width: 220}}
          allowClear
        />
      ]
    };


    const rightColumns = [
      {
        title: seiIntl.get({key: 'operation', desc: '操作'}),
        width: 80,
        dataIndex: "operator",
        render: (text, record, index) => {
          if (record.status == true) {
            return (
              <div className={'row-operator'} onClick={(e) => {
                e.stopPropagation()
              }}>
                <a className={'row-operator-item'}
                   onClick={() => this.onEditRightClick(record)}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</a>
                <a className={'row-operator-item'}
                   onClick={() => this.updateRightStatusClick(record)}>{seiIntl.get({
                  key: 'flow_000208',
                  desc: '禁用'
                })}</a>
              </div>
            )
          } else {
            return (
              <div className={'row-operator'} onClick={(e) => {
                e.stopPropagation()
              }}>
                <a className={'row-operator-item'}
                   onClick={() => this.onEditRightClick(record)}>{seiIntl.get({key: 'flow_000031', desc: '编辑'})}</a>
                <a className={'row-operator-item'}
                   onClick={() => this.updateRightStatusClick(record)}>{seiIntl.get({
                  key: 'flow_000207',
                  desc: '启用'
                })}</a>
              </div>
            )
          }
        }
      },
      {
        title: seiIntl.get({key: 'flow_000021', desc: '代码'}),
        dataIndex: 'code',
        width: 180
      },
      {
        title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
        dataIndex: 'name',
        width: 180
      },
      {
        title: seiIntl.get({key: 'flow_000037', desc: '描述'}),
        width: 300,
        dataIndex: 'depict'
      },
      {
        title: seiIntl.get({key: 'flow_000177', desc: '排序'}),
        dataIndex: 'rank',
        width: 80,
        render: (text) => {
          return <div style={{textAlign: "right"}}>{text}</div>
        },
      },
      {
        title: seiIntl.get({key: 'flow_000270', desc: '启用状态'}),
        align: "status",
        width: 80,
        render: (text, record) => {
          if (record.status == true) {
            return "启用"
          } else {
            return "禁用";
          }
        },
      }
    ];

    const rightTitle = () => {
      return [
        <Button className={"primaryButton"} type={"primary"}
                onClick={this.onAddRightClick}>{seiIntl.get({key: 'flow_000039', desc: '新增'})}</Button>
      ]
    };

    //表头搜索框
    const rightSearch = () => {
      return [
        <Tooltip title={seiIntl.get({key: 'flow_000320', desc: '代码、名称、描述'})}>
          <Search
            key="search"
            placeholder={seiIntl.get({key: 'common_000024', desc: '输入关键字查询'})}
            onSearch={value => this.handleRightSearch(value)}
            style={{width: 220}}
            allowClear
          />
        </Tooltip>
      ]
    };

    const {leftSearchValue, rightSearchValue, rightData, leftData, rightSelectRow, rightModalVisible, isRightAdd, rightEditData, leftSelectedRow} = this.state;
    return (
      <HeadBreadcrumb
        className={"allocation-page"}
        style={{overflow: "hidden"}}
      >
        <Row gutter={rowGutter}>
          {/*左边控件*/}
          <Col span={10} style={{height: "100%"}}>
            <DetailCard title={seiIntl.get({key: 'flow_000056', desc: '流程类型'})} style={{height: "100%"}}>
              <div className={'tbar-box'}>
                <div className={'tbar-btn-box'}>{leftTitle()}</div>
                <div className={'tbar-search-box'}>{leftSearch()}</div>
              </div>
              <SimpleTable
                inCard={true}
                data={leftSearchValue ? leftData.filter(item => item.tag === true) : leftData}
                columns={leftColumns}
                onSelectRow={this.onLeftSelectRow}
              />
            </DetailCard>
          </Col>
          {/*右边的表格控件*/}
          <Col span={14}>
            <DetailCard title={seiIntl.get({key: 'flow_000216', desc: '不同意原因'})} className={"child-card"}>
              <div className={'tbar-box'}>
                <div className={'tbar-btn-box'}>{rightTitle()}</div>
                <div className={'tbar-search-box'}>{rightSearch()}</div>
              </div>
              <SimpleTable
                data={rightSearchValue ? rightData.filter(item => item.tag === true) : rightData}
                columns={rightColumns}
                onSelectRow={this.onTableSelectRow}
                rowsSelected={rightSelectRow}
              />
            </DetailCard>
            <EditRightModal
              modalVisible={rightModalVisible}
              handleOk={this.handleEditRight}
              handleCancel={this.handleRightModalCancel}
              onRef={this.onRightModalRef}
              defaultValue={!isRightAdd && rightEditData ? rightEditData : {}}
              isAdd={isRightAdd}
              flowType={leftSelectedRow[0]}
            />
          </Col>
        </Row>
      </HeadBreadcrumb>
    )
  }
}

const mapStateToProps = ({}) => {
  return {};
};

export default connect(
  mapStateToProps
)(ReasonOfDisagreeTable)
