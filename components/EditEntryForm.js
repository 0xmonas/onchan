import React, { useRef, useCallback, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { UpdateIcon, Pencil1Icon } from "@radix-ui/react-icons";

const EditEntryForm = React.memo(function EditEntryForm({ entry, onSave, onCancel, isDarkMode }) {
  const [content, setContent] = useState(entry.content);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await onSave(content);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onSave, content]);

  const handleChange = useCallback((e) => {
    setContent(e.target.value);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" onClick={onCancel}></div>
      <Card className="relative w-full max-w-sm sm:max-w-md rounded-2xl shadow-lg" style={{ backgroundColor: '#ffffff' }}>
        <CardContent className="p-4 sm:p-5">
          <div className="flex justify-between items-center mb-4 sm:mb-5">
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mr-2" 
                   style={{ backgroundColor: '#000000' }}>
                <Pencil1Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span style={{ color: '#404040' }} className="text-sm sm:text-base">Edit Entry #{entry.id}</span>
            </div>
          </div>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder="Edit your entry"
            rows={5}
            className={`w-full p-3 sm:p-4 rounded-xl border mb-4 sm:mb-5 text-sm sm:text-base ${
              isDarkMode 
                ? 'bg-white text-black border-gray-700 placeholder-gray-500' 
                : 'bg-white text-black border-gray-300 placeholder-gray-400'
            }`}
          />
          {isLoading ? (
            <div className="bg-[#F5F5F5] p-3 sm:p-4 rounded-xl mb-3 sm:mb-4 flex items-center justify-center">
              <UpdateIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" style={{ color: '#000000' }} />
              <span style={{ color: '#000000' }} className="text-sm sm:text-base">
                Saving changes...
              </span>
            </div>
          ) : (
            <>
              <Button 
                onClick={handleSave}
                className="w-full flex items-center justify-center text-sm sm:text-base font-semibold py-2 sm:py-3 px-4 rounded-xl transition-colors duration-200 mb-2"
                style={{ backgroundColor: '#000000', color: '#ffffff' }}
              >
                Save Changes
              </Button>
              <Button
                onClick={onCancel}
                className="w-full flex items-center justify-center text-sm sm:text-base font-semibold py-2 sm:py-3 px-4 rounded-xl transition-colors duration-200"
                style={{ backgroundColor: '#404040', color: '#ffffff' }}
              >
                Cancel
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default EditEntryForm;