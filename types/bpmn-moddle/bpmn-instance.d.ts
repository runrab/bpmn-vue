// @Description:扩展
declare interface BpmnScript {
    scriptFormat?: string
    resource?: string
    value?: string
}

declare interface BpmnField {
    name: string
    expression?: string
    stringValue?: string
    string?: string
    htmlVar?: string
}

declare interface BpmnExtensionElements {
    values: any[]
}

declare interface BpmnExecutionListener {
    event: string
    expression?: string
    class?: string
    delegateExpression?: string
    script?: BpmnScript
    fields?: BpmnField[]
}

declare interface BpmnExtensionProperty {
    id?: string
    name?: string
    value?: string
}

declare interface BpmnExtensionProperties {
    values: BpmnExtensionProperty[]
}


// 任务监听器相关

declare interface BpmnTaskElements {
    values: any[]
}

declare interface BpmnTaskListener {
    event: string
    expression?: string
    class?: string
    delegateExpression?: string
    script?: BpmnScript
    fields?: BpmnField[]
}

declare interface BpmnTaskProperty {
    id?: string
    name?: string
    value?: string
}

declare interface BpmnTaskProperties {
    values: BpmnTaskProperty[]
}


