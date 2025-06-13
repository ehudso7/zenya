import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/api-middleware'
import { paginationSchema } from '@/lib/validations'
import { validateQueryParams } from '@/lib/validation-middleware'

export async function GET(request: NextRequest) {
  return withRateLimit(request, async (req) => {
    try {
      const supabase = await createServerSupabaseClient()
      
      // Validate pagination parameters
      const { data: paginationParams, error: validationError } = await validateQueryParams(req, paginationSchema)
      
      if (validationError) {
        return validationError
      }

      // Use default values if validation failed
      const page = paginationParams?.page ?? 1
      const limit = paginationParams?.limit ?? 10
      const sortBy = paginationParams?.sortBy
      const sortOrder = paginationParams?.sortOrder ?? 'desc'
      const offset = (page - 1) * limit
      
      // Fetch all active curriculums
      let query = supabase
      .from('curriculums')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

      // Apply sorting
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      } else {
        query = query.order('title')
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1)

      const { data: curriculums, error, count } = await query

      if (error) {
        console.error('[API] Failed to fetch curriculums:', error)
        return NextResponse.json(
          { 
            error: 'Failed to fetch curriculums',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { 
          curriculums,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          }
        },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'CDN-Cache-Control': 'public, max-age=600',
          }
        }
      )
  } catch (_error) {
      console.error('[API] Curriculums endpoint error:', _error)
      return NextResponse.json(
        { 
          error: 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? (_error as Error).message : undefined
        },
        { status: 500 }
      )
    }
  }, 'api')
}