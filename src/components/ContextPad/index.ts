import {ModuleDeclaration} from 'didi'
import enhancementContextPadProvider from './ehContextPadProvider'

const enhancementContextPad: ModuleDeclaration = {
    __init__: ['enhancementContextPadProvider'],
    enhancementContextPadProvider: ['type', enhancementContextPadProvider]
}

export default enhancementContextPad
