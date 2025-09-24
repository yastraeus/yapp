'use client'

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/protected-route";

// 功能卡片数据
const featureCards = [
  {
    href: "/notes",
    icon: "📝",
    title: "笔记管理",
    description: "创建、编辑和管理您的个人笔记",
    active: true
  },
  {
    href: "#",
    icon: "➕",
    title: "更多功能",
    description: "即将推出更多实用功能",
    active: false
  }
];

export default function Home() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  // 用户信息组件
  const UserInfo = () => (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="text-right">
        <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
          已登录用户
        </p>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {user.email}
        </p>
      </div>
      <button
        onClick={handleSignOut}
        className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 border border-gray-300 dark:border-gray-600"
      >
        退出
      </button>
    </div>
  )

  // 功能卡片组件
  const FeatureCard = ({ href, icon, title, description, active }) => {
    const cardClasses = active 
      ? "group block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600"
      : "group block p-6 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
    
    const iconClasses = active 
      ? "flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4"
      : "flex items-center justify-center w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg mb-4"
    
    const iconTextClasses = active 
      ? "text-xl text-blue-600 dark:text-blue-300"
      : "text-xl text-gray-500 dark:text-gray-400"
    
    const content = active ? (
      <Link href={href} className={cardClasses}>
        <div className={iconClasses}>
          <span className={iconTextClasses}>{icon}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </Link>
    ) : (
      <div className={cardClasses}>
        <div className={iconClasses}>
          <span className={iconTextClasses}>{icon}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    )

    return content
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
        {/* 顶部导航栏 */}
        <div className="flex justify-between items-center mb-8 sm:mb-12">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Yapp</h1>
          {user && <UserInfo />}
        </div>

        {/* 主内容区域 */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              欢迎回来！
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              选择您要访问的功能页面
            </p>
          </div>

          {/* 功能卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featureCards.map((card, index) => (
              <FeatureCard key={index} {...card} />
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
