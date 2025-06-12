/**
 * Advanced Semantic Search Engine for Zenya AI
 * God-Tier context understanding with vector embeddings
 */

import { tracing } from '@/lib/monitoring/tracing'
import { performanceMonitor } from '@/lib/monitoring/performance'

interface EmbeddingVector {
  id: string
  content: string
  vector: number[]
  metadata: {
    type: 'lesson' | 'concept' | 'example' | 'exercise' | 'context'
    category: string
    difficulty: number
    tags: string[]
    timestamp: number
    relevanceScore?: number
  }
}

interface SearchResult {
  content: string
  similarity: number
  metadata: EmbeddingVector['metadata']
  context: string
}

interface SemanticContext {
  userQuery: string
  relatedConcepts: string[]
  suggestedTopics: string[]
  difficulty: number
  learningPath: string[]
  prerequisites: string[]
}

export class SemanticSearchEngine {
  private embeddings: Map<string, EmbeddingVector> = new Map()
  private conceptGraph: Map<string, string[]> = new Map()
  private userContext: Map<string, SemanticContext> = new Map()
  private modelCache: Map<string, number[]> = new Map()
  
  // Learning content database (in production, this would be from a vector database)
  private readonly knowledgeBase = [
    {
      id: 'web-dev-basics-1',
      content: 'HTML is the foundation of web development. It provides structure to web pages using elements and tags.',
      type: 'concept' as const,
      category: 'web-development',
      difficulty: 1,
      tags: ['html', 'web', 'frontend', 'markup', 'structure'],
      prerequisites: [],
      relatedConcepts: ['css', 'javascript', 'dom']
    },
    {
      id: 'web-dev-basics-2', 
      content: 'CSS controls the visual presentation of HTML elements. It handles layout, colors, fonts, and responsive design.',
      type: 'concept' as const,
      category: 'web-development',
      difficulty: 2,
      tags: ['css', 'styling', 'layout', 'responsive', 'design'],
      prerequisites: ['html'],
      relatedConcepts: ['html', 'flexbox', 'grid', 'responsive-design']
    },
    {
      id: 'web-dev-basics-3',
      content: 'JavaScript adds interactivity to web pages. It can manipulate the DOM, handle events, and make API calls.',
      type: 'concept' as const,
      category: 'web-development', 
      difficulty: 3,
      tags: ['javascript', 'programming', 'interactivity', 'dom', 'events'],
      prerequisites: ['html', 'css'],
      relatedConcepts: ['dom', 'events', 'ajax', 'es6']
    },
    {
      id: 'react-intro-1',
      content: 'React is a JavaScript library for building user interfaces. It uses components and JSX syntax.',
      type: 'concept' as const,
      category: 'react',
      difficulty: 4,
      tags: ['react', 'components', 'jsx', 'ui', 'library'],
      prerequisites: ['javascript', 'html', 'css'],
      relatedConcepts: ['components', 'jsx', 'props', 'state']
    },
    {
      id: 'react-hooks-1',
      content: 'React Hooks like useState and useEffect allow functional components to use state and lifecycle methods.',
      type: 'concept' as const,
      category: 'react',
      difficulty: 5,
      tags: ['react', 'hooks', 'useState', 'useEffect', 'functional-components'],
      prerequisites: ['react', 'components'],
      relatedConcepts: ['state', 'effects', 'lifecycle']
    },
    {
      id: 'nextjs-intro-1',
      content: 'Next.js is a React framework that provides server-side rendering, routing, and API routes out of the box.',
      type: 'concept' as const,
      category: 'nextjs',
      difficulty: 6,
      tags: ['nextjs', 'ssr', 'routing', 'api', 'framework'],
      prerequisites: ['react', 'javascript'],
      relatedConcepts: ['ssr', 'routing', 'api-routes']
    },
    {
      id: 'typescript-intro-1',
      content: 'TypeScript adds static type checking to JavaScript, helping catch errors early and improving code quality.',
      type: 'concept' as const,
      category: 'typescript',
      difficulty: 4,
      tags: ['typescript', 'types', 'static-analysis', 'javascript'],
      prerequisites: ['javascript'],
      relatedConcepts: ['types', 'interfaces', 'generics']
    }
  ]

  constructor() {
    this.initializeKnowledgeBase()
    this.buildConceptGraph()
  }

  // Initialize embeddings for knowledge base
  private async initializeKnowledgeBase() {
    console.log('🧠 Initializing semantic knowledge base...')
    
    for (const item of this.knowledgeBase) {
      const vector = await this.generateEmbedding(item.content)
      
      this.embeddings.set(item.id, {
        id: item.id,
        content: item.content,
        vector,
        metadata: {
          type: item.type,
          category: item.category,
          difficulty: item.difficulty,
          tags: item.tags,
          timestamp: Date.now()
        }
      })
    }
    
    console.log(`✅ Loaded ${this.embeddings.size} semantic embeddings`)
  }

  // Build concept relationship graph
  private buildConceptGraph() {
    for (const item of this.knowledgeBase) {
      this.conceptGraph.set(item.id, item.relatedConcepts)
      
      // Add reverse relationships
      for (const concept of item.relatedConcepts) {
        const existing = this.conceptGraph.get(concept) || []
        if (!existing.includes(item.id)) {
          this.conceptGraph.set(concept, [...existing, item.id])
        }
      }
    }
  }

  // Generate embeddings using a lightweight approach
  // In production, this would use OpenAI embeddings or similar
  private async generateEmbedding(text: string): Promise<number[]> {
    return tracing.traceOperation(
      'generate_semantic_embedding',
      async (span) => {
        span.setAttributes({
          'semantic.text_length': text.length,
          'semantic.method': 'lightweight_vector'
        })

        // Check cache first
        const cacheKey = this.hashText(text)
        if (this.modelCache.has(cacheKey)) {
          return this.modelCache.get(cacheKey)!
        }

        // Lightweight semantic vector generation
        // This is a simplified approach - in production use proper embeddings
        const vector = this.createSemanticVector(text)
        
        // Cache the result
        this.modelCache.set(cacheKey, vector)
        
        return vector
      }
    )
  }

  // Create semantic vector using TF-IDF-like approach with semantic weights
  private createSemanticVector(text: string): number[] {
    const dimensions = 384 // Standard embedding size
    const vector = new Array(dimensions).fill(0)
    
    // Normalize text
    const normalizedText = text.toLowerCase()
    const words = normalizedText.split(/\s+/).filter(word => word.length > 2)
    
    // Semantic keyword weights
    const semanticWeights: Record<string, number> = {
      // Programming concepts
      'javascript': 0.9, 'react': 0.9, 'html': 0.8, 'css': 0.8,
      'typescript': 0.9, 'nextjs': 0.9, 'programming': 0.7,
      
      // Learning concepts
      'learn': 0.6, 'understand': 0.6, 'concept': 0.7, 'example': 0.8,
      'practice': 0.7, 'exercise': 0.6, 'tutorial': 0.7,
      
      // Technical terms
      'component': 0.8, 'function': 0.7, 'method': 0.7, 'property': 0.6,
      'variable': 0.6, 'array': 0.7, 'object': 0.7, 'string': 0.6,
      
      // Web development
      'web': 0.7, 'frontend': 0.8, 'backend': 0.8, 'api': 0.8,
      'database': 0.8, 'server': 0.7, 'client': 0.7
    }
    
    // Calculate semantic features
    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const weight = semanticWeights[word] || 0.3
      
      // Hash word to vector positions
      const hash1 = this.simpleHash(word) % dimensions
      const hash2 = this.simpleHash(word + 'semantic') % dimensions
      const hash3 = this.simpleHash(word + 'context') % dimensions
      
      // Add weighted contributions
      vector[hash1] += weight * 0.6
      vector[hash2] += weight * 0.3
      vector[hash3] += weight * 0.1
      
      // Add positional encoding
      const positionWeight = 1.0 / (1.0 + i * 0.1)
      vector[(hash1 + i) % dimensions] += weight * positionWeight * 0.2
    }
    
    // Add semantic category features
    const categories = ['web', 'programming', 'design', 'data', 'ai']
    categories.forEach((category, idx) => {
      if (normalizedText.includes(category)) {
        const categoryPos = (idx * 50) % dimensions
        for (let j = 0; j < 10; j++) {
          vector[(categoryPos + j) % dimensions] += 0.5
        }
      }
    })
    
    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    if (magnitude > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= magnitude
      }
    }
    
    return vector
  }

  // Simple hash function for text
  private hashText(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  // Calculate cosine similarity between vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    if (normA === 0 || normB === 0) return 0
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  // Semantic search for relevant content
  async searchSimilarContent(query: string, limit: number = 5): Promise<SearchResult[]> {
    return tracing.traceAIOperation(
      'semantic_search',
      'content_retrieval',
      async (span) => {
        span.setAttributes({
          'search.query_length': query.length,
          'search.limit': limit,
          'search.embeddings_count': this.embeddings.size
        })

        const queryVector = await this.generateEmbedding(query)
        const results: (SearchResult & { id: string })[] = []

        // Search through all embeddings
        for (const [id, embedding] of this.embeddings) {
          const similarity = this.cosineSimilarity(queryVector, embedding.vector)
          
          if (similarity > 0.1) { // Minimum similarity threshold
            results.push({
              id,
              content: embedding.content,
              similarity,
              metadata: embedding.metadata,
              context: this.generateContext(embedding, similarity)
            })
          }
        }

        // Sort by similarity and apply concept graph boosting
        results.sort((a, b) => {
          const boostA = this.getConceptBoost(a.id, query)
          const boostB = this.getConceptBoost(b.id, query)
          return (b.similarity + boostB) - (a.similarity + boostA)
        })

        const finalResults = results.slice(0, limit).map(({ id, ...rest }) => rest)

        span.setAttributes({
          'search.results_found': results.length,
          'search.results_returned': finalResults.length,
          'search.top_similarity': finalResults[0]?.similarity || 0
        })

        // Track search performance
        performanceMonitor.trackMetric({
          name: 'semantic_search_executed',
          value: 1,
          unit: 'count',
          metadata: {
            query: query.substring(0, 50),
            resultsFound: results.length,
            topSimilarity: finalResults[0]?.similarity || 0
          }
        })

        return finalResults
      }
    )
  }

  // Generate enhanced context for search results
  private generateContext(embedding: EmbeddingVector, similarity: number): string {
    const contexts = []
    
    // Add difficulty context
    if (embedding.metadata.difficulty <= 2) {
      contexts.push('Beginner-friendly')
    } else if (embedding.metadata.difficulty <= 4) {
      contexts.push('Intermediate level')
    } else {
      contexts.push('Advanced topic')
    }
    
    // Add category context
    contexts.push(`${embedding.metadata.category} concept`)
    
    // Add relevance context
    if (similarity > 0.8) {
      contexts.push('Highly relevant')
    } else if (similarity > 0.6) {
      contexts.push('Relevant')
    } else {
      contexts.push('Related')
    }
    
    return contexts.join(' • ')
  }

  // Get concept relationship boost
  private getConceptBoost(embeddingId: string, query: string): number {
    const queryWords = query.toLowerCase().split(/\s+/)
    const relatedConcepts = this.conceptGraph.get(embeddingId) || []
    
    let boost = 0
    for (const concept of relatedConcepts) {
      for (const word of queryWords) {
        if (concept.includes(word) || word.includes(concept)) {
          boost += 0.1
        }
      }
    }
    
    return Math.min(boost, 0.3) // Cap boost at 0.3
  }

  // Build comprehensive semantic context for AI responses
  async buildSemanticContext(userQuery: string, userId: string): Promise<SemanticContext> {
    return tracing.traceOperation(
      'build_semantic_context',
      async (span) => {
        span.setAttributes({
          'context.user_id': userId,
          'context.query_length': userQuery.length
        })

        // Get similar content
        const similarContent = await this.searchSimilarContent(userQuery, 3)
        
        // Extract concepts and topics
        const relatedConcepts = this.extractConcepts(userQuery, similarContent)
        const suggestedTopics = this.generateSuggestedTopics(relatedConcepts)
        
        // Determine difficulty level
        const difficulty = this.estimateDifficulty(userQuery, similarContent)
        
        // Generate learning path
        const learningPath = this.generateLearningPath(relatedConcepts, difficulty)
        
        // Identify prerequisites
        const prerequisites = this.identifyPrerequisites(relatedConcepts)
        
        const context: SemanticContext = {
          userQuery,
          relatedConcepts,
          suggestedTopics,
          difficulty,
          learningPath,
          prerequisites
        }
        
        // Cache context for user
        this.userContext.set(userId, context)
        
        span.setAttributes({
          'context.related_concepts_count': relatedConcepts.length,
          'context.suggested_topics_count': suggestedTopics.length,
          'context.difficulty': difficulty,
          'context.learning_path_length': learningPath.length
        })
        
        return context
      }
    )
  }

  // Extract concepts from query and search results
  private extractConcepts(query: string, searchResults: SearchResult[]): string[] {
    const concepts = new Set<string>()
    
    // Extract from query
    const queryWords = query.toLowerCase().split(/\s+/)
    for (const word of queryWords) {
      if (word.length > 3) {
        concepts.add(word)
      }
    }
    
    // Extract from search results
    for (const result of searchResults) {
      for (const tag of result.metadata.tags) {
        concepts.add(tag)
      }
    }
    
    return Array.from(concepts).slice(0, 10)
  }

  // Generate suggested topics based on concepts
  private generateSuggestedTopics(concepts: string[]): string[] {
    const topicMap: Record<string, string[]> = {
      html: ['CSS styling', 'DOM manipulation', 'Semantic HTML'],
      css: ['Flexbox layout', 'Grid system', 'Responsive design'],
      javascript: ['ES6 features', 'Async programming', 'DOM events'],
      react: ['Component lifecycle', 'Hooks', 'State management'],
      typescript: ['Type annotations', 'Interfaces', 'Generics'],
      nextjs: ['Server-side rendering', 'API routes', 'Deployment']
    }
    
    const suggestions = new Set<string>()
    
    for (const concept of concepts) {
      const related = topicMap[concept] || []
      for (const topic of related) {
        suggestions.add(topic)
      }
    }
    
    return Array.from(suggestions).slice(0, 5)
  }

  // Estimate query difficulty level
  private estimateDifficulty(query: string, searchResults: SearchResult[]): number {
    let totalDifficulty = 0
    let count = 0
    
    // Base difficulty from search results
    for (const result of searchResults) {
      totalDifficulty += result.metadata.difficulty
      count++
    }
    
    // Adjust based on query complexity
    const queryComplexity = this.analyzeQueryComplexity(query)
    
    const baseDifficulty = count > 0 ? totalDifficulty / count : 3
    return Math.max(1, Math.min(10, Math.round(baseDifficulty + queryComplexity)))
  }

  // Analyze query complexity
  private analyzeQueryComplexity(query: string): number {
    let complexity = 0
    
    // Length factor
    if (query.length > 100) complexity += 1
    if (query.length > 200) complexity += 1
    
    // Technical terms
    const technicalTerms = ['advanced', 'complex', 'implementation', 'architecture', 'optimization']
    for (const term of technicalTerms) {
      if (query.toLowerCase().includes(term)) {
        complexity += 0.5
      }
    }
    
    // Question complexity
    if (query.includes('how') && query.includes('why')) complexity += 1
    if (query.includes('compare') || query.includes('difference')) complexity += 1
    
    return complexity
  }

  // Generate learning path
  private generateLearningPath(concepts: string[], difficulty: number): string[] {
    const learningPaths: Record<string, string[]> = {
      'web-development': [
        'HTML basics',
        'CSS styling',
        'JavaScript fundamentals',
        'DOM manipulation',
        'React components',
        'Advanced React',
        'Next.js framework'
      ],
      'programming': [
        'Programming basics',
        'JavaScript syntax',
        'Functions and scope',
        'Object-oriented programming',
        'Async programming',
        'Advanced patterns'
      ]
    }
    
    // Determine primary learning track
    let primaryTrack = 'programming'
    if (concepts.some(c => ['html', 'css', 'web', 'frontend'].includes(c))) {
      primaryTrack = 'web-development'
    }
    
    const path = learningPaths[primaryTrack] || learningPaths.programming
    
    // Adjust path based on difficulty
    const startIndex = Math.max(0, difficulty - 3)
    const endIndex = Math.min(path.length, startIndex + 4)
    
    return path.slice(startIndex, endIndex)
  }

  // Identify prerequisites
  private identifyPrerequisites(concepts: string[]): string[] {
    const prerequisites: Record<string, string[]> = {
      'react': ['JavaScript', 'HTML', 'CSS'],
      'nextjs': ['React', 'JavaScript', 'Node.js'],
      'typescript': ['JavaScript'],
      'hooks': ['React basics', 'Components'],
      'jsx': ['JavaScript', 'HTML'],
      'api': ['HTTP', 'JSON', 'JavaScript']
    }
    
    const required = new Set<string>()
    
    for (const concept of concepts) {
      const prereqs = prerequisites[concept] || []
      for (const prereq of prereqs) {
        required.add(prereq)
      }
    }
    
    return Array.from(required).slice(0, 5)
  }

  // Get semantic context for user
  getContextForUser(userId: string): SemanticContext | null {
    return this.userContext.get(userId) || null
  }

  // Enhanced search with context and filters
  async enhancedSearch(options: {
    query: string
    userId: string
    difficulty?: number
    category?: string
    includeExamples?: boolean
    limit?: number
  }): Promise<{
    results: SearchResult[]
    context: SemanticContext
    suggestions: string[]
  }> {
    const {
      query,
      userId,
      difficulty,
      category,
      includeExamples = true,
      limit = 5
    } = options

    // Build semantic context
    const context = await this.buildSemanticContext(query, userId)
    
    // Get search results
    let results = await this.searchSimilarContent(query, limit * 2)
    
    // Apply filters
    if (difficulty) {
      results = results.filter(r => 
        Math.abs(r.metadata.difficulty - difficulty) <= 2
      )
    }
    
    if (category) {
      results = results.filter(r => r.metadata.category === category)
    }
    
    if (!includeExamples) {
      results = results.filter(r => r.metadata.type !== 'example')
    }
    
    // Generate contextual suggestions
    const suggestions = this.generateContextualSuggestions(query, results, context)
    
    return {
      results: results.slice(0, limit),
      context,
      suggestions
    }
  }

  // Generate contextual suggestions
  private generateContextualSuggestions(
    query: string,
    results: SearchResult[],
    context: SemanticContext
  ): string[] {
    const suggestions = new Set<string>()
    
    // Add related concepts as suggestions
    for (const concept of context.relatedConcepts.slice(0, 3)) {
      suggestions.add(`Learn more about ${concept}`)
    }
    
    // Add learning path suggestions
    for (const step of context.learningPath.slice(0, 2)) {
      suggestions.add(`Next: ${step}`)
    }
    
    // Add prerequisite suggestions if difficulty is high
    if (context.difficulty > 6 && context.prerequisites.length > 0) {
      suggestions.add(`Review: ${context.prerequisites[0]}`)
    }
    
    return Array.from(suggestions)
  }

  // Get system stats
  getStats() {
    return {
      embeddingsCount: this.embeddings.size,
      conceptGraphSize: this.conceptGraph.size,
      activeUserContexts: this.userContext.size,
      cacheSize: this.modelCache.size
    }
  }
}

// Export singleton instance
export const semanticSearch = new SemanticSearchEngine()