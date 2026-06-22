"use client";

import React, { useState, useEffect } from 'react';
import 'ckeditor5/ckeditor5.css';

interface CKEditorComponentProps {
    value: string;
    onChange: (data: string) => void;
    placeholder?: string;
}

const CKEditorComponent = ({ value, onChange, placeholder }: CKEditorComponentProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [CKEditorUI, setCKEditorUI] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [EditorModule, setEditorModule] = useState<any>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [{ CKEditor }, mod] = await Promise.all([
                    import('@ckeditor/ckeditor5-react'),
                    import('ckeditor5'),
                ]);
                if (cancelled) return;
                setCKEditorUI(() => CKEditor);
                setEditorModule(mod);
                setIsReady(true);
            } catch (err) {
                console.error('CKEditor load failed:', err);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (!isReady || !CKEditorUI || !EditorModule) {
        return (
            <div className="ck-editor-loading">
                <div className="ck-editor-loading__toolbar" />
                <div className="ck-editor-loading__body">
                    <span>Loading editor…</span>
                </div>
            </div>
        );
    }

    const {
        ClassicEditor,
        AccessibilityHelp, Alignment, Autoformat, AutoLink, Autosave,
        BlockQuote, Bold, Code, CodeBlock, Essentials, FindAndReplace,
        FontBackgroundColor, FontColor, FontFamily, FontSize,
        GeneralHtmlSupport, Heading, Highlight, HorizontalLine,
        ImageBlock, ImageCaption, ImageInline, ImageInsert, ImageInsertViaUrl,
        ImageResize, ImageStyle, ImageTextAlternative, ImageToolbar, ImageUpload,
        Indent, IndentBlock, Italic, Link, LinkImage, List, ListProperties,
        MediaEmbed, Paragraph, RemoveFormat, SelectAll,
        SpecialCharacters, SpecialCharactersArrows, SpecialCharactersCurrency,
        SpecialCharactersEssentials, SpecialCharactersLatin,
        SpecialCharactersMathematical, SpecialCharactersText,
        Strikethrough, Subscript, Superscript,
        Table, TableCaption, TableCellProperties, TableColumnResize,
        TableProperties, TableToolbar, TextTransformation,
        Underline, Undo, SourceEditing, WordCount,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = EditorModule as any;

    const editorConfig = {
        licenseKey: 'GPL',
        toolbar: {
            items: [
                // === Row 1 ===
                'sourceEditing', '|',
                'undo', 'redo', '|',
                'findAndReplace', 'selectAll', '|',
                'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code', 'removeFormat', '|',
                // === Row 2 ===
                'alignment', '|',
                'bulletedList', 'numberedList', 'outdent', 'indent', '|',
                'blockQuote', 'horizontalLine', '|',
                'link', 'insertImage', 'mediaEmbed', 'insertTable', 'specialCharacters', '|',
                // === Row 3 ===
                'heading', '|',
                'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
                'codeBlock', '|',
                'accessibilityHelp',
            ],
            shouldNotGroupWhenFull: false,
        },
        plugins: [
            AccessibilityHelp, Alignment, Autoformat, AutoLink, Autosave,
            BlockQuote, Bold, Code, CodeBlock, Essentials, FindAndReplace,
            FontBackgroundColor, FontColor, FontFamily, FontSize,
            GeneralHtmlSupport, Heading, Highlight, HorizontalLine,
            ImageBlock, ImageCaption, ImageInline, ImageInsert, ImageInsertViaUrl,
            ImageResize, ImageStyle, ImageTextAlternative, ImageToolbar, ImageUpload,
            Indent, IndentBlock, Italic, Link, LinkImage, List, ListProperties,
            MediaEmbed, Paragraph, RemoveFormat, SelectAll,
            SpecialCharacters, SpecialCharactersArrows, SpecialCharactersCurrency,
            SpecialCharactersEssentials, SpecialCharactersLatin,
            SpecialCharactersMathematical, SpecialCharactersText,
            Strikethrough, Subscript, Superscript,
            Table, TableCaption, TableCellProperties, TableColumnResize,
            TableProperties, TableToolbar, TextTransformation,
            Underline, Undo, SourceEditing, WordCount,
        ],
        heading: {
            options: [
                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            ],
        },
        fontSize: {
            options: [8, 9, 10, 11, 12, 'default', 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72],
            supportAllValues: true,
        },
        fontFamily: {
            supportAllValues: true,
        },
        image: {
            toolbar: [
                'toggleImageCaption', 'imageTextAlternative', '|',
                'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|',
                'resizeImage',
            ],
            insert: { type: 'auto' },
        },
        link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
            decorators: {
                toggleDownloadable: {
                    mode: 'manual',
                    label: 'Downloadable',
                    attributes: { download: 'file' },
                },
            },
        },
        list: {
            properties: { styles: true, startIndex: true, reversed: true },
        },
        table: {
            contentToolbar: [
                'tableColumn', 'tableRow', 'mergeTableCells',
                'tableProperties', 'tableCellProperties',
            ],
        },
        htmlSupport: {
            allow: [
                { name: /.*/, attributes: true, classes: true, styles: true },
            ],
        },
        placeholder: placeholder || 'Type your content here…',
    };

    return (
        <div className="ck5-wrapper">
            <CKEditorUI
                editor={ClassicEditor}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                config={editorConfig as any}
                data={value}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onReady={(editor: any) => {
                    try {
                        const wordCountPlugin = editor.plugins.get('WordCount');
                        const wcEl = document.getElementById('ck5-word-count');
                        if (wcEl && wordCountPlugin?.wordCountContainer) {
                            wcEl.innerHTML = '';
                            wcEl.appendChild(wordCountPlugin.wordCountContainer);
                        }
                    } catch {
                        // word count optional
                    }
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(_evt: any, editor: any) => {
                    onChange(editor.getData());
                }}
            />
            <div
                id="ck5-word-count"
                className="ck5-wordcount"
            />

            {/* Scoped styles – no jsx pragma needed, just a plain style tag */}
            <style>{`
                /* ── Wrapper border ─────────────────────────────── */
                .ck5-wrapper {
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    overflow: hidden;
                    background: #fff;
                }

                /* ── Toolbar ────────────────────────────────────── */
                .ck5-wrapper .ck.ck-toolbar {
                    border: none !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    border-radius: 0 !important;
                    background: #f8fafc !important;
                    padding: 4px 6px !important;
                    flex-wrap: wrap !important;
                    gap: 2px;
                }
                .ck5-wrapper .ck.ck-toolbar .ck.ck-toolbar__items {
                    flex-wrap: wrap !important;
                    row-gap: 2px;
                }

                /* ── Editing area ───────────────────────────────── */
                .ck5-wrapper .ck.ck-editor__main > .ck-editor__editable {
                    min-height: 350px;
                    max-height: 700px;
                    border: none !important;
                    box-shadow: none !important;
                    background: #fff !important;
                    padding: 16px 20px !important;
                    font-size: 14px;
                    line-height: 1.75;
                }
                .ck5-wrapper .ck.ck-content {
                    border: none !important;
                    box-shadow: none !important;
                }

                /* ── Source-editing area ────────────────────────── */
                .ck5-wrapper .ck-source-editing-area > textarea {
                    min-height: 350px !important;
                    font-family: 'Courier New', Courier, monospace !important;
                    font-size: 13px !important;
                    line-height: 1.5 !important;
                    padding: 16px !important;
                    background: #1e1e2e !important;
                    color: #cdd6f4 !important;
                    border: none !important;
                }

                /* ── Word-count bar ─────────────────────────────── */
                .ck5-wordcount {
                    background: #f8fafc;
                    border-top: 1px solid #e2e8f0;
                    padding: 3px 12px;
                    font-size: 11px;
                    color: #64748b;
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                    min-height: 24px;
                }
                .ck5-wordcount .ck-word-count {
                    display: flex;
                    gap: 1rem;
                }

                /* ── Content styles ─────────────────────────────── */
                .ck5-wrapper .ck-content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1em 0;
                }
                .ck5-wrapper .ck-content table td,
                .ck5-wrapper .ck-content table th {
                    border: 1px solid #cbd5e1;
                    padding: 6px 10px;
                    vertical-align: top;
                }
                .ck5-wrapper .ck-content table th {
                    background: #f1f5f9;
                    font-weight: 600;
                }
                .ck5-wrapper .ck-content blockquote {
                    border-left: 4px solid #6366f1;
                    padding: 0.5em 1em;
                    margin: 1em 0;
                    background: #f5f3ff;
                    color: #4c1d95;
                    font-style: italic;
                }
                .ck5-wrapper .ck-content pre {
                    background: #1e1e2e;
                    color: #cdd6f4;
                    padding: 1em;
                    border-radius: 4px;
                    overflow-x: auto;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                }
                .ck5-wrapper .ck-content .image {
                    margin: 1em auto;
                    text-align: center;
                }
                .ck5-wrapper .ck-content .image img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                }

                /* ── Loading skeleton ───────────────────────────── */
                .ck-editor-loading {
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    overflow: hidden;
                }
                .ck-editor-loading__toolbar {
                    height: 42px;
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    animation: ck-pulse 1.4s ease-in-out infinite;
                }
                .ck-editor-loading__body {
                    min-height: 350px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    font-size: 14px;
                }
                @keyframes ck-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                /* ── Dark mode ──────────────────────────────────── */
                .dark .ck5-wrapper {
                    border-color: #334155;
                    background: #0f172a;
                }
                .dark .ck5-wrapper .ck.ck-toolbar {
                    background: #1e293b !important;
                    border-bottom-color: #334155 !important;
                }
                .dark .ck5-wrapper .ck.ck-button {
                    color: #cbd5e1 !important;
                }
                .dark .ck5-wrapper .ck.ck-button:hover,
                .dark .ck5-wrapper .ck.ck-button:focus {
                    background: #334155 !important;
                }
                .dark .ck5-wrapper .ck.ck-button.ck-on {
                    background: #475569 !important;
                }
                .dark .ck5-wrapper .ck.ck-editor__main > .ck-editor__editable {
                    background: #0f172a !important;
                    color: #e2e8f0 !important;
                }
                .dark .ck5-wrapper .ck.ck-dropdown__panel {
                    background: #1e293b !important;
                    border-color: #334155 !important;
                }
                .dark .ck5-wrapper .ck-list {
                    background: #1e293b !important;
                }
                .dark .ck5-wrapper .ck-list__item:hover {
                    background: #334155 !important;
                }
                .dark .ck5-wrapper .ck-input {
                    background: #0f172a !important;
                    color: #e2e8f0 !important;
                    border-color: #334155 !important;
                }
                .dark .ck5-wordcount {
                    background: #1e293b;
                    border-top-color: #334155;
                    color: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default CKEditorComponent;
