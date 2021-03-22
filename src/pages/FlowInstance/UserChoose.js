
import React from "react";
import { Card, Checkbox, Col, Modal, Radio } from "antd";
import AnyOneSelected from "./AnyOneSelected";

const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

const noUserNode = (
  <span style={{ marginLeft: "10px" }}>
    <b>未找到可用执行人</b>
  </span>
);

function getDefaultReuslt(nodes) {
  return nodes.map(node => {
    let defaultValue = null;
    if (node.executorSet === null) {
      return {
        nodeId: node.id,
        instancy: false,
        flowTaskType: node.flowTaskType,
        userIds: ""
      };
    }
    if ((node.executorSet || []).length === 1) {
      defaultValue = node.executorSet[0].id;
    }
    /** 会签单签默认全选 */
    const flowType = (node.flowTaskType || "").toLowerCase();
    if (
      flowType === "countersign" ||
      flowType === "singlesign" ||
      flowType === "paralleltask" ||
      flowType === "serialtask"
    ) {
      defaultValue = node.executorSet.map(user => user.id).toString();
    }
    return {
      nodeId: node.id,
      instancy: false,
      flowTaskType: node.flowTaskType,
      userIds: defaultValue
    };
  });
}

export default class UserChoose extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chooseResult: getDefaultReuslt(props.nextNode)
    };
  }

  componentWillReceiveProps(nextProps) {
    const { nextNode } = this.props;
    if(nextProps.nextNode !== nextNode){
      this.setState({ chooseResult: getDefaultReuslt(nextProps.nextNode) });
    }
  }

  checkAll = (e, id) => {
    const { chooseResult } = this.state;
    const { nextNode = [] } = this.props;
    const { checked } = e.target;
    chooseResult.forEach(result => {
      if (result.nodeId === id) {
        if (checked) {
          nextNode.map(node => {
            if (node.id === id) {
              result.userIds = node.executorSet
                .map(user => {
                  return user.id;
                })
                .toString();
            }
            return node;
          });
        } else {
          result.userIds = "";
        }
      }
      return result;
    });
    this.setState({ chooseResult });
  };

  instancyClick = (e, id) => {
    const { chooseResult } = this.state;
    chooseResult.forEach(result => {
      if (result.nodeId === id) {
        result.instancy = e.target.checked;
      }
    });
    this.setState({ chooseResult });
  };

  handleCancel = () => {
    const { closeModal } = this.props;
    if (closeModal) {
      closeModal();
    }
  };

  onChange = (e, nodeId) => {
    const { chooseResult } = this.state;
    const val = e.target ? e.target.value : e;
    chooseResult.forEach(result => {
      if (result.nodeId === nodeId) {
        result.userIds = val.toString();
      }
    });
    this.setState({ chooseResult });
  };

  isChoosed = () => {
    const { chooseResult } = this.state;
    chooseResult.filter(result => {
      if (result.flowTaskType === "poolTask") {
        result.userIds = "";
        return true;
      }
      return result.userIds && result.userIds !== "";
    })
  };

  userInfoSpan = user => {
    return (
      <React.Fragment>
        <span>姓名：</span>
        <span style={{ marginRight: "8px" }}>
          {`${user.name}【${user.code}】`}
        </span>
        <span>组织机构：</span>
        <span style={{ marginRight: "8px" }}>{user.organizationName}</span>
        <span>岗位：</span>
        <span style={{ marginRight: "8px" }}>{user.positionName}</span>
      </React.Fragment>
    );
  };

  okHandle = () => {
    const { completeTask } = this.props;
    const { chooseResult } = this.state;
    if (completeTask) {
      completeTask(chooseResult);
    }
  };

  getTitle = node => {
    const {
      name = "流程任务",
      flowTaskType,
      allowChooseInstancy,
      id,
      uiUserType
    } = node;
    const flowType = (flowTaskType || "").toLowerCase();
    let tempTitle = [];
    switch (flowType) {
      case "common":
        tempTitle = [`${name}-【普通任务】`];
        break;
      case "singlesign":
        tempTitle = [`${name}-【单签任务】`];
        break;
      case "countersign":
        tempTitle = [`${name}-【会签任务】`];
        break;
      case "approve":
        tempTitle = [`${name}-【审批任务】`];
        break;
      case "paralleltask":
        tempTitle = [`${name}-【并行任务】`];
        break;
      case "serialtask":
        tempTitle = [`${name}-【串行任务】`];
        break;
      case "receivetask":
        tempTitle = [`${name}-【接收任务】`];
        break;
      case "servicetask":
        tempTitle = [`${name}-【服务任务】`];
        break;
      case "pooltask":
        tempTitle = [`${name}-【工作池任务】`];
        break;
      default:
        tempTitle = [`${name}-【普通任务】`];
        break;
    }
    if (
      (flowType === "singlesign" ||
        flowType === "countersign" ||
        flowType === "paralleltask" ||
        flowType === "serialtask") &&
      uiUserType !== "AnyOne"
    ) {
      tempTitle.push(
        <Checkbox
          key="checkAll"
          defaultChecked
          style={{ marginRight: "8px" }}
          value
          onClick={e => this.checkAll(e, id)}
        >
          全选
        </Checkbox>
      );
    }
    if (allowChooseInstancy) {
      tempTitle.push(
        <Checkbox
          key="instancy"
          style={{ marginRight: "8px" }}
          value
          onClick={e => this.instancyClick(e, id)}
        >
          紧急
        </Checkbox>
      );
    }
    return tempTitle;
  };

  getCardChildren = node => {
    const { chooseResult } = this.state;
    const { flowTaskType, uiUserType, uiType, executorSet = [], id } =
      node || {};
    const showFlag = flowTaskType.toLowerCase() === "servicetask";
    if (flowTaskType.toLowerCase() === "pooltask") {
      return (
        <span style={{ marginLeft: "10px" }}>
          <b>工作池任务不用选择执行人</b>
        </span>
      );
    }
    const { userIds } = chooseResult.filter(item => item.nodeId === node.id)[0];
    if (uiUserType === "AnyOne") {
      return (
        <AnyOneSelected
          type={uiType}
          selectChange={rowIds => this.onChange(rowIds, id)}
        />
      );
    }
    if (executorSet === null) {
      return noUserNode;
    }
    if (uiType === "checkbox") {
      return (
        <CheckboxGroup
          value={userIds ? userIds.split(",") : null}
          onChange={e => this.onChange(e, id)}
          style={{ display: showFlag ? "none" : "block" }}
        >
          {executorSet.map(item => (
            <Col key={item.id} span={24}>
              <Checkbox value={item.id}>{this.userInfoSpan(item)}</Checkbox>
            </Col>
          ))}
        </CheckboxGroup>
      );
    }
    return (
      <RadioGroup
        value={userIds}
        onChange={e => this.onChange(e, id)}
        style={{ display: showFlag ? "none" : "block" }}
      >
        {executorSet.map(item => (
          <Col key={item.id} span={24}>
            <Radio value={item.id}>{this.userInfoSpan(item)}</Radio>
          </Col>
        ))}
      </RadioGroup>
    );
  };

  getCards = () => {
    const { nextNode = [] } = this.props;

    return nextNode.map(node => {
      return (
        <Card
          key={node.id}
          style={{ marginTop: "10px" }}
          title={this.getTitle(node)}
          size="small"
          headStyle={{ background: "#eee" }}
          bodyStyle={{
            padding: 10,
            overflowY: "auto",
            overflowX: "hidden"
          }}
        >
          {this.getCardChildren(node)}
        </Card>
      );
    });
  };

  render() {
    const { uiUserType, visible, confirmLoading } = this.props;
    return (
      <Modal
        title="选择目标节点执行人"
        bodyStyle={{
          height: 430,
          maxHeight: 430,
          padding: 10,
          overflow: "auto"
        }}
        width={uiUserType === "AnyOne" ? 1040 : 780}
        visible={visible}
        onOk={this.okHandle}
        onCancel={this.handleCancel}
        confirmLoading={confirmLoading}
        okButtonProps={{
          disabled: this.isChoosed()
        }}
        centered
        maskClosable={false}
      >
        {this.getCards()}
      </Modal>
    );
  }
}
