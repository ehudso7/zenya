import { motion } from 'framer-motion'
import { Loader } from 'lucide-react'

export function FullPageLoader() {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </motion.div>
    </div>
  )
}

export function CardLoader() {
  return (
    <div className="p-8 flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export function ButtonLoader() {
  return <Loader className="w-4 h-4 animate-spin" />
}

export function ContentSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="glass p-6 rounded-xl animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
      <ContentSkeleton />
    </div>
  )
}