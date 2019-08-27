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
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;
const FormItem = Form.Item;

class DefinaionModal extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const {confirmLoading, modalVisible, handleOk, handleCancel, operator, editData={}, selectedNode={}} = this.props;
    let auth =getUserInfo();
     //console.log("editData:",editData)
    let src = flowDefUrl;
    src=src+`/show?orgId=${selectedNode.id}&orgCode=${selectedNode.code}&_s=${auth.sessionId}`;
    let orgName=encodeURIComponent(encodeURIComponent(selectedNode.name));
    let title =seiIntl.get({key: 'flow_000039', desc: '新增'});
    if (operator==="edit") {
      title =seiIntl.get({key: 'flow_000031', desc: '编辑'});
      src=src+`&businessModelId=${editData.flowType.businessModel.id}&businessModelCode=${editData.flowType.businessModel.className}&id=${editData.id}`
    }else if(operator==="refAdd"){
      title =seiIntl.get({key: 'flow_000114', desc: '参考创建'});
      src=src+`&orgName=${orgName}&businessModelId=${editData.flowType.businessModel.id}&businessModelCode=${editData.flowType.businessModel.className}&id=${editData.id}&isFromVersion=${false}&isCopy=${true}`
    }else if(operator==="versionRef"){//从流程版本定义进来的
      title =seiIntl.get({key: 'flow_000114', desc: '参考创建'});
      src=src+`&versionCode=${editData.versionCode}&businessModelId=${editData.flowDefination.flowType.businessModel.id}&businessModelCode=${editData.flowDefination.flowType.businessModel.className}&id=${editData.flowDefination.id}&isFromVersion=${false}&isCopy=${true}&orgName=${orgName}`
    }else if(operator==="versionEdit"){//从流程版本定义进来的
      title =seiIntl.get({key: 'flow_000031', desc: '编辑'});
      src=src+`&versionCode=${editData.versionCode}&businessModelId=${editData.flowDefination.flowType.businessModel.id}&businessModelCode=${editData.flowDefination.flowType.businessModel.className}&id=${editData.flowDefination.id}&isFromVersion=${true}`
    }else if(operator==="versionView"){//从流程版本定义进来的
      title =seiIntl.get({key: 'flow_000127', desc: '查看流程定义'});
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
          <iframe style={{width: "1200px", height: "600px", textAlign: "center"}} src={src}/>
        </Modal>
      </div>
    );
  }
}

export default DefinaionModal;
