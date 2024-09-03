import React, { useRef, useCallback, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const EditEntryForm = React.memo(function EditEntryForm({ entry, onSave, onCancel, isDarkMode }) {
  const [content, setContent] = useState(entry.content);
  const textareaRef = useRef(null);

  const handleSave = useCallback(() => {
    onSave(content);
  }, [onSave, content]);

  const handleChange = useCallback((e) => {
    setContent(e.target.value);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 px-4 sm:px-0">
      <Card className={`w-full max-w-sm sm:max-w-md rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <CardContent className="p-4 sm:p-5">
          <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Edit Entry #{entry.id}
          </h2>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder="Edit your entry"
            rows={5}
            className={`w-full p-3 sm:p-4 rounded-xl border mb-3 sm:mb-4 text-sm sm:text-base ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                : 'bg-gray-100 text-black border-gray-300 placeholder-gray-500'
            }`}
          />
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={onCancel} 
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-xl transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-xl transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default EditEntryForm;