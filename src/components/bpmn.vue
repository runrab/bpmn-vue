<script lang="ts" setup>
import {onMounted, reactive, Ref, ref, watch} from 'vue'
import {ElButton, ElButtonGroup, ElDialog, ElIcon} from 'element-plus'
import {Document, DocumentAdd, Download, FolderAdd, PictureFilled, SuccessFilled, View} from '@element-plus/icons-vue'
// 提交和保存按钮 SuccessFilled CircleCloseFilled
import 'element-plus/theme-chalk/index.css';
// 样式
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'bpmn-js-properties-panel/dist/assets/element-templates.css';
import 'bpmn-js-properties-panel/dist/assets/properties-panel.css';
// bpmn构建器
import BpmnModeler from 'bpmn-js/lib/Modeler.js' // 引入 bpmn-js
// 初始化xml
import diagramXML from '@/assets/bpmnXML'
// 汉化
import zh from '@/assets/zh'
// 构建模块
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json'
import axios from "axios";

// 扩展左侧选择面板
import EnhancementPaletteProvider from "@/components/Palette";
// 扩展节点右键
import EnhancementContextPad from "@/components/ContextPad"
import modelerStore from '@/store/modeler'

const bpmn: Ref<HTMLDivElement | null> = ref(null)
const bpmnPanel: Ref<HTMLDivElement | null> = ref(null)
const fileElement: Ref<HTMLInputElement | null> = ref(null)
const downloadLinkEl: Ref<HTMLLinkElement | null> = ref(null)
const downloadSvgEl: Ref<HTMLLinkElement | null> = ref(null)
let bpmnModeler: Ref<any> = ref(null)
let perviewXMLShow = ref(false)
let perviewSVGShow = ref(false)
let perviewXMLStr = ref('')
let perviewSVGData = ref('')

onMounted(() => {
  bpmnModeler.value = new BpmnModeler({
    container: bpmn.value,
    // 键盘
    keyboard: {
      bindTo: document // 或者window，注意与外部表单的键盘监听事件是否冲突
    },
    propertiesPanel: {
      parent: bpmnPanel.value
    },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      CamundaPlatformPropertiesProviderModule,
      EnhancementPaletteProvider,
      EnhancementContextPad,
      // CloudElementTemplatesPropertiesProviderModule,
      {
        translate: ['value', customTranslate]
      }
    ],
    moddleExtensions: {
      camunda: camundaModdleDescriptor
    }
  })
  createNewDiagram()
  handleModeler()
  initModel();
})

async function initModel() {
  let store = modelerStore()
  if (store.getModeler) {
    // 清除旧 modeler
    store.getModeler.destroy()
    store.setModeler(undefined)
  }
  store.setModeler(bpmnModeler.value)
}


// 文件上传
function fileChange() {
  if (fileElement.value && fileElement.value.files) {
    const file = fileElement.value.files[0]
    const fileReader = new FileReader();
    fileElement.value.value = ''
    fileReader.onload = (e: any) => {
      bpmnModeler.value.importXML(e.target.result)
    }
    fileReader.readAsText(file);
  }
}

// 点击文件上传
function upload() {
  fileElement.value?.click()
}

// 新建
function newCreateDoc() {
  bpmnModeler.value.importXML(diagramXML)
}

// 下载XML
async function downloadLinkClick() {
  try {
    const {xml} = await bpmnModeler.value.saveXML({format: true});
    setEncoded(downloadLinkEl, 'diagram.bpmn', xml);
  } catch (error) {
    console.error('下载失败');
  }
}

// 部署
async function deployProcDefClick() {
  try {
    let {xml} = await bpmnModeler.value.saveXML({format: true});
    let processName = getProcessName();
    let formData = new FormData();
    formData.append('file', new Blob([xml], {type: 'text/xml'}), processName + '.bpmn');
    formData.append('deployment-name', processName);
    formData.append('deployment-source', 'Camunda Modeler');
    formData.append('enable-duplicate-filtering', 'true');
    await axios.post('http://localhost:8080/engine-rest/deployment/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('上传成功');
  } catch (error) {
    console.error('上传失败', error);
  }
}


const curNodeInfo = reactive({
  curType: "",  // 任务类型 用户任务
  curNode: "",
  expValue: "",//多用户和部门角色实现
});
watch(curNodeInfo, (newValue, oldValue) => {
  // 在 curNodeInfo 对象发生变化后执行相应逻辑
  // 这里调用 addEventPlant 函数来添加事件监听器
  if (curNodeInfo.curNode != "") {
    addEventPlant();
  }
});

function handleModeler() {
  bpmnModeler.value.on("element.click", (e: {
    element: any
  }) => {
    // 用户任务触发
    if ("bpmn:UserTask" === e.element.type) {
      curNodeInfo["curNode"] = e.element.id;
      curNodeInfo["curType"] = e.element.type;
    } else {
      // 事件改变的时候清空
      curNodeInfo["curType"] = "";
      curNodeInfo["expValue"] = "";
    }
  });

}

function addEventPlant() {
  //  let assigneeDiv =  bpmnPanel.value.querySelector('[data-group-id="group-CamundaPlatform__UserAssignment"]') as HTMLDivElement;
  //
  let assigneeDiv = document.querySelector('[data-group-id="group-CamundaPlatform__UserAssignment"]') as HTMLDivElement;
  if (assigneeDiv) {
    assigneeDiv.addEventListener('click', function (e) {
      let assigneeUser = assigneeDiv.getElementsByClassName('bio-properties-panel-input')[0] as HTMLButtonElement
      assigneeUser.setAttribute('placeholder', '双击选择用户');
      // dblclick 双击事件
      assigneeUser.addEventListener('dblclick', onFormThreeClick);
    })
  }
}

function onFormThreeClick() {
  alert("选择了用户")
}

function getProcessName() {
  // 获得根节点下的业务对象 businessObject
  let rootElement = bpmnModeler.value.get("canvas").getRootElement();
  let {businessObject} = rootElement;
  let processName = businessObject.get("name");
  return processName == undefined ? "canvas" : processName;
}

// 下载SVG
async function downloadSvg() {
  try {
    const {svg} = await bpmnModeler.value.saveSVG();
    setEncoded(downloadSvgEl, 'diagram.svg', svg);
  } catch (error) {
    console.error('下载失败，请重试')
  }
}

// XML预览
async function perviewXML() {
  try {
    const {xml} = await bpmnModeler.value.saveXML({format: true});
    perviewXMLStr.value = xml
    perviewXMLShow.value = true
  } catch (error) {
    console.error('预览失败，请重试')
  }
}

// SVG预览
async function perviewSVG() {
  try {
    const {svg} = await bpmnModeler.value.saveSVG();
    perviewSVGData.value = svg
    perviewSVGShow.value = true
  } catch (error) {
    console.error('预览失败，请重试')
  }
}

// 汉化
function customTranslate(template: any, replacements: any) {
  replacements = replacements || {};
  template = (zh as Record<string, string>)[template] || template;
  return template.replace(/{([^}]+)}/g, function (_: any, key: any) {
    return replacements[key] || '{' + key + '}';
  });
}

// 设置数据
function setEncoded(link: Ref<HTMLLinkElement | null>, name: string, data: any) {
  const encodedData = encodeURIComponent(data);
  if (link.value && data) {
    link.value.className += ('active')
    link.value.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData)
    link.value.setAttribute('download', name)
  } else {
    link.value?.className.replace('active', '')
  }
}

// 创建BPMN区域
function createNewDiagram() {
  openDiagram(diagramXML);
}

async function openDiagram(xml: string) {
  bpmnModeler.value.importXML(xml);
}
</script>

<template>
  <div class="app-container">
    <div class="bpmn-main-box">
      <div id="bpmn-container" ref="bpmn" class="bpmn-container"></div>
      <div id="js-properties-panel" ref="bpmnPanel"></div>
    </div>
    <ul class="buttons">
      <input ref="fileElement" style="display: none" type="file" @change="fileChange"/>
      <!--部署-->
      <el-button-group class="item download">
        <el-button type="success" @click="deployProcDefClick()">
          <a title="部署">
            <el-icon>
              <SuccessFilled/>
            </el-icon>
          </a>
        </el-button>
      </el-button-group>

      <el-button-group class="item download">
        <el-button type="info" @click="upload()">
          <a title="上传文件">
            <el-icon>
              <FolderAdd/>
            </el-icon>
          </a>
        </el-button>
        <el-button type="info" @click="newCreateDoc()">
          <a title="新建">
            <el-icon>
              <DocumentAdd/>
            </el-icon>
          </a>
        </el-button>
      </el-button-group>
      <el-button-group class="item download">
        <el-button type="info" @click="downloadLinkClick()">
          <a id="js-download-diagram" ref="downloadLinkEl" title="xml下载">
            <el-icon>
              <Download/>
            </el-icon>
          </a>
        </el-button>
        <el-button type="info" @click="downloadSvg">
          <a id="js-download-svg" ref="downloadSvgEl" title="svg下载">
            <el-icon>
              <PictureFilled/>
            </el-icon>
          </a>
        </el-button>
      </el-button-group>
      <el-button-group class="item download">
        <el-button type="info" @click="perviewXML">
          <a title="xml预览">
            <el-icon>
              <Document/>
            </el-icon>
          </a>
        </el-button>
        <el-button type="primary" @click="perviewSVG">
          <a title="svg预览">
            <el-icon>
              <View/>
            </el-icon>
          </a>
        </el-button>
      </el-button-group>
    </ul>
    <el-dialog v-model="perviewXMLShow" title="XML预览" width="80%">
      <div style="max-height: 65vh;overflow: auto;">
        <highlightjs :code="perviewXMLStr" language='html'/>
      </div>
    </el-dialog>
    <el-dialog v-model="perviewSVGShow" title="SVG预览" width="80%">
      <div style="text-align: center;" v-html="perviewSVGData"/>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  position: relative;
  height: 100vh;
  width: 100%;
}

.buttons {
  position: absolute;
  bottom: 30px;
  display: flex;
  left: 50px;
  padding: 0;
  margin: 0;
  list-style: none;

  .item {
    margin-right: 10px;
  }

  .download button {
    padding: 0;

    a {
      padding: 8px 15px;
    }
  }
}

.bpmn-main-box {
  width: 100%;
  height: 100%;
  display: flex;
}

.bpmn-container {
  width: 100%;
  height: 100%;
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTQwIDBIMHY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+') repeat !important;
}

#js-properties-panel {
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 250px;
}

.code-block {
  white-space: pre;
  max-height: 600px;
  overflow-y: auto;
  font-size: medium;
  color: #a9b7c6;
  background: #282b2e;
  padding: 16px;
}

a {
  text-decoration: none;
  color: #fff;
}
</style>
<style lang="scss">
/*隐藏 右上角样式 必须设置在这里面*/
/*
.bio-properties-panel-header {
  display: none;
}*/

/**覆盖面板样式*/
.bio-properties-panel-group-header {
  height: 40px;
  width: 250px;
}

.bio-properties-panel-group-header .bio-properties-panel-group-header-title {
  margin: 2px 15px 0;
}

.bio-properties-panel-input {
  border-radius: 5px;
  height: 30px;
}
</style>
