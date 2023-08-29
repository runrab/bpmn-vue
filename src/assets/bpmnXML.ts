function generateRandomValue() {
    // 生成一个随机数
    const randomValue = Math.random().toString(36).slice(2, 12);
    return `Process_${randomValue}`;
}

const cartage: string = "default";
export default `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_0hf6suk" targetNamespace="${cartage}" exporter="Camunda Modeler" exporterVersion="5.11.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.19.0">
  <bpmn:process id="${generateRandomValue()}" isExecutable="true" />
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
  <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${generateRandomValue()}" />
  </bpmndi:BPMNDiagram>
  </bpmn:definitions>`;
