

import {getAllPositionCategory} from "../components/baf/PositionCategoryManagement/PositionCategoryService";
import {searchListByKey} from "../commons/utils/CommonUtils";
import {listAllTree} from "../components/baf/Organization/OrganizationService";
import {listAllDataRoleGroup, listAllFeatureRoleGroup} from "../components/baf/Position/PositionService";
import {getAllCountry} from "../components/baf/Country/CountryService";
import {getAllList} from "../components/baf/AppModule/AppModuleService";
import {getAllAuthorizeEntityType} from "../components/baf/AuthorizeEntityType/AuthorizeEntityTypeService";
import {getAllFeatureByPage} from "../components/baf/Feature/FeatureService";

/**
 * SearchTable
 */

//岗位类别
export const positionCategoryConfig = {
    columns: [{
        title: '代码',
        dataIndex: 'code',
        width: 140
    },
        {
            title: '名称',
            dataIndex: 'name',
        }],
    dataService: getAllPositionCategory,
    searchService: searchListByKey,
    key: 'id',
    text: 'name'
};
//功能角色组
export const featureRoleGroupConfig = {
    columns: [{
        title: '代码',
        dataIndex: 'code',
        width: 140
    },
        {
            title: '名称',
            dataIndex: 'name',
        }],
    dataService: listAllFeatureRoleGroup,
    searchService: searchListByKey,
    key: 'id',
    text: 'name'
};
//数据角色组
export const dataRoleGroupConfig = {
    columns: [{
        title: '代码',
        dataIndex: 'code',
        width: 140
    },
        {
            title: '名称',
            dataIndex: 'name',
        }],
    dataService: listAllDataRoleGroup,
    searchService: searchListByKey,
    key: 'id',
    text: 'name'
};
//国家
export const countryConfig = {
    columns: [{
        title: '代码',
        dataIndex: 'code',
        width: 140
    },
        {
            title: '名称',
            dataIndex: 'name',
        }],
    dataService: getAllCountry,
    searchService: searchListByKey,
    key: 'id',
    text: 'name'
};
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
//权限对象类型
export const authorizeEntityTypeConfig = {
    columns: [{
        title: '代码',
        dataIndex: 'code',
        width: 140
    },
        {
            title: '名称',
            dataIndex: 'name',
        }],
    dataService: getAllAuthorizeEntityType,
    searchService: searchListByKey,
    key: 'id',
    text: 'name'
};

//功能项
export const featureConfig = {
    columns: [{
        title: '代码',
        dataIndex: 'code',
        width: 140
    },
        {
            title: '名称',
            dataIndex: 'name',
        }],
    dataService: getAllFeatureByPage,
    key: 'id',
    text: 'name'
};


/**
 * TreeSelected
 */

//组织机构
export const organizationConfig = {
    service: listAllTree,
    key: 'id',
    text: 'name'
};

