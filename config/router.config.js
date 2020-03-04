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
      { title: '应用模块', path: '/AppModuleTable', component: './AppModule/AppModuleTable' },
    ],
  },
];

