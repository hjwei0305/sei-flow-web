/**
 * Created by pengxu on 2018/12/3.
 */
import React, {Component} from 'react';
import {Button, Col, Icon, Modal, Row, Tabs, Form, List, Timeline, Divider, Select, message} from "antd";
import httpUtils from "../utils/FeatchUtils";
import {isEmpty} from 'lodash';
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {
    span: 4
  },
  wrapperCol: {
    span: 20
  },
};
let selectItem = [];

class ApproveHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      selectValue: "",
      allData: [],
      data: {},
      historyKey: ""
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.historyKey && nextProps.historyKey.length > 0) {
      let formData = {'businessId': nextProps.historyKey};
      getFlowHistoryInfo(formData).then(res => {
        if (!isEmpty(res)) {
          selectItem = res.map((item, index) => {
            return item.flowInstance.flowName + seiIntl.get({key: 'flow_000271', desc: '于'}) + item.flowInstance.createdDate + seiIntl.get({key: 'flow_000272', desc: '发起'});
          });
          this.setState({
            data: res[0] || {},
            allData: res,
            historyKey: nextProps.historyKey,
            visible: true,
            selectValue: selectItem[0]
          })
        } else {
          message.error(seiIntl.get({key: 'flow_000273', desc: '未找到相应流程历史'}))
          this.props.setHistoryKey(null);
        }
      }).catch(err => {
        this.props.setHistoryKey(null);
      })
    }
  }


  changeLongToString = (value) => {
    var strVar = '';
    var day = Math.floor(value / (60 * 60 * 1000 * 24));
    var hour = Math.floor((value - day * 60 * 60 * 1000 * 24) / (60 * 60 * 1000));
    var minute = Math.floor((value - day * 60 * 60 * 1000 * 24 - hour * 60 * 60 * 1000) / (60 * 1000));
    var second = Math.floor((value - day * 60 * 60 * 1000 * 24 - hour * 60 * 60 * 1000 - minute * 60 * 1000) / 1000);
    if (day > 0) {
      strVar += day + seiIntl.get({key: 'flow_000274', desc: '天'});
    }
    if (hour > 0) {
      strVar += hour + seiIntl.get({key: 'flow_000275', desc: '小时'});
    }
    if (minute > 0) {
      strVar += minute + seiIntl.get({key: 'flow_000276', desc: '分'});
    }
    if (second > 0) {
      strVar += second + seiIntl.get({key: 'flow_000277', desc: '秒'});
    }
    return strVar;
  };
  okHandle = () => {
    if (this.props.setHistoryKey) {
      this.props.setHistoryKey(null);
    }
    this.setState({
      visible: false,
    })
  };
  handleModalVisible = () => {
    if (this.props.setHistoryKey) {
      this.props.setHistoryKey(null);
    }
    this.setState({visible: false})
  };
  onSelectChange = (value) => {
    this.setState({
      selectValue: selectItem[value],
      data: this.state.allData[value],

    })
  };
  gotoFlowMap = () => {
    window.open("/flow-web/design/showLook?id=" + this.state.historyKey +
      "&instanceId=" + this.state.data.flowInstance.id);
  };

  render() {
    if (!this.state.data.flowHistoryList) {
      return null;
    }
    let flowHistoryList = this.state.data.flowHistoryList;
    let flowInstance = this.state.data.flowInstance;
    let flowTaskList = this.state.data.flowTaskList;
    return (
      <Modal
        title={flowInstance.flowName + seiIntl.get({key: 'flow_000278', desc: '详情'})}
        bodyStyle={{maxHeight: "480px", overflow: "auto"}}
        width="735px"
        visible={this.state.visible}
        onOk={this.okHandle}
        afterClose={this.handleModalVisible}
        onCancel={this.handleModalVisible}
        destroyOnClose={true}
        footer={[
          <Button key="submit" type="primary" onClick={this.okHandle}>
            {seiIntl.get({key: 'flow_000258', desc: '确定'})}
          </Button>,
        ]}
        maskClosable={false}
      >
        <Row gutter={10}>
          <Col span={19}><FormItem
            {...formItemLayout}
            label={<b>{seiIntl.get({key: 'flow_000279', desc: '启动历史'})}</b>}

          >
            <Select style={{width: "100%"}}
                    value={this.state.selectValue}
                    onChange={this.onSelectChange}
            >
              {selectItem.map((item, index) => <Option key={index}>{item}</Option>)}
            </Select>
            {/*<RadioGroup onChange={this.onSelectChange} value={this.state.selectValue}>*/}
            {/*{selectItem.map((item,index) => <Radio  value={index}>{item}</Radio>)}*/}
            {/*</RadioGroup>*/}
          </FormItem></Col>
          <Col span={5} style={{marginTop: "3px"}}>
            <Button icon="search" onClick={this.gotoFlowMap}>{seiIntl.get({key: 'flow_000280', desc: '查看流程图'})}</Button></Col>
        </Row>

        <Tabs defaultActiveKey="1" style={{align: "center"}}
        >
          <TabPane tab={<span><Icon
            type="task"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {seiIntl.get({key: 'flow_000281', desc: '当前处理状态'})}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>}
                   key="1">

            {flowTaskList.length === 0 ? flowHistoryList && flowHistoryList[flowHistoryList.length - 1].depict[0] === "【" ?
              <div style={{fontSize: "24px", width: "100%", marginLeft: "250px", marginTop: "20px"}}><b>{seiIntl.get({key: 'flow_000282', desc: '该流程已被终止'})} </b>
              </div>
              : <div style={{fontSize: "24px", width: "100%", marginLeft: "250px", marginTop: "20px"}}><b>{seiIntl.get({key: 'flow_000283', desc: '流程已处理完成'})} </b>
              </div>
              :
              <List
                itemLayout="horizontal"
                dataSource={flowTaskList}
                style={{marginLeft: "30px", marginTop: "10px"}}
                renderItem={item => (
                  <>
                  <div style={{color: "#18A9FF"}}><Icon type="flag"/><b>{item.taskName}</b></div>
                  <List.Item>
                    <List.Item.Meta
                      description={
                        <div><Col span={12}>{seiIntl.get({key: 'flow_000284', desc: '等待处理人：'})}{item.ownerName}</Col><Col span={1}><Divider type="vertical"/></Col>
                          <Col span={11} style={{textAlign: "right"}}>{seiIntl.get({key: 'flow_000285', desc: '任务到达时间：'})}{item.lastEditedDate}</Col></div>}
                    />
                  </List.Item>
                  </>
                )}
              />
            }
          </TabPane>
          <TabPane tab={<span><Icon
            type=""/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {seiIntl.get({key: 'flow_000286', desc: '流程处理历史'})}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;</span>}
                   key="2">
            <Row>
              <Col span={8}>
                <div style={{color: "#18A9FF"}}><Icon type="flag"/><b>{seiIntl.get({key: 'flow_000287', desc: '流程启动'})}</b></div>
              </Col>
              <Col span={16}>
                <div
                  style={{float: "right", marginRight: "30px", color: "rgba(0, 0, 0, 0.45)"}}>{flowInstance.creatorName}<Divider
                  type="vertical"/>
                  {flowInstance.createdDate}</div>
              </Col>
            </Row>
            <Divider/>
            <Timeline
              style={{marginLeft: "30px", marginTop: "20px", color: "rgba(0, 0, 0, 0.45)"}}
            >
              {
                flowHistoryList.map((item, index) => {
                  return <Timeline.Item key={item.name + index} dot={<Icon type="clock-circle-o" color="red"/>}>
                    <Row gutter={10}>
                      <Col span={6}>
                        <div><b>{item.flowTaskName}</b></div>
                      </Col>
                      <Col span={17}>
                        <div style={{float: "right"}}>{seiIntl.get({key: 'flow_000288', desc: '处理人：'})}{item.executorName + item.actEndTime}
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={10} style={{marginTop: "5px"}}>
                      <Col span={21} offset={2}>
                        <div style={{float: "right", marginRight: "10px"}}>{seiIntl.get({key: 'flow_000289', desc: '耗时：'})}
                          {this.changeLongToString(item.actDurationInMillis)}</div>
                      </Col>
                    </Row>
                    <Row gutter={10} style={{marginTop: "5px"}}>
                      <Col span={21} offset={2}>
                        <div style={{
                          float: "right",
                          marginRight: item.depict[0] === "【" ? "5px" : "10px"
                        }}>{seiIntl.get({key: 'flow_000290', desc: '处理摘要：'})}
                          {item.depict}</div>
                      </Col>
                    </Row>
                  </Timeline.Item>
                })
              }
              {flowTaskList.length === 0 ?
                <>
                <Divider/>
                <Row>
                  <Col span={8}>
                    <div style={{color: "#18A9FF"}}><Icon type="flag"/><b>{seiIntl.get({key: 'flow_000137', desc: '流程结束'})}</b></div>
                  </Col>
                  <Col span={16}>
                    <div style={{
                      float: "right",
                      marginRight: "30px",
                      color: "rgba(0, 0, 0, 0.45)"
                    }}>{flowHistoryList[flowHistoryList.length - 1].actEndTime}</div>
                  </Col>
                </Row></> : null
              }
            </Timeline>
          </TabPane>
        </Tabs>
      </Modal>
    )
  }
}

export const getFlowHistoryInfo = (params = {}) => {
  return httpUtils.post("/flow-service/flowInstance/getProcessTrackVO", params);
};
export default ApproveHistory;
