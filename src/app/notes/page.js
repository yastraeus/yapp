"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import { fetchNotes, createNote, updateNote, deleteNote as deleteNoteFromDB } from "@/lib/notes-service";
import { optimizeNote, checkAIServiceAvailability } from "@/lib/ai-optimizer";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState(""); // 新笔记标题
  const [originalNote, setOriginalNote] = useState(""); // 保存原始内容用于撤回
  const [showUndo, setShowUndo] = useState(false); // 控制撤回按钮显示
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState("");
  const [editTitle, setEditTitle] = useState(""); // 编辑笔记标题
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [aiServiceAvailable, setAiServiceAvailable] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null); // 当前选中的笔记
  // 添加新状态来跟踪是否正在添加新笔记
  const [isAddingNewNote, setIsAddingNewNote] = useState(false);

  // 开始添加新笔记
  const startAddingNewNote = () => {
    setIsAddingNewNote(true);
    setSelectedNote(null); // 清除选中的笔记
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowUndo(false);
  };

  // 取消添加新笔记
  const cancelAddingNewNote = () => {
    setIsAddingNewNote(false);
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowUndo(false);
  };

  // 检查AI服务可用性
  useEffect(() => {
    const checkAIAvailability = async () => {
      try {
        console.log('开始检查AI服务可用性...');
        const available = await checkAIServiceAvailability();
        console.log('AI服务可用性检查结果:', available);
        setAiServiceAvailable(available);
      } catch (error) {
        console.error('检查AI服务可用性失败:', error);
        setAiServiceAvailable(false);
      }
    };

    checkAIAvailability();
  }, []);

  // 加载笔记数据
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        const data = await fetchNotes();
        setNotes(data);
      } catch (err) {
        console.error("加载笔记失败:", err);
        setError("加载笔记失败，请稍后再试");
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  const addNote = async () => {
    if (newNoteContent.trim() === "") return;

    try {
      setLoading(true);
      setError(null); // 清除之前的错误
      const createdNote = await createNote(newNoteContent, newNoteTitle);
      setNotes([createdNote, ...notes]);
      setNewNoteContent("");
      setNewNoteTitle(""); // 清空标题输入框
      // 重置撤回相关状态
      setShowUndo(false);
      setOriginalNote("");
      setIsAddingNewNote(false); // 添加成功后关闭添加状态
    } catch (err) {
      console.error("添加笔记失败:", err);
      setError(`添加笔记失败: ${err.message || '请稍后再试'}`);
    } finally {
      setLoading(false);
    }
  };

  // AI优化笔记内容
  const optimizeNoteContent = async () => {
    if (newNoteContent.trim() === "") {
      setError("请先输入笔记内容");
      return;
    }

    try {
      setAiOptimizing(true);
      setError(null);
      
      // 保存原始内容用于撤回
      setOriginalNote(newNoteContent);
      
      const optimizedContent = await optimizeNote(newNoteContent);
      setNewNoteContent(optimizedContent);
      
      // 显示撤回按钮
      setShowUndo(true);
      
      // 自动滚动到输入框并聚焦
      const inputElement = document.querySelector('input[type="text"]');
      if (inputElement) {
        inputElement.focus();
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      console.error("AI优化失败:", err);
      setError(`AI优化失败: ${err.message || '请稍后再试'}`);
    } finally {
      setAiOptimizing(false);
    }
  };

  // 撤回AI优化
  const undoOptimization = () => {
    if (originalNote) {
      setNewNoteContent(originalNote);
      setShowUndo(false);
      setOriginalNote("");
      
      // 自动滚动到输入框并聚焦
      const inputElement = document.querySelector('input[type="text"]');
      if (inputElement) {
        inputElement.focus();
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const startEditing = (note) => {
    setEditingNote(note.id);
    setEditText(note.text);
    setEditTitle(note.title || '');
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditText("");
    setEditTitle("");
  };

  const saveEdit = async () => {
    if (editText.trim() === "") return;

    try {
      setLoading(true);
      const updatedNote = await updateNote(editingNote, editText, editTitle);
      setNotes(notes.map(note => 
        note.id === editingNote ? updatedNote : note
      ));
      setEditingNote(null);
      setEditText("");
      setEditTitle("");
    } catch (err) {
      console.error("更新笔记失败:", err);
      setError("更新笔记失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      setLoading(true);
      await deleteNoteFromDB(id);
      setNotes(notes.filter(note => note.id !== id));
      // 如果删除的是当前选中的笔记，清空选中状态
      if (selectedNote && selectedNote.id === id) {
        setSelectedNote(null);
      }
    } catch (err) {
      console.error("删除笔记失败:", err);
      setError("删除笔记失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  // 处理笔记点击事件
  const handleNoteClick = (note) => {
    setSelectedNote(note);
    // 如果正在添加新笔记，取消添加状态
    if (isAddingNewNote) {
      setIsAddingNewNote(false);
      setNewNoteTitle("");
      setNewNoteContent("");
    }
    // 如果正在编辑其他笔记，取消编辑状态
    if (editingNote && editingNote !== note.id) {
      setEditingNote(null);
      setEditText("");
      setEditTitle("");
    }
  };

  // 关闭详情视图
  const closeDetailView = () => {
    setSelectedNote(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
        <main className="max-w-7xl mx-auto">
          {/* 顶部导航 */}
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-lg text-blue-600 dark:text-blue-300">📝</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                我的笔记
              </h1>
              {aiServiceAvailable && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded-full">
                  AI优化可用
                </span>
              )}
            </div>
            <Link 
              href="/"
              className="text-sm bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-md shadow-sm transition-colors duration-200 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              ← 返回主页
            </Link>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* 动态布局 */}
          <div className={`grid gap-6 ${selectedNote || isAddingNewNote ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {/* 左侧栏 - 笔记列表 */}
            <div className={`space-y-6 ${selectedNote || isAddingNewNote ? 'lg:col-span-1' : 'max-w-2xl mx-auto w-full'}`}>
              {/* 添加新笔记按钮 */}
              <div className="sticky top-4 z-10 lg:static">
                <button
                  onClick={startAddingNewNote}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                  disabled={loading}
                >
                  <span className="text-base">+</span>
                  添加新笔记
                </button>
              </div>

              {/* 笔记列表区域 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    笔记列表
                  </h2>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full">
                    {notes.length} 条笔记
                  </span>
                </div>
                
                {loading && notes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      加载中...
                    </p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4 text-gray-400">📝</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      暂无笔记，快来添加第一条吧！
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {notes.map((note) => (
                      <li 
                        key={note.id} 
                        onClick={() => handleNoteClick(note)}
                        className={`p-3 rounded-md border transition-colors duration-200 cursor-pointer group ${
                          selectedNote && selectedNote.id === note.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium text-gray-800 dark:text-gray-200 truncate ${!(selectedNote || isAddingNewNote) ? 'text-base' : ''}`}>
                              {note.title || note.text.substring(0, 10) + (note.text.length > 10 ? '...' : '')}
                            </h3>
                            <p className={`text-gray-500 dark:text-gray-400 mt-1 ${!(selectedNote || isAddingNewNote) ? 'text-sm' : 'text-xs'}`}>
                              {new Date(note.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(note);
                              }}
                              className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="编辑笔记"
                              disabled={loading}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNote(note.id);
                              }}
                              className="text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="删除笔记"
                              disabled={loading}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 右侧栏 - 笔记详情或添加新笔记 */}
            {(selectedNote || isAddingNewNote) && (
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 h-full">
                  {/* 顶部操作栏 */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      {isAddingNewNote ? '添加新笔记' : '笔记详情'}
                    </h2>
                    <div className="flex items-center gap-2">
                      {isAddingNewNote && aiServiceAvailable && (
                        <>
                          <button
                            onClick={optimizeNoteContent}
                            disabled={aiOptimizing || !newNoteContent.trim()}
                            className="px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                          >
                            {aiOptimizing ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                AI优化中
                              </>
                            ) : (
                              <>
                                <span>✨</span>
                                AI优化
                              </>
                            )}
                          </button>
                          {showUndo && (
                            <button
                              onClick={undoOptimization}
                              className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200 text-sm"
                            >
                              ↩️ 撤回
                            </button>
                          )}
                          <button
                            onClick={addNote}
                            disabled={!newNoteContent.trim()}
                            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            保存
                          </button>
                        </>
                      )}
                      <button
                        onClick={isAddingNewNote ? cancelAddingNewNote : closeDetailView}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        title={isAddingNewNote ? '取消添加' : '关闭详情'}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  {isAddingNewNote ? (
                    <div className="space-y-4">
                      {/* 标题输入框 */}
                      <div>
                        <label htmlFor="newNoteTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          标题
                        </label>
                        <input
                          type="text"
                          id="newNoteTitle"
                          value={newNoteTitle}
                          onChange={(e) => setNewNoteTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="输入笔记标题"
                        />
                      </div>

                      {/* 内容输入框 */}
                      <div>
                        <label htmlFor="newNoteContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          内容
                        </label>
                        <textarea
                          id="newNoteContent"
                          value={newNoteContent}
                          onChange={(e) => setNewNoteContent(e.target.value)}
                          rows={8}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="输入笔记内容"
                        />
                      </div>
                    </div>
                  ) : (
                    editingNote === selectedNote.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="笔记标题"
                          className="w-full text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              e.preventDefault();
                              saveEdit();
                            }
                          }}
                        />
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full min-h-[300px] border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
                          rows={12}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              e.preventDefault();
                              saveEdit();
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!editText.trim() || loading}
                          >
                            保存
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            {selectedNote.title && (
                              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                {selectedNote.title}
                              </h2>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              创建于 {new Date(selectedNote.created_at).toLocaleString()}
                              {selectedNote.updated_at && selectedNote.updated_at !== selectedNote.created_at && (
                                <span> • 更新于 {new Date(selectedNote.updated_at).toLocaleString()}</span>
                              )}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(selectedNote)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="编辑笔记"
                              disabled={loading}
                            >
                              ✏️ 编辑
                            </button>
                            <button
                              onClick={() => deleteNote(selectedNote.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="删除笔记"
                              disabled={loading}
                            >
                              ✕ 删除
                            </button>
                          </div>
                        </div>
                        <div 
                          className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed text-lg"
                          dangerouslySetInnerHTML={{ __html: selectedNote.text.replace(/\n/g, '<br />') }}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}