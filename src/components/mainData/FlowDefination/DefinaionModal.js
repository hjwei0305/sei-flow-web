/**
 * @description 工作界面编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import {Form, Input, Modal, Checkbox} from 'antd';
import SearchTable from "../../../commons/components/SearchTable";
import {appModuleConfig} from "../../../configs/CommonComponentsConfig";
import {flowDefUrl} from "../../../configs/DefaultConfig";
import queryString from "query-string";
import {cache, getUserInfo} from "../../../commons/utils/CommonUtils";

const FormItem = Form.Item;

class DefinaionModal extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const {confirmLoading, modalVisible, handleOk, handleCancel, operator, editData={}, selectedNode} = this.props;
    let auth =getUserInfo();
     console.log("auth:",auth)
    let src = flowDefUrl;
    src=src+`/show?orgId=${selectedNode.id}&orgCode=${selectedNode.code}&_s=${auth.sessionId}`;
    let orgName=encodeURIComponent(encodeURIComponent(selectedNode.name));
    let title = "新增";
    if (operator==="edit") {
      title = "编辑";
      src=src+`&businessModelId=${editData.flowType.businessModel.id}&businessModelCode=${editData.flowType.businessModel.className}&id=${editData.id}`
    }else if(operator==="refAdd"){
      title = "参考创建";
      src=src+`&orgName=${orgName}&businessModelId=${editData.flowType.businessModel.id}&businessModelCode=${editData.flowType.businessModel.className}&id=${editData.id}&isFromVersion=${false}&isCopy=${true}`
    }else if(operator==="versionRef"){//从流程版本定义进来的
      title = "参考创建";
      src=src+`&businessModelId=${editData.flowDefination.flowType.businessModel.id}&businessModelCode=${editData.flowDefination.flowType.businessModel.className}&id=${editData.flowDefination.id}&isFromVersion=${true}&isCopy=${true}`
    }else if(operator==="versionEdit"){//从流程版本定义进来的
      title = "编辑";
      src=src+`&businessModelId=${editData.flowDefination.flowType.businessModel.id}&businessModelCode=${editData.flowDefination.flowType.businessModel.className}&id=${editData.flowDefination.id}&isFromVersion=${true}`
    }else if(operator==="versionView"){//从流程版本定义进来的
      title = "查看流程定义";
      src=flowDefUrl+`/showLook?id=${editData.id}&_s=${auth.sessionId}`
    }

    return (
      <div>
        <Modal title={title}
               visible={modalVisible}
               onOk={handleOk}
               onCancel={handleCancel}
               width={1300}
               afterClose={this.handleClose}
               confirmLoading={confirmLoading}
               maskClosable={false}
               footer={false}
               bodyStyle={{textAlign:"center"}}
        >
          {/*<iframe style={{width:"1100px",height:"600px",textAlign:"center"}}*/}
          {/*src="http://tsei.changhong.com:80/flow-web/design/show?orgId=791A1FE9-2466-11E9-9E1C-0242C0A84416&orgCode=10001&id=17B8DB30-30E7-11E9-A425-0242C0A84422&businessModelId=63EA9B27-9046-11E8-AC99-0242C0A84413&businessModelCode=com.ecmp.qyd.pay.entity.PaymentRequest&_s=bca80610-0045-433a-82c7-502e1445e068">*/}
          {/*</iframe>*/}

          <iframe style={{width: "1200px", height: "600px", textAlign: "center"}} src={src}/>
        </Modal>
      </div>
    );
  }
}

export default DefinaionModal;
