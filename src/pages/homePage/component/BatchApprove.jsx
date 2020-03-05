/**
 * @Description:
 * @Author: CHEHSHUANG
 * @Date: 2019/3/15
 */
import React, { Component } from 'react';
import SimpleTable from "@/components/SimpleTable";
import { connect } from "dva";
import {
    findByPageCanBatchApprovalByBusinessModelId, findNextNodesByVersionGroupWithUserSetCanBatch,
    completeTaskBatch
} from '../service';
import { Input, Button, Select, message, Card, Checkbox, Col, Radio, Modal, Form } from 'antd';
import { isEmpty, uniq } from 'lodash';
import { seiLocale } from 'sei-utils';
import { commonUtils, } from '@/utils';

const { countDate } = commonUtils;
const { seiIntl } = seiLocale;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;

class BatchApprove extends Component {

    state = {
        dataSource: [],
        selectedRows: [],
        businessModeId: null,
        quickValue: '',
        nextNodes: [],
        batchModal: false,
        confirmLoding: false,
        canCommitFlag: false,
    }

    completeParams = null;

    componentDidMount() {
        this.getDataSource();
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

    getDataSource = (businessModelId, value, pageInfo) => {
        businessModelId = businessModelId ? businessModelId : ''
        findByPageCanBatchApprovalByBusinessModelId(businessModelId, value, pageInfo).then(res => {
            this.setState({ dataSource: res.rows })
        })
    }

    handleRowSelectChange = (rows) => {
        this.setState({ selectedRows: rows })
    }

    handlePageChange = (pageInfo) => {
        this.getDataSource(this.state.businessModeId, this.state.quickValue, pageInfo);
    }

    handleChange = (val) => {
        this.setState({ businessModeId: val });
        this.getDataSource(val)
    }

    handleSearch = (val) => {
        this.setState({ quickValue: val });
        this.getDataSource(this.state.businessModeId, val)
    }

    handleBatchApprove = () => {
        const { selectedRows } = this.state;
        if (isEmpty(selectedRows)) {
            message.error(seiIntl.get({ key: 'common_000204', desc: '请选择要处理的数据' }));
            return
        }
        let taskIds = selectedRows.map(row => row.id)
        this.toggoleGlobalLoading(true);
        findNextNodesByVersionGroupWithUserSetCanBatch(taskIds.toString()).then(res => {
            this.completeParams = res.map(node => {
                const isSolidifyFlow = !!node.solidifyFlow;
                let taskIdList = [];
                let flowTaskCompleteList = [];
                node.nodeGroupInfos.map(info => {
                    taskIdList.push(...info.ids);
                    let userIds = null;
                    if (info.executorSet && info.executorSet.length === 1) {
                        userIds = info.executorSet[0].id
                    }
                    flowTaskCompleteList.push({
                        userIds,
                        nodeId: info.nodeId,
                        flowTaskType: info.flowTaskType,
                        userVarName: info.userVarName,
                        callActivityPath: info.callActivityPath,
                        instancyStatus: false,
                        type: info.type,
                    })
                })
                return {
                    id: node.id,
                    taskIdList: uniq(taskIdList),
                    solidifyFlow: isSolidifyFlow,
                    flowTaskCompleteList: flowTaskCompleteList
                }
            })
            let canCommitFlag = this.checkCanCommitFlag();
            this.setState({ nextNodes: res, batchModal: true, canCommitFlag })
        }).finally(e => {
            this.toggoleGlobalLoading(false);
        })
    }


    userInfoSpan = (user) => {
        return (
            <>
                <span>{seiIntl.get({ key: 'common_000205', desc: '姓名：' })}</span>
                <span style={{ marginRight: '8px' }}>{`${user.name}【${user.code}】`}</span>
                <span>{seiIntl.get({ key: 'common_000206', desc: '组织机构：' })}</span>
                <span style={{ marginRight: '8px' }}>{user.organizationName}</span>
                <span>{seiIntl.get({ key: 'common_000207', desc: '岗位：' })}</span>
                <span style={{ marginRight: '8px' }}>{user.positionName}</span>
            </>
        )
    }

    batchComplete = () => {
        this.setState({ confirmLoding: true })
        completeTaskBatch(this.completeParams).then(res => {
            if (res.success) {
                message.success(res.message);
                this.setState({ batchModal: false }, () => {
                    this.getDataSource(this.state.businessModeId, this.state.quickValue);
                })
            } else {
                if (res.message) {
                    message.error(res.message)
                } else {
                    message.error(seiIntl.get({ key: 'common_000208', desc: '批量提交出错' }))
                }
            }
        }).finally(e => {
            this.setState({ confirmLoding: false })
        })
    }

    onChange = (e, id, nodeId) => {
        let changeNode = this.completeParams.filter(node => node.id === id)[0];
        let val = e.target ? e.target.value : e;
        changeNode.flowTaskCompleteList.map(detail => {
            if (detail.nodeId === nodeId) {
                detail.userIds = val.toString();
            }
        });
        const canCommitFlag = this.checkCanCommitFlag();
        this.setState({ canCommitFlag })
    }

    checkCanCommitFlag = () => {
        let canCommitFlag = true;
        this.completeParams.map(node => {
            node.flowTaskCompleteList.map(detail => {
                if (detail.flowTaskType !== 'poolTask') {
                    if (!node.solidifyFlow && (isEmpty(detail.userIds) && detail.type !== 'EndEvent') && detail.type !== 'CounterSignNotEnd') {
                        canCommitFlag = false;
                    }
                }
            })
        })
        return canCommitFlag;
    }

    getSpanByInfo = (info, node) => {
        /** 如果是固化流程，显示内容 */
        if(node && node.solidifyFlow){
            return <span>{seiIntl.get({ key: 'basic_0011163', desc: '固化流程,不用选择执行人!' })}</span>
        }
        /** 会签未结束 */
        if(info.type==='CounterSignNotEnd'){
            return <span>{seiIntl.get({ key: 'basic_0011164', desc: '会签未结束,不用选择执行人!' })}</span>
        }
        if(info.type==='EndEvent'){
            return <span>{seiIntl.get({ key: 'common_000209', desc: '流程结束' })},{seiIntl.get({ key: 'common_000210', desc: '不用选择执行人' })}</span>
        }
        if(info.flowTaskType==='poolTask'){
            return <span>{seiIntl.get({ key: 'common_000318', desc: '工作池任务' })},{seiIntl.get({ key: 'common_000210', desc: '不用选择执行人' })}</span>
        }


    }

    render() {
        const formmater = {
            labelCol: { span: 6 },
            wrapperCol: { span: 16 }
        }

        const { selectedRows, dataSource, canCommitFlag } = this.state;
        return (
            <div className={"tbar-table tbar-table-back"}>
                <div className={"tbar-left"} style={{ marginBottom: 10, display: 'flex' }}>
                    <Button style={{ marginRight: 8 }} onClick={this.handleBatchApprove}>
                        {seiIntl.get({ key: 'common_000211', desc: '批量处理' })}
                    </Button>
                    <Select placeholder={seiIntl.get({key: 'common_000212', desc: '选择单据类型'})} onChange={this.handleChange} style={{ width: "25%" }} allowClear={true}>
                        {this.props.aprroveHead.map(dataItem =>
                            <Select.Option key={dataItem.businessModeId} value={dataItem.businessModeId}>
                                {dataItem.businessModelName}
                            </Select.Option>
                        )
                        }
                    </Select>
                    <Input.Search
                        style={{ margin: "0 8px", width: "25%" }}
                        allowClear
                        placeholder={seiIntl.get({ key: 'common_000024', desc: '输入关键字查询' })}
                        onSearch={this.handleSearch}
                    />
                    <div style={{ width: '100%', textAlign: 'end' }}>
                        <Button style={{ marginRight: 8 }} onClick={() => this.props.handleBatchApproce(false)}>
                            {seiIntl.get({ key: 'back', desc: '返回' })}
                        </Button>
                    </div>
                </div>
                <SimpleTable
                    checkBox
                    rowsSelected={selectedRows}
                    onSelectRow={this.handleRowSelectChange}
                    data={dataSource}
                    columns={columns}
                    pageChange={this.handlePageChange}
                />
                <Modal
                    title={seiIntl.get({ key: 'common_000213', desc: '批量执行' })}
                    bodyStyle={{ maxHeight: "480px", overflow: "auto" }}
                    width={720}
                    visible={this.state.batchModal}
                    onOk={this.batchComplete}
                    confirmLoading={this.state.confirmLoding}
                    okButtonProps={{
                        disabled: !canCommitFlag
                    }}
                    onCancel={() => { this.setState({ batchModal: false }) }}
                    destroyOnClose={true}
                    maskClosable={false}
                >
                    {
                        this.state.nextNodes.map(node => (
                            <Card
                                key={node.id}
                                style={{ marginTop: "10px" }}
                                title={node.name}
                                size={"small"}
                                headStyle={{ background: "#eee" }}
                                bodyStyle={{ padding: 0, overflow: 'auto' }}
                            >
                                {
                                    node.nodeGroupInfos.map(info => (
                                        <div key={info.flowDefVersionId}>
                                            <div style={{ width: '24%', textAlign: 'end' }}>{info.name}</div>
                                            <FormItem {...formmater} label={seiIntl.get({ key: 'common_000214', desc: '意见' })} >
                                                <span>{seiIntl.get({ key: 'common_000215', desc: '同意' })}</span>
                                            </FormItem>
                                            <FormItem {...formmater} label={seiIntl.get({ key: 'common_000216', desc: '执行人' })}>
                                                {
                                                    info.executorSet ? (
                                                        info.uiType === 'checkbox' ?
                                                            <CheckboxGroup defaultValue={(info.executorSet || []).length === 1 ? info.executorSet[0].id : null} onChange={(e) => this.onChange(e, node.id, info.nodeId)}>
                                                                {info.executorSet.map(item =>
                                                                    <Col key={item.id} span={24}>
                                                                        <Checkbox value={item.id}>{this.userInfoSpan(item)}</Checkbox>
                                                                    </Col>)
                                                                }
                                                            </CheckboxGroup>
                                                            :
                                                            <RadioGroup defaultValue={(info.executorSet || []).length === 1 ? info.executorSet[0].id : null} onChange={(e) => this.onChange(e, node.id, info.nodeId)}>
                                                                {info.executorSet.map(item =>
                                                                    <Col key={item.id} span={24}>
                                                                        <Radio value={item.id}>{this.userInfoSpan(item)}</Radio>
                                                                    </Col>)
                                                                }
                                                            </RadioGroup>
                                                    ) : this.getSpanByInfo(info, node)
                                                }
                                            </FormItem>
                                        </div>
                                    ))
                                }
                            </Card>)
                        )
                    }
                </Modal>
            </div>
        );
    }
}

const columns = [
    {
        title: seiIntl.get({ key: 'common_000217', desc: '流程名称' }),
        width: 200,
        dataIndex: 'flowName',
        render: (text, record, index) => {
            if (text) {
                return <span title={text}>{text}</span>;
            }
            return null;
        }
    },
    {
        title: seiIntl.get({ key: 'common_000218', desc: '任务名称' }),
        dataIndex: 'taskName',
        width: 200,
        render: (text, record, index) => {
            if (record) {
                const res = `${record.taskName}`;
                return <span title={res}>{res}</span>;
            }
            return null;
        }
    },
    {
        title: seiIntl.get({ key: 'common_000219', desc: '单号' }),
        dataIndex: 'businessCode',
        width: 110,
        render: (text, record, index) => {
            if (record) {
                const res = `${record.flowInstance ? record.flowInstance.businessCode : ""}`;
                return <span title={res}>
                    {res}
                </span>;
            }
            return null;
        }
    },
    {
        title: seiIntl.get({ key: 'common_000220', desc: '说明' }),
        dataIndex: 'businessModelRemark',
        width: 250,
        render: (text, record, index) => {
            if (record) {
                const res = `${record.flowInstance ? record.flowInstance.businessModelRemark : ""}`;
                return <span title={res}>{res}</span>;
            }
            return null;
        }
    },
    {
        title: seiIntl.get({ key: 'common_000221', desc: '任务发起人' }),
        dataIndex: 'creatorName',
        width: 200,
        render: (text, record, index) => {
            if (record) {
                const res = `${record.creatorName}【${record.creatorAccount}】`;
                return <span title={res}>{res}</span>;
            }
            return null;
        }
    },
    {
        title: seiIntl.get({ key: 'common_000222', desc: '任务到达时间' }),
        dataIndex: 'createdDate',
        width: 100,
        render: (text, record, index) => {
            if (record) {
                const res = `${countDate(record.createdDate)}`;
                return <span title={res}>{res}</span>;
            }
            return null;
        }
    }
]

const mapStateToProps = ({}) => {
    return {};
};
export default connect(mapStateToProps)(BatchApprove);

