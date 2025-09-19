"use client";

import { useState } from "react";
import Link from "next/link";

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
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col gap-8 items-center max-w-2xl mx-auto w-full">
        <div className="flex justify-between w-full items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            我的笔记
          </h1>
          <Link 
            href="/"
            className="text-sm bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-full shadow transition-all duration-300 border border-gray-200 dark:border-gray-700"
          >
            ← 返回主页
          </Link>
        </div>

        <div className="flex gap-2 w-full">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="输入新笔记..."
            className="flex-1 border border-gray-300 rounded-full px-5 py-3 dark:bg-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onKeyPress={(e) => e.key === 'Enter' && addNote()}
          />
          <button
            onClick={addNote}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            添加
          </button>
        </div>

        <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-all">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              笔记列表
            </h2>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium px-3 py-1 rounded-full">
              {notes.length} 条笔记
            </span>
          </div>
          
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                暂无笔记，快来添加第一条吧！
              </p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {notes.map((note) => (
                <li 
                  key={note.id} 
                  className="flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 group"
                >
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200">{note.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{note.createdAt}</p>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2"
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
  );
}