import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import { ArrowUpIcon, ArrowDownIcon, DotsHorizontalIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { usePrivyWeb3 } from '../contexts/PrivyWeb3Context';
import { likeEntry, dislikeEntry, removeReaction, getUserReaction, editEntry, deleteEntry } from '../services/entryService';
import DOMPurify from 'dompurify';
import { useEditMode } from '../contexts/EditModeContext';
import EditEntryForm from './EditEntryForm';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import UserAvatar from './UserAvatar';
import { convertLinksInText } from '@/lib/textUtils';

const EntryCard = React.memo(function EntryCard({ entry, type, isPreview = false, onEntryUpdate }) {
  const { isDarkMode } = useDarkMode();
  const [isEditingThisEntry, setIsEditingThisEntry] = useState(false);
  const router = useRouter();
  const { user, authenticated, login } = usePrivyWeb3();
  const [isReacting, setIsReacting] = useState(false);
  const [userReaction, setUserReaction] = useState(0);
  const [optimisticLikes, setOptimisticLikes] = useState(parseInt(entry?.likes) || 0);
  const [optimisticDislikes, setOptimisticDislikes] = useState(parseInt(entry?.dislikes) || 0);
  const { isEditing, setIsEditing } = useEditMode();
  const [isExpanded, setIsExpanded] = useState(false);

  const account = user?.wallet?.address;
  const isConnected = authenticated;

  useEffect(() => {
    if (!entry || entry.isDeleted) {
      return;
    }

    const fetchUserReaction = async () => {
      if (isConnected && account && entry?.id) {
        try {
          const reaction = await getUserReaction(account, entry.id);
          setUserReaction(reaction);
        } catch (error) {
          console.error('Error fetching user reaction:', error);
        }
      }
    };
    fetchUserReaction();
  }, [isConnected, account, entry]);

  const renderContent = useMemo(() => {
    if (!entry?.content) return null;
    
    const content = entry.content;
    const shouldTruncate = content.length > 280 && !isExpanded;
    
    const processedContent = convertLinksInText(shouldTruncate ? content.slice(0, 280) + '...' : content);
    
    return (
      <>
        <div 
          className="prose prose-sm sm:prose-base max-w-none overflow-hidden whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedContent) }}
        />
        {content.length > 280 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`mt-2 text-xs sm:text-sm italic font-normal ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}
          >
            {isExpanded ? '(read less)' : '(read more)'}
          </button>
        )}
      </>
    );
  }, [entry?.content, isExpanded, isDarkMode]);

  const handleEntryClick = useCallback(() => {
    if (entry && entry.id) {
      router.push(`/entry/${entry.id}`);
    }
  }, [router, entry]);

  const handleReaction = useCallback(async (reaction, e) => {
    e.stopPropagation();
    if (!isConnected) {
      alert('Please connect your wallet to react to an entry.');
      await login();
      return;
    }
    if (isReacting || !entry) return;
    setIsReacting(true);

    setOptimisticLikes(prev => reaction === 1 ? prev + 1 : userReaction === 1 ? prev - 1 : prev);
    setOptimisticDislikes(prev => reaction === -1 ? prev + 1 : userReaction === -1 ? prev - 1 : prev);

    try {
      let updatedEntry;
      if (userReaction === reaction) {
        await removeReaction(entry.id);
        updatedEntry = {
          ...entry,
          likes: reaction === 1 ? (optimisticLikes - 1).toString() : optimisticLikes.toString(),
          dislikes: reaction === -1 ? (optimisticDislikes - 1).toString() : optimisticDislikes.toString()
        };
        setUserReaction(0);
      } else {
        if (reaction === 1) {
          await likeEntry(entry.id);
          updatedEntry = { 
            ...entry, 
            likes: optimisticLikes.toString(),
            dislikes: userReaction === -1 ? (optimisticDislikes - 1).toString() : optimisticDislikes.toString()
          };
        } else {
          await dislikeEntry(entry.id);
          updatedEntry = { 
            ...entry, 
            dislikes: optimisticDislikes.toString(),
            likes: userReaction === 1 ? (optimisticLikes - 1).toString() : optimisticLikes.toString()
          };
        }
        setUserReaction(reaction);
      }
      if (onEntryUpdate) onEntryUpdate(updatedEntry);
    } catch (error) {
      console.error('Error reacting to entry:', error);
      alert('Failed to react to entry. ' + error.message);
      setOptimisticLikes(parseInt(entry.likes));
      setOptimisticDislikes(parseInt(entry.dislikes));
    } finally {
      setIsReacting(false);
    }
  }, [isConnected, login, isReacting, userReaction, entry, optimisticLikes, optimisticDislikes, onEntryUpdate]);

  const handleEdit = useCallback(() => {
    setIsEditingThisEntry(true);
    setIsEditing(true);
  }, [setIsEditing]);

  const handleDelete = useCallback(async () => {
    if (!entry) return;
    try {
      await deleteEntry(entry.id);
      if (onEntryUpdate) onEntryUpdate({ ...entry, isDeleted: true });
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  }, [entry, onEntryUpdate]);

  const handleSave = useCallback(async (newContent) => {
    if (!entry) return;
    try {
      await editEntry(entry.id, newContent);
      const updatedEntry = { ...entry, content: newContent, isEdited: true };
      if (onEntryUpdate) onEntryUpdate(updatedEntry);
      setIsEditingThisEntry(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing entry:', error);
      alert('Failed to edit entry. Please try again.');
    }
  }, [entry, onEntryUpdate, setIsEditing]);

  const handleCancel = useCallback(() => {
    setIsEditingThisEntry(false);
    setIsEditing(false);
  }, [setIsEditing]);

  const renderFooter = useMemo(() => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-2 sm:space-y-0">
      <div className="flex items-center space-x-4">
        <button
          className={`flex items-center space-x-1 ${userReaction === 1 ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}
          onClick={(e) => handleReaction(1, e)}
          disabled={isReacting}
        >
          <ArrowUpIcon className="w-4 h-4" />
          <span className="text-sm">{optimisticLikes}</span>
        </button>
        <button
          className={`flex items-center space-x-1 ${userReaction === -1 ? (isDarkMode ? 'text-red-400' : 'text-red-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}
          onClick={(e) => handleReaction(-1, e)}
          disabled={isReacting}
        >
          <ArrowDownIcon className="w-4 h-4" />
          <span className="text-sm">{optimisticDislikes}</span>
        </button>
        <div 
          className={`cursor-pointer ${isDarkMode ? "text-gray-400" : "text-[#0031ff]"} text-sm`}
          onClick={handleEntryClick}
        >
          <span>#{entry.id}</span>
        </div>
      </div>
      <div className={`flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-2 text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-[#0031ff]"}`}>
        <span>{new Date(Number(entry.creationTimestamp) * 1000).toLocaleString()}</span>
        <div className="flex items-center space-x-2">
          <Link href={`/profile/${entry.authorUsername || entry.author}`}>
            <span className="hover:underline">@{entry.authorUsername || entry.author}</span>
          </Link>
          {entry.author === account && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`p-0 h-auto font-normal ${isDarkMode ? "text-gray-400" : "text-[#0031ff]"} hover:bg-transparent flex items-center`}
                >
                  <DotsHorizontalIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
                <DropdownMenuItem onClick={handleEdit} className="flex items-center space-x-2 px-4 py-2 hover:bg-opacity-80">
                  <Pencil1Icon className="w-4 h-4 mt-[1px]" />
                  <span className="text-xs sm:text-sm leading-none">Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="flex items-center space-x-2 px-4 py-2 hover:bg-opacity-80">
                  <TrashIcon className="w-4 h-4 mt-[1px]" />
                  <span className="text-xs sm:text-sm leading-none">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <UserAvatar user={{ address: entry.author, username: entry.authorUsername || entry.author }} size="small" />
        </div>
      </div>
    </div>
  ), [isDarkMode, userReaction, isReacting, optimisticLikes, optimisticDislikes, entry, handleReaction, handleEntryClick, account, handleEdit, handleDelete]);
  
  const getCardStyle = useMemo(() => {
    return `p-3 sm:p-4 rounded-md shadow-sm relative ${isDarkMode ? "bg-black" : "bg-white"} border ${isDarkMode ? "border-secondary" : "border-card"} w-full`;
  }, [isDarkMode]);

  const titleSlug = useMemo(() => {
    if (entry.titleName && entry.titleId) {
      return `${entry.titleName.toLowerCase().replace(/\s+/g, '-')}--${entry.titleId}`;
    }
    return null;
  }, [entry.titleName, entry.titleId]);

  if (!entry) {
    console.log('Entry is null or undefined');
    return null;
  }

  return (
    <div className={getCardStyle}>
      <div className="flex justify-between items-start mb-2">
        {(type === 'profile' || type === 'single') && entry.titleName && entry.titleId && (
          <Link href={`/title/${titleSlug}`}>
            <h4 className={`font-semibold text-sm sm:text-base ${isDarkMode ? "text-[#0031ff]" : "text-gray-800"}`}>
              {entry.titleName}
            </h4>
          </Link>
        )}
      </div>
      <div className={`mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-800"} text-sm sm:text-base leading-relaxed`}>
        {renderContent}
      </div>
      {renderFooter}
      
      {isEditingThisEntry && (
  <EditEntryForm
    entry={entry}
    onSave={handleSave}
    onCancel={handleCancel}
    isDarkMode={isDarkMode}
  />
)}
    </div>
  );
});

export default EntryCard;