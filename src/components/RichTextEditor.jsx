import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect, useRef } from "react";

// Matches brand palette. Last color resets to default.
const PALETTE = [
  { label: "Default", value: null },
  { label: "Brand blue", value: "#0951fa" },
  { label: "Brand orange", value: "#ff4f00" },
  { label: "Brand green", value: "#5fae4b" },
  { label: "Gray", value: "#9ca3af" },
  { label: "Red", value: "#ef4444" },
];

function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2 py-1.5 rounded text-sm transition-colors ${
        active
          ? "bg-[#0951fa] text-white"
          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-[#0a7cff] underline hover:text-[#0951fa]",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      TextStyle,
      Color,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[120px] px-3 py-2 focus:outline-none text-white",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // TipTap returns "<p></p>" for empty; normalize to empty string
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Keep editor in sync when parent value changes (e.g. loading an edit)
  const lastValue = useRef(value);
  useEffect(() => {
    if (!editor) return;
    if (value !== lastValue.current && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
      lastValue.current = value;
    }
  }, [value, editor]);

  if (!editor) return null;

  const addLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const setColor = (color) => {
    if (color === null) editor.chain().focus().unsetColor().run();
    else editor.chain().focus().setColor(color).run();
  };

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800 focus-within:border-[#0951fa] focus-within:ring-1 focus-within:ring-[#0951fa] transition-colors">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-700">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Cmd+B)"
        >
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Cmd+I)"
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (Cmd+U)"
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bulleted list"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          1. List
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        <ToolbarButton
          onClick={addLink}
          active={editor.isActive("link")}
          title="Add/edit link"
        >
          Link
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        <div className="flex items-center gap-1">
          {PALETTE.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setColor(c.value)}
              title={c.label}
              className="w-6 h-6 rounded border border-gray-600 hover:border-white transition-colors flex items-center justify-center"
              style={{
                backgroundColor: c.value || "transparent",
                backgroundImage: c.value
                  ? undefined
                  : "linear-gradient(45deg, transparent 45%, #9ca3af 45%, #9ca3af 55%, transparent 55%)",
              }}
            >
              <span className="sr-only">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}
