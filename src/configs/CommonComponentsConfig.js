import {searchListByKey} from "../commons/utils/CommonUtils";
import {getAllList,findAllAppModuleByAuth} from "../components/mainData/AppModule/AppModuleService";
import {findAllByAuth} from "../components/mainData/FlowType/FlowTypeService";
import {findBusinessModelByAppModuleId,findFlowTypeByBusinessModelId} from "../components/mainData/FlowInstance/FlowInstanceService";


/**
 * SearchTable
 */

//应用模块
export const appModuleConfig = {
    columns: [{
        title: '代码',
        dataIndex: 'code',
        width: 140
    },
        {
            title: '名称',
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
        title: '代码',
        dataIndex: 'code',
        width: 140
    },
        {
            title: '名称',
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
            title: '名称',
            dataIndex: 'name',
        },
        {
            title: '所属应用模块',
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
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '所属应用模块',
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
      title: '代码',
      dataIndex: 'code',
    }, {
      title: '名称',
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



