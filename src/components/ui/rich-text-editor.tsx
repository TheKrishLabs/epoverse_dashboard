"use client";

import { useCallback, useState, useEffect, memo } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Youtube from "@tiptap/extension-youtube";

import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ListOrdered,
  List,
  Quote,
  Link2,
  Unlink,
  ImageIcon,
  Video,
  Undo,
  Redo,
  Eraser,
  Code2,
  Type,
  Maximize,
  Minimize
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

interface MenuBarProps {
  editor: Editor | null;
  isSourceMode: boolean;
  onToggleSourceMode: () => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

const MenuBar = ({ editor, isSourceMode, onToggleSourceMode, isFullScreen, onToggleFullScreen }: MenuBarProps) => {

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("YouTube URL");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 rounded-t-md">
      {/* Source Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleSourceMode}
        className={`text-xs font-bold px-2 py-1 h-8 ${isSourceMode ? 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30' : 'text-slate-600'}`}
      >
        <Code2 className="h-4 w-4 mr-1" /> Source
      </Button>
      
      <div className="w-[1px] bg-gray-300 dark:bg-gray-600 mx-1 h-6 self-center" />

      {/* Undo/Redo */}
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8 p-0">
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8 p-0">
        <Redo className="h-4 w-4" />
      </Button>

      <div className="w-[1px] bg-gray-300 dark:bg-gray-600 mx-1 h-6 self-center" />

      {/* Formatting */}
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive("subscript")} onPressedChange={() => editor.chain().focus().toggleSubscript().run()}>
        <SubscriptIcon className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive("superscript")} onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}>
        <SuperscriptIcon className="h-4 w-4" />
      </Toggle>

      <div className="w-[1px] bg-gray-300 dark:bg-gray-600 mx-1 h-6 self-center" />

      {/* Headings - Simplistic representation */}
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive("heading", { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Type className="h-4 w-4" />
      </Toggle>

      <div className="w-[1px] bg-gray-300 dark:bg-gray-600 mx-1 h-6 self-center" />

      {/* Alignment */}
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive({ textAlign: "left" })} onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive({ textAlign: "center" })} onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}>
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive({ textAlign: "right" })} onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}>
        <AlignRight className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive({ textAlign: "justify" })} onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}>
        <AlignJustify className="h-4 w-4" />
      </Toggle>

      <div className="w-[1px] bg-gray-300 dark:bg-gray-600 mx-1 h-6 self-center" />

      {/* Lists */}
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive("blockquote")} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </Toggle>

      <div className="w-[1px] bg-gray-300 dark:bg-gray-600 mx-1 h-6 self-center" />

      {/* Links & Media */}
      <Toggle size="sm" className="h-8 w-8 p-0" pressed={editor.isActive("link")} onPressedChange={setLink}>
        <Link2 className="h-4 w-4" />
      </Toggle>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")} className="h-8 w-8 p-0">
        <Unlink className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={addImage} className="h-8 w-8 p-0">
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={addVideo} className="h-8 w-8 p-0">
        <Video className="h-4 w-4" />
      </Button>

      <div className="w-[1px] bg-gray-300 dark:bg-gray-600 mx-1 h-6 self-center" />

      {/* Clear Formatting */}
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="h-8 w-8 p-0">
        <Eraser className="h-4 w-4" />
      </Button>

      <div className="flex-1" />

      {/* Full Screen Toggle */}
      <Button variant="ghost" size="sm" onClick={onToggleFullScreen} className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
        {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export const RichTextEditor = memo(function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextStyle,
      Color,
      Highlight,
      FontFamily,
      Subscript,
      Superscript,
      Youtube,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[250px] p-4",
      },
    },
  });

  // Sync value if changed from outside (e.g. initial load or parent state force)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !isSourceMode) {
       editor.commands.setContent(value);
    }
  }, [value, editor, isSourceMode]);

  return (
    <div 
      className={`rich-text-container border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-950 flex flex-col transition-all duration-200 ease-in-out ${
        isFullScreen 
          ? 'fixed inset-0 z-[100] m-0 rounded-none w-screen h-screen pb-0' 
          : 'rounded-md relative ' + (className || '')
      }`}
    >
      <MenuBar 
        editor={editor} 
        isSourceMode={isSourceMode} 
        onToggleSourceMode={() => setIsSourceMode(!isSourceMode)}
        isFullScreen={isFullScreen}
        onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
      />

      {isSourceMode ? (
        <textarea
          className={`w-full flex-1 p-4 font-mono text-sm bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-sky-500 rounded-b-md ${
             isFullScreen ? 'min-h-0 h-full' : 'min-h-[250px]'
          }`}
          value={value || ''}
          onChange={(e) => {
             onChange(e.target.value);
          }}
          placeholder="<!-- Enter HTML here -->"
          spellCheck={false}
        />
      ) : (
        <div className={`flex-1 overflow-y-auto ${isFullScreen ? 'h-full' : ''}`}>
          <EditorContent editor={editor} className={isFullScreen ? '[&>div]:min-h-[calc(100vh-100px)]' : ''} />
        </div>
      )}
    </div>
  );
});
