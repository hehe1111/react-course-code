import MonacoEditor, { OnMount, EditorProps } from '@monaco-editor/react'
import { createATA } from './ata';
import { editor } from 'monaco-editor'

export interface EditorFile {
    name: string
    value: string
    language: string
}

interface Props {
    file: EditorFile
    onChange?: EditorProps['onChange'],
    options?: editor.IStandaloneEditorConstructionOptions
}

export default function Editor(props: Props) {

    const {
        file,
        onChange,
        options
    } = props;

    const handleEditorMount: OnMount = (editor, monaco) => {
        /** 获取 monaco editor 支持的全部 action */
        // const actions = editor.getSupportedActions().map((a) => a.id);
        // console.log('====', actions);

        /** 代码格式化 */
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {
            editor.getAction('editor.action.formatDocument')?.run()
        });

        /** 行上移 */
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.UpArrow, () => {
            editor.getAction('editor.action.moveLinesUpAction')?.run()
        })
        /** 行下移 */
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.DownArrow, () => {
            editor.getAction('editor.action.moveLinesDownAction')?.run()
        })

        /** 字体缩放 */
        const editorElement = editor.getDomNode()!
        // Add event listener for wheel event
        editorElement.addEventListener('wheel', event => {
            if (event.ctrlKey) {
                // Wheel up
                if (event.deltaY < 0) {
                    // Perform action for Ctrl + Wheel Up
                    editor.getAction('editor.action.fontZoomIn')?.run()
                }
                // Wheel down
                else if (event.deltaY > 0) {
                    // Perform action for Ctrl + Wheel Down
                    editor.getAction('editor.action.fontZoomOut')?.run()
                }

                // Prevent default behavior (optional, depending on your use case)
                event.preventDefault()
            }
        })

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.Preserve,
            esModuleInterop: true,
        })

        const ata = createATA((code, path) => {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${path}`)
        })

        editor.onDidChangeModelContent(() => {
            ata(editor.getValue());
        });

        ata(editor.getValue());
    }

    return <MonacoEditor
        height={'100%'}
        path={file.name}
        language={file.language}
        onMount={handleEditorMount}
        onChange={onChange}
        value={file.value}
        options={
            {
                fontSize: 14,
                scrollBeyondLastLine: false,
                minimap: {
                  enabled: false,
                },
                scrollbar: {
                  verticalScrollbarSize: 6,
                  horizontalScrollbarSize: 6,
                },
                ...options
            }
        }
    />
}
