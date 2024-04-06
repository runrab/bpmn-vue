import {defineStore} from 'pinia'
import type Modeler from 'bpmn-js/lib/Modeler'
import type Canvas from 'diagram-js/lib/core/Canvas'
import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry'

import Modeling from "bpmn-js/lib/features/modeling/Modeling.js";
import {Moddle} from "bpmn-js/lib/model/Types";

// bpmn构建器
type ModelerStore = {
    modeler: Modeler | undefined
    moddle: Moddle | undefined
    modeling: Modeling | undefined
    canvas: Canvas | undefined
    elementRegistry: ElementRegistry | undefined
    bpmnModel: Modeler | undefined
    // 流程定义根节点信息
    procDefId: string | undefined
    procDefName: string | undefined
}

const defaultState: ModelerStore = {
    modeler: undefined,
    moddle: undefined,
    modeling: undefined,
    canvas: undefined,
    elementRegistry: undefined,
    bpmnModel: undefined,
    procDefId: undefined,
    procDefName: undefined,
}

export default defineStore('modeler', {
    state: (): ModelerStore => defaultState,
    getters: {
        getModeler: (state) => state.modeler,
        getModdle: (state) => state.moddle,
        getModeling: (state): Modeling | undefined => state.modeling,
        getCanvas: (state): Canvas | undefined => state.canvas,
        getElRegistry: (state): ElementRegistry | undefined => state.elementRegistry,
        getProcDefId: (state): string | undefined => state.procDefId,
        getProcDefName: (state): string | undefined => state.procDefName,
    },
    actions: {
        // 设置根节点
        setModeler(modeler: Modeler | undefined) {
            if (modeler) {
                this.bpmnModel = modeler;
                this.modeler = modeler
                this.modeling = modeler.get('modeling')
                this.moddle = modeler.get('moddle')
                this.canvas = modeler.get('canvas')
                this.elementRegistry = modeler.get('elementRegistry')
            } else {
                this.modeling = this.moddle = this.canvas = this.elementRegistry =
                    this.bpmnModel = undefined
            }
        },
        // 设置流程定义根节点信息
        // setProcDef(bpmnModeler: BpmnModeler | undefined) {
        setProcDef(bpmnModeler: any | undefined) {
            this.procDefId = bpmnModeler.get("canvas").getRootElement().businessObject.get("id")
            this.procDefName = bpmnModeler.get("canvas").getRootElement().businessObject.get("name")
        },
    }
})
