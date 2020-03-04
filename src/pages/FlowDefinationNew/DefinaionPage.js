/**
 * @description 工作界面编辑弹窗
 * @author 李艳
 */

import React, {Component} from 'react'
import { seiLocale } from 'sei-utils';
import { constants, userUtils, } from '@/utils';

const { flowDefUrlNew, } = constants;
const { getSessionId, } = userUtils;
const { seiIntl } = seiLocale;

class DefinaionPage extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const { operator, editData={}, selectedNode={}} = this.props;
    let auth ={sessionId: getSessionId() };
    let src = flowDefUrlNew;
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
      src=flowDefUrlNew+`/showLook?id=${editData.id}&_s=${auth.sessionId}`
    }
    return (
      <div style={{width: "100%", height: "100%",overflow:"hidden"}}>
          <iframe  style={{width: "100%", height: "100%", textAlign: "center",overflow:"auto"}} src={src}/>
      </div>
    );
  }
}

export default DefinaionPage;
