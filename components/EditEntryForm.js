import React, { useRef, useCallback, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const EditEntryForm = React.memo(function EditEntryForm({ entry, onSave, onCancel, isDarkMode }) {
  const [content, setContent] = useState(entry.content);
  const textareaRef = useRef(null);

  const handleSave = useCallback(() => {
    onSave(content);
  }, [onSave, content]);

  const handleChange = useCallback((e) => {
    setContent(e.target.value);
  }, []);

  const formContent = useMemo(() => (
    <>
      <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>Edit Entry #{entry.id}</h2>
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        placeholder="Edit your entry"
        rows={5}
        className={`w-full p-3 sm:p-4 rounded-md border mb-3 sm:mb-4 text-sm sm:text-base ${
          isDarkMode 
            ? "bg-custom-gray text-gray-200 placeholder-gray-400 border-gray-600" 
            : "bg-white text-gray-800 placeholder-gray-400 border-gray-300"
        }`}
      />
      <div className="flex justify-end space-x-2">
        <Button 
          onClick={onCancel} 
          variant="outline"
          className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base ${
            isDarkMode 
              ? "bg-custom-gray hover:bg-gray-400 text-white" 
              : "bg-gray-200 hover:bg-gray-300 text-black"
          }`}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base ${
            isDarkMode 
              ? "bg-custom-gray hover:bg-gray-500 text-white" 
              : "bg-black hover:bg-gray-800 text-white"
          }`}
        >
          Save
        </Button>
      </div>
    </>
  ), [entry.id, isDarkMode, handleChange, onCancel, handleSave, content]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-0">
      <div className={`p-4 rounded-md shadow-md relative ${isDarkMode ? "bg-secondary" : "bg-white"} w-full max-w-sm sm:max-w-md`}>
        {formContent}
      </div>
    </div>
  );
});

export default EditEntryForm;