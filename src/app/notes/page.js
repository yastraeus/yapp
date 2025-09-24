"use client";

import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (newNote.trim() !== "") {
      setNotes([...notes, { id: Date.now(), text: newNote, createdAt: new Date().toLocaleString() }]);
      setNewNote("");
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
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
            </div>
            <Link 
              href="/"
              className="text-sm bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-md shadow-sm transition-colors duration-200 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              ← 返回主页
            </Link>
          </div>

          {/* 添加笔记区域 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              添加新笔记
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="输入新笔记内容..."
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
              />
              <button
                onClick={addNote}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newNote.trim()}
              >
                添加
              </button>
            </div>
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
            
            {notes.length === 0 ? (
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
                      <p className="text-gray-800 dark:text-gray-200">{note.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{note.createdAt}</p>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-3 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="删除笔记"
                    >
                      ✕
                    </button>
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