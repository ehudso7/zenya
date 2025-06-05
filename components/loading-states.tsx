import { motion } from 'framer-motion'
import { Loader } from 'lucide-react'

export function FullPageLoader() {
  return (
    <div 
      className="min-h-screen gradient-mesh flex items-center justify-center"
      aria-busy="true"
      aria-live="polite"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" aria-hidden="true" />
        <span className="sr-only">Loading page content</span>
        <p className="text-gray-600 dark:text-gray-400" aria-live="polite">Loading...</p>
      </motion.div>
    </div>
  )
}

export function CardLoader() {
  return (
    <div 
      className="p-8 flex items-center justify-center"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="text-center">
        <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-2" aria-hidden="true" />
        <span className="sr-only">Loading content</span>
        <p className="text-sm text-gray-600 dark:text-gray-400" aria-live="polite">Loading...</p>
      </div>
    </div>
  )
}

export function ButtonLoader() {
  return (
    <>
      <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </>
  )
}

export function ContentSkeleton() {
  return (
    <div 
      className="space-y-4 animate-pulse"
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" aria-hidden="true"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" aria-hidden="true"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" aria-hidden="true"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" aria-hidden="true"></div>
      <span className="sr-only">Loading content, please wait</span>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div 
      className="glass p-6 rounded-xl animate-pulse"
      aria-busy="true"
      aria-label="Loading card content"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" aria-hidden="true"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" aria-hidden="true"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" aria-hidden="true"></div>
        </div>
      </div>
      <ContentSkeleton />
    </div>
  )
}