import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/api-middleware'
import { semanticSearch } from '@/lib/ai/semantic-search'
import { tracing } from '@/lib/monitoring/tracing'

export async function POST(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    return tracing.traceOperation(
      'semantic_search_api',
      async (span) => {
        try {
          // Check authentication
          const supabase = await createServerSupabaseClient()
          const { data: { user }, error: authError } = await supabase.auth.getUser()
          
          if (authError || !user) {
            return NextResponse.json(
              { error: 'Unauthorized' },
              { status: 401 }
            )
          }

          const body = await req.json()
          const { query, difficulty, category, includeExamples = true, limit = 5 } = body

          if (!query || typeof query !== 'string') {
            return NextResponse.json(
              { error: 'Query is required' },
              { status: 400 }
            )
          }

          span.setAttributes({
            'search.query_length': query.length,
            'search.user_id': user.id,
            'search.difficulty': difficulty || 'auto',
            'search.category': category || 'all'
          })

          // Perform enhanced semantic search
          const results = await semanticSearch.enhancedSearch({
            query,
            userId: user.id,
            difficulty,
            category,
            includeExamples,
            limit
          })

          span.setAttributes({
            'search.results_count': results.results.length,
            'search.context_difficulty': results.context.difficulty,
            'search.suggestions_count': results.suggestions.length
          })

          return NextResponse.json({
            success: true,
            query,
            results: results.results,
            context: results.context,
            suggestions: results.suggestions,
            stats: semanticSearch.getStats()
          })

        } catch (error) {
          span.recordException(error as Error)
          console.error('Semantic search error:', error)
          
          return NextResponse.json(
            { error: 'Search failed' },
            { status: 500 }
          )
        }
      }
    )
  }, 'api')
}

export async function GET(request: NextRequest) {
  return withRateLimit(request, async () => {
    try {
      // Check authentication
      const supabase = await createServerSupabaseClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const url = new URL(request.url)
      const query = url.searchParams.get('q')

      if (!query) {
        return NextResponse.json(
          { error: 'Query parameter "q" is required' },
          { status: 400 }
        )
      }

      // Simple search for GET requests
      const results = await semanticSearch.searchSimilarContent(query, 5)
      const context = semanticSearch.getContextForUser(user.id)

      return NextResponse.json({
        success: true,
        query,
        results,
        context,
        stats: semanticSearch.getStats()
      })

    } catch (error) {
      console.error('Semantic search error:', error)
      
      return NextResponse.json(
        { error: 'Search failed' },
        { status: 500 }
      )
    }
  }, 'api')
}