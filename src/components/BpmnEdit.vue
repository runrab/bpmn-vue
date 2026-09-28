<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref, watch, type Ref } from 'vue'
import { Document, DocumentAdd, Download, FolderAdd, PictureFilled, SuccessFilled, View } from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/index.css'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css'
import '@/assets/properties-panel-modern.css'

import BpmnModeler from 'bpmn-js/lib/Modeler.js'
import diagramXML from '@/assets/bpmnXML'
import zh from '@/assets/zh'
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json'
import axios from 'axios'

import EnhancementPaletteProvider from '@/components/Palette'
import EnhancementContextPad from '@/components/ContextPad'
import modelerStore from '@/store/modeler'

const bpmn: Ref<HTMLDivElement | null> = ref(null)
const bpmnPanel: Ref<HTMLDivElement | null> = ref(null)
const fileElement: Ref<HTMLInputElement | null> = ref(null)
const downloadLinkEl: Ref<HTMLLinkElement | null> = ref(null)
const downloadSvgEl: Ref<HTMLLinkElement | null> = ref(null)
const bpmnModeler = ref<any>(null)

const perviewXMLShow = ref(false)
const perviewSVGShow = ref(false)
const perviewXMLStr = ref('')
const perviewSVGData = ref('')

const curNodeInfo = reactive({
  curType: '',
  curNode: '',
  expValue: ''
})

onMounted(async () => {
  bpmnModeler.value = new BpmnModeler({
    container: bpmn.value,
    keyboard: { bindTo: document },
    propertiesPanel: { parent: bpmnPanel.value },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      CamundaPlatformPropertiesProviderModule,
      EnhancementPaletteProvider,
      EnhancementContextPad,
      { translate: ['value', customTranslate] }
    ],
    moddleExtensions: { camunda: camundaModdleDescriptor }
  })

  await createNewDiagram()
  handleModeler()
  initModel()
})

onUnmounted(() => {
  bpmnModeler.value?.destroy()
  modelerStore().setModeler(undefined)
})

function initModel() {
  const store = modelerStore()
  if (store.getModeler && store.getModeler !== bpmnModeler.value) {
    store.getModeler.destroy()
  }
  store.setModeler(bpmnModeler.value)
}

function fileChange() {
  const file = fileElement.value?.files?.[0]
  if (!file) return

  const fileReader = new FileReader()
  if (fileElement.value) fileElement.value.value = ''
  fileReader.onload = (e) => bpmnModeler.value.importXML(e.target?.result)
  fileReader.readAsText(file)
}

function upload() {
  fileElement.value?.click()
}

async function newCreateDoc() {
  await bpmnModeler.value.importXML(diagramXML)
}

async function downloadLinkClick() {
  try {
    const { xml } = await bpmnModeler.value.saveXML({ format: true })
    setEncoded(downloadLinkEl, 'diagram.bpmn', xml)
  } catch (error) {
    console.error('下载失败', error)
  }
}

async function deployProcDefClick() {
  try {
    const { xml } = await bpmnModeler.value.saveXML({ format: true })
    const processName = getProcessName()
    const formData = new FormData()
    formData.append('file', new Blob([xml], { type: 'text/xml' }), processName + '.bpmn')
    formData.append('deployment-name', processName)
    formData.append('deployment-source', 'Camunda Modeler')
    formData.append('enable-duplicate-filtering', 'true')

    await axios.post('http://localhost:8080/engine-rest/deployment/create', formData)
    console.log('上传成功')
  } catch (error) {
    console.error('上传失败', error)
  }
}

watch(curNodeInfo, () => {
  if (curNodeInfo.curNode) addEventPlant()
})

function handleModeler() {
  bpmnModeler.value.on('element.click', (e: { element: any }) => {
    if (e.element.type === 'bpmn:UserTask') {
      curNodeInfo.curNode = e.element.id
      curNodeInfo.curType = e.element.type
    } else {
      curNodeInfo.curType = ''
      curNodeInfo.expValue = ''
    }
  })
}

function addEventPlant() {
  const assigneeDiv = bpmnPanel.value?.querySelector(
    '[data-group-id="group-CamundaPlatform__UserAssignment"]'
  ) as HTMLDivElement | null
  if (!assigneeDiv) return

  const assigneeUser = assigneeDiv.querySelector('.bio-properties-panel-input') as HTMLInputElement | null
  if (!assigneeUser) return

  assigneeUser.placeholder = '双击选择用户'
  assigneeUser.ondblclick = onFormThreeClick
}

function onFormThreeClick() {
  alert('选择了用户')
}

function getProcessName() {
  const rootElement = bpmnModeler.value.get('canvas').getRootElement()
  const processName = rootElement.businessObject.get('name')
  return processName ?? 'canvas'
}

async function downloadSvg() {
  try {
    const { svg } = await bpmnModeler.value.saveSVG()
    setEncoded(downloadSvgEl, 'diagram.svg', svg)
  } catch (error) {
    console.error('下载失败，请重试', error)
  }
}

async function perviewXML() {
  try {
    const { xml } = await bpmnModeler.value.saveXML({ format: true })
    perviewXMLStr.value = xml
    perviewXMLShow.value = true
  } catch (error) {
    console.error('预览失败，请重试', error)
  }
}

async function perviewSVG() {
  try {
    const { svg } = await bpmnModeler.value.saveSVG()
    perviewSVGData.value = svg
    perviewSVGShow.value = true
  } catch (error) {
    console.error('预览失败，请重试', error)
  }
}

function customTranslate(template: string, replacements: Record<string, string> = {}) {
  template = (zh as Record<string, string>)[template] || template
  return template.replace(/{([^}]+)}/g, (_, key) => replacements[key] || '{' + key + '}')
}

function setEncoded(link: Ref<HTMLLinkElement | null>, name: string, data?: string) {
  if (!link.value || !data) return
  link.value.href = 'data:application/bpmn20-xml;charset=UTF-8,' + encodeURIComponent(data)
  link.value.download = name
  link.value.click()
}

async function createNewDiagram() {
  await bpmnModeler.value.importXML(diagramXML)
}
</script>

<template>
  <div class="app-container">
    <div class="bpmn-main-box">
      <main ref="bpmn" class="bpmn-container" />
      <aside class="properties-shell">
        <div class="properties-shell__header">
          <h2 class="properties-shell__title">属性配置</h2>
          <p class="properties-shell__desc">选择流程节点后，在这里编辑名称、执行配置和 Camunda 属性。</p>
        </div>
        <div id="js-properties-panel" ref="bpmnPanel" />
      </aside>
    </div>

    <div class="toolbar">
      <input ref="fileElement" hidden type="file" accept=".bpmn,.xml,text/xml" @change="fileChange">

      <el-button-group>
        <el-button type="success" title="部署流程" @click="deployProcDefClick">
          <el-icon><SuccessFilled /></el-icon>
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button title="打开文件" @click="upload">
          <el-icon><FolderAdd /></el-icon>
        </el-button>
        <el-button title="新建流程" @click="newCreateDoc">
          <el-icon><DocumentAdd /></el-icon>
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button title="下载 BPMN" @click="downloadLinkClick">
          <el-icon><Download /></el-icon>
        </el-button>
        <el-button title="下载 SVG" @click="downloadSvg">
          <el-icon><PictureFilled /></el-icon>
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button title="预览 XML" @click="perviewXML">
          <el-icon><Document /></el-icon>
        </el-button>
        <el-button type="primary" title="预览 SVG" @click="perviewSVG">
          <el-icon><View /></el-icon>
        </el-button>
      </el-button-group>
    </div>

    <a ref="downloadLinkEl" class="hidden-download" />
    <a ref="downloadSvgEl" class="hidden-download" />

    <el-dialog v-model="perviewXMLShow" title="XML 预览" width="80%">
      <div class="preview-scroll">
        <highlightjs :code="perviewXMLStr" language="xml" />
      </div>
    </el-dialog>

    <el-dialog v-model="perviewSVGShow" title="SVG 预览" width="80%">
      <div class="svg-preview" v-html="perviewSVGData" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f6f8fb;
}

.bpmn-main-box {
  display: flex;
  width: 100%;
  height: 100%;
}

.bpmn-container {
  flex: 1;
  min-width: 0;
  height: 100%;
  background-color: #f8fafc;
  background-image: radial-gradient(circle, #d7dde8 1px, transparent 1px);
  background-size: 20px 20px;
}

.toolbar {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 10;
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(226, 232, 240, .95);
  border-radius: 14px;
  background: rgba(255, 255, 255, .94);
  box-shadow: 0 10px 30px rgba(15, 23, 42, .12);
  backdrop-filter: blur(10px);

  :deep(.el-button) {
    min-width: 40px;
    height: 36px;
  }
}

.preview-scroll {
  max-height: 65vh;
  overflow: auto;
  border-radius: 10px;
}

.svg-preview {
  min-height: 320px;
  overflow: auto;
  text-align: center;
}

.hidden-download {
  display: none;
}

@media (max-width: 760px) {
  .toolbar {
    left: 12px;
    right: 12px;
    bottom: 12px;
    overflow-x: auto;
  }
}
</style>
