import {searchListByKey} from "./common";
import {getAllList,findAllAppModuleByAuth} from "@/pages/AppModule/AppModuleService";
import {findAllByAuth} from "@/pages/FlowType/FlowTypeService";
import {findBusinessModelByAppModuleId,findFlowTypeByBusinessModelId} from "@/pages/FlowInstance/FlowInstanceService";
import {
  listFlowTaskApp,
  listFlowHistoryApp,
  listMyBillsApp,
} from "@/pages/homePage/service";
import { seiLocale } from 'sei-utils';
const { seiIntl } = seiLocale;

/**
 * SearchTable
 */

//应用模块
export const appModuleConfig = {
    columns: [{
        title: seiIntl.get({key: 'flow_000021', desc: '代码'}),
        dataIndex: 'code',
        width: 140
    },
        {
            title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
            dataIndex: 'name',
        }],
    dataService: getAllList,
    searchService: searchListByKey,
    key: 'id',
    text: 'name'
};
//应用模块(auth)
export const appModuleAuthConfig = {
    columns: [{
        title: seiIntl.get({key: 'flow_000021', desc: '代码'}),
        dataIndex: 'code',
        width: 140
    },
        {
            title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
            dataIndex: 'name',
        }],
    dataService: findAllAppModuleByAuth,
    searchService: searchListByKey,
    key: 'id',
    text: 'name'
};

//业务实体
export const businessModelConfig = {
    columns: [
        {
            title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
            dataIndex: 'name',
        },
        {
            title: seiIntl.get({key: 'flow_000023', desc: '所属应用模块'}),
            dataIndex: 'appModule.name',
        }],
    dataService: findAllByAuth,
    searchService: searchListByKey,
    key: 'id',
    text: 'name'
};

//业务实体（和应用模块联动）
export const businessModelByAppModelConfig = {
  columns: [
    {
      title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
      dataIndex: 'name',
    },
    {
      title: seiIntl.get({key: 'flow_000023', desc: '所属应用模块'}),
      dataIndex: 'appModule.name',
    }],
  dataService: findBusinessModelByAppModuleId,
  searchService: searchListByKey,
  key: 'id',
  text: 'name'
};


export const flowTypeByBusinessModelConfig = {
  columns: [
    {
      title: seiIntl.get({key: 'flow_000021', desc: '代码'}),
      dataIndex: 'code',
    }, {
      title: seiIntl.get({key: 'flow_000022', desc: '名称'}),
      dataIndex: 'name',
    }],
  dataService: findFlowTypeByBusinessModelId,
  searchService: searchListByKey,
  key: 'id',
  text: 'name'
}

/**
 * TreeSelected
 */

 // export const userTypeConfig = {
 //   service: listAllUserType,
 //   key: 'anEnum',
 //   text: 'remark'
 // };
 //流程待办业务类型（汇总）
 export const flowTaskAppConfig = {
   service: listFlowTaskApp,
   key: 'businessModeId',
   text: 'businessModelName'
 };

 //流程历史业务类型（汇总）
 export const flowHistoryAppConfig = {
   service: listFlowHistoryApp,
   key: 'businessModeId',
   text: 'businessModelName'
 };

 //流程我的单据类型（汇总）
 export const flowMyBillsAppConfig = {
   service: listMyBillsApp,
   key: 'businessModeId',
   text: 'businessModelName'
 };

 //应用模块
 export const appModuleAuthConfigBasic = {
   service: findAllAppModuleByAuth,
   key: 'code',
   text: 'name'
 };


