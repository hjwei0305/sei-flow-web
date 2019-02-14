import {searchListByKey} from "../commons/utils/CommonUtils";
import {getAllList} from "../components/mainData/AppModule/AppModuleService";
import {findAllByAuth} from "../components/mainData/FlowType/FlowTypeService";


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
//业务实体
export const businessModelConfig = {
    columns: [
        {
            title: '名称',
            dataIndex: 'name',
        },
        {
            title: '所属应用模块',
            dataIndex: 'businessModel.appModule.name',
        }],
    dataService: findAllByAuth,
    searchService: searchListByKey,
    key: 'id',
    text: 'name'
};


/**
 * TreeSelected
 */



