export default [
  {
    path: '/user',
    component: '../layouts/LoginLayout',
    title: '用户登录',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { title: '登录', path: '/user/login', component: './Login' },
    ],
  },
  {
    path: '/',
    component: '../layouts/AuthLayout',
    title: '业务页面',
    routes: [
      { path: '/', redirect: '/dashboard' },
      { title: 'dashboard', path: '/dashboard', component: './Dashboard' },
      { title: '个人待办', path: '/homepage', component: './homepage' },
      { title: '应用模块', path: '/AppModuleTable', component: './AppModule/AppModuleTable' },
      { title: '工作界面配置', path: '/WorkPageTable', component: './WorkPage/WorkPageTable' },
      { title: '业务实体管理', path: '/BusinessModelTable', component: './businessModel/BusinessModelTable' },

      { title: '流程类型', path: '/FlowTypeTable', component: './FlowType/FlowTypeTable' },
      { title: '流程定义', path: '/FlowDefinationView', component: './FlowDefination/FlowDefinationView' },
      { title: '流程定义新', path: '/FlowDefinationViewNew', component: './FlowDefinationNew/FlowDefinationView' },
      { title: '定义页面', path: '/DefinaionPage', component: './FlowDefination/DefinaionPage' },
      { title: '展示页面', path: '/show', component: './FlowDesign' },
      { title: '流程查看', path: '/showLook', component: './FlowLook' },
      { title: '用户配置', path: '/configUser', component: './ConfigUser' },
      { title: '任务创建', path: '/taskMakeOverPower', component: './TaskMakeOverPower/TaskMakeOverPowerTable' },

      /*流程监管*/
      { title: '流程实例', path: '/FlowInstanceTable', component: './FlowInstance/FlowInstanceTable' },
      { title: '推送任务管理', path: '/PushFlowTaskTable', component: './PushFlowTask/PushFlowTaskTable' },
      { title: '任意转办', path: '/TurnToDoTable', component: './TurnToDo/TurnToDoTable' },
      { title: '加签管理', path: '/AddSignTable', component: './AddSign/AddSignTable' },
      { title: '减签管理', path: '/SubtractTable', component: './SubtractSign/SubtractSignTable' },
      /*通用单据（自测使用）*/
      { title: '通用单据', path: '/BusinessModel2View', component: './DefaultBusinessModel2/BusinessModel2View' },

      /*审批页面（自测使用）*/
      { title: '通用单据', path: '/builtInApprove/look', component: './Approve/DetailBusinessModel2' },
    ],
  },
];

