
import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TiptapProps {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  onChange: (html: string) => void;
  initialContent: string;
}

export const Tiptap: React.FC<TiptapProps> = ({
  editor,
  setEditor,
  onChange,
  initialContent
}) => {
  const editorInstance = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onCreate: ({ editor }) => {
      setEditor(editor);
    },
  });

  React.useEffect(() => {
    if (editorInstance && !editor) {
      setEditor(editorInstance);
    }
  }, [editorInstance, editor, setEditor]);

  return (
    <div className="border rounded-md p-2">
      <EditorContent editor={editorInstance} />
    </div>
  );
};
