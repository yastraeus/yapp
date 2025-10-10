"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
import { fetchNotes, createNote, updateNote, deleteNote as deleteNoteFromDB } from "@/lib/notes-service";
import { optimizeNote, checkAIServiceAvailability } from "@/lib/ai-optimizer";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [originalNote, setOriginalNote] = useState(""); // 保存原始内容用于撤回
  const [showUndo, setShowUndo] = useState(false); // 控制撤回按钮显示
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [editText, setEditText] = useState("");
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [aiServiceAvailable, setAiServiceAvailable] = useState(false);

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
    if (newNote.trim() === "") return;

    try {
      setLoading(true);
      setError(null); // 清除之前的错误
      const createdNote = await createNote(newNote);
      setNotes([createdNote, ...notes]);
      setNewNote("");
      // 重置撤回相关状态
      setShowUndo(false);
      setOriginalNote("");
    } catch (err) {
      console.error("添加笔记失败:", err);
      setError(`添加笔记失败: ${err.message || '请稍后再试'}`);
    } finally {
      setLoading(false);
    }
  };

  // AI优化笔记内容
  const optimizeNoteContent = async () => {
    if (newNote.trim() === "") {
      setError("请先输入笔记内容");
      return;
    }

    try {
      setAiOptimizing(true);
      setError(null);
      
      // 保存原始内容用于撤回
      setOriginalNote(newNote);
      
      const optimizedContent = await optimizeNote(newNote);
      setNewNote(optimizedContent);
      
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
      setNewNote(originalNote);
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
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditText("");
  };

  const saveEdit = async () => {
    if (editText.trim() === "") return;

    try {
      setLoading(true);
      const updatedNote = await updateNote(editingNote, editText);
      setNotes(notes.map(note => 
        note.id === editingNote ? updatedNote : note
      ));
      setEditingNote(null);
      setEditText("");
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
    } catch (err) {
      console.error("删除笔记失败:", err);
      setError("删除笔记失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
        <main className="max-w-4xl mx-auto">
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

          {/* 添加笔记区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                添加新笔记
              </h2>
              <div className="flex gap-2">
                {aiServiceAvailable && (
                  <button
                    onClick={optimizeNoteContent}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={!newNote.trim() || aiOptimizing || loading}
                    title="使用AI智能优化笔记内容"
                  >
                    {aiOptimizing ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        优化中...
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        AI优化
                      </>
                    )}
                  </button>
                )}
                {showUndo && (
                  <button
                    onClick={undoOptimization}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center gap-2"
                    title="撤回AI优化，恢复原始内容"
                  >
                    <span>↶</span>
                    撤回优化
                  </button>
                )}
                <button
                  onClick={addNote}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newNote.trim() || loading}
                >
                  {loading ? "处理中..." : "添加笔记"}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="输入新笔记内容..."
                className="min-h-[100px] max-h-[300px] border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    addNote();
                  }
                }}
                disabled={loading}
                rows={4}
              />
            </div>
            {aiServiceAvailable && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ✨ AI优化功能可帮助您改进笔记的语法、结构和表达
                </p>
                {showUndo && (
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                    ↶ 已优化，可点击撤回按钮恢复原始内容
                  </p>
                )}
              </div>
            )}
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
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {notes.map((note) => (
                  <li 
                    key={note.id} 
                    className="flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group"
                  >
                    <div className="flex-1">
                      {editingNote === note.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full min-h-[100px] max-h-[300px] border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y"
                            autoFocus
                            rows={4}
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
                              className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!editText.trim() || loading}
                            >
                              保存
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors duration-200"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div 
                            className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words"
                            dangerouslySetInnerHTML={{ __html: note.text.replace(/\n/g, '<br />') }}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(note.created_at).toLocaleString()}
                            {note.updated_at && note.updated_at !== note.created_at && (
                              <span> (更新于 {new Date(note.updated_at).toLocaleString()})</span>
                            )}
                          </p>
                        </>
                      )}
                    </div>
                    {editingNote !== note.id && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(note)}
                          className="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="编辑笔记"
                          disabled={loading}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="删除笔记"
                          disabled={loading}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}