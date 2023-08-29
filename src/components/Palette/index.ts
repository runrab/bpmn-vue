import {ModuleDeclaration} from 'didi'
import enhancementPaletteProvider from './ehPalentte'

const EnhancementPalette: ModuleDeclaration = {
    __init__: ['enhancementPaletteProvider'],
    enhancementPaletteProvider: ['type', enhancementPaletteProvider]
}

export default EnhancementPalette
