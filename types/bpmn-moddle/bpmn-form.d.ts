// @Description:扩展
declare interface ScriptForm extends BpmnScript {
  scriptType?: string
}

declare interface ExecutionListenerForm extends BpmnExecutionListener {
  type: string
  script?: ScriptForm
}

declare interface FormItemVisible {
  listenerType: string
  scriptType: string
}

declare interface ConditionalForm {
  conditionType?: string
  expression?: string
  scriptType?: string
  language?: string
  body?: string
  resource?: string
}

// 任务监听器声明
declare interface TaskListenerForm extends BpmnTaskListener {
  type: string
  script?: ScriptForm
}
