/// <reference types="vite/client" />


declare module 'bpmn-js/lib/Modeler.js';
declare module 'bpmn-js-properties-panel';

// 解决找不到模块“*.vue”或其相应的类型声明。
declare module "*.vue" {
    import {DefineComponent} from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}
