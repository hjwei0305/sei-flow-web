
import {searchListByKey} from "../commons/utils/CommonUtils";
import {getAllList} from "../components/mainData/AppModule/AppModuleService";


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





/**
 * TreeSelected
 */



