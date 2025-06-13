export default function Loading() {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <div className="h-16 w-48 bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto mb-4" />
          <div className="h-8 w-96 bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto mb-2" />
          <div className="h-6 w-64 bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 animate-pulse">
          Loading Zenya...
        </p>
      </div>
    </div>
  )
}