/**
 * Custom Embedding Classifier
 * Routes user queries and personalizes AI responses based on embeddings
 */

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/client'

export interface ClassificationResult {
  category: 'question' | 'statement' | 'command' | 'feedback' | 'other'
  intent: string
  confidence: number
  topics: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  personalization: {
    tone: string
    complexity: 'simple' | 'moderate' | 'advanced'
    suggestedApproach: string
  }
}

export interface EmbeddingMatch {
  id: string
  content: string
  similarity: number
  metadata?: Record<string, any>
}

export class EmbeddingClassifier {
  private openai: OpenAI
  private supabase = createClient()
  private embeddingCache = new Map<string, number[]>()
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cached = this.embeddingCache.get(text)
    if (cached) return cached
    
    try {
      const response = await this.openai.embeddings.create({
        model: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
        input: text,
        dimensions: 1536
      })
      
      const embedding = response.data[0].embedding
      
      // Cache the result
      if (this.embeddingCache.size > 1000) {
        // Simple LRU: clear half the cache when it gets too big
        const entriesToDelete = Array.from(this.embeddingCache.keys()).slice(0, 500)
        entriesToDelete.forEach(key => this.embeddingCache.delete(key))
      }
      this.embeddingCache.set(text, embedding)
      
      return embedding
    } catch (error) {
      console.error('Failed to generate embedding:', error)
      throw error
    }
  }

  /**
   * Classify user input based on embeddings and context
   */
  async classify(
    input: string,
    context?: {
      previousMessages?: Array<{ role: string; content: string }>
      userId?: string
      lessonContext?: string
    }
  ): Promise<ClassificationResult> {
    try {
      // Generate embedding for the input
      const inputEmbedding = await this.generateEmbedding(input)
      
      // Find similar content in our knowledge base
      const similarContent = await this.findSimilar(inputEmbedding, 5)
      
      // Use GPT to classify based on input and similar content
      const classificationPrompt = this.buildClassificationPrompt(input, similarContent, context)
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a classification expert. Analyze the user input and return a JSON object with:
- category: one of 'question', 'statement', 'command', 'feedback', 'other'
- intent: brief description of what the user wants
- confidence: 0-1 score of classification confidence
- topics: array of relevant topics
- sentiment: 'positive', 'neutral', or 'negative'
- personalization: object with tone (supportive/encouraging/direct/playful), complexity (simple/moderate/advanced), and suggestedApproach`
          },
          {
            role: 'user',
            content: classificationPrompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
      
      const classification = JSON.parse(response.choices[0].message.content || '{}')
      
      // Store classification for learning
      await this.storeClassification(input, classification, context?.userId)
      
      return classification
    } catch (error) {
      console.error('Classification failed:', error)
      // Return sensible defaults
      return {
        category: 'other',
        intent: 'general inquiry',
        confidence: 0.5,
        topics: [],
        sentiment: 'neutral',
        personalization: {
          tone: 'supportive',
          complexity: 'moderate',
          suggestedApproach: 'Provide helpful information'
        }
      }
    }
  }

  /**
   * Find similar content using vector similarity
   */
  async findSimilar(embedding: number[], limit: number = 5): Promise<EmbeddingMatch[]> {
    try {
      // For now, use in-memory examples
      // In production, this would query a vector database
      const examples = [
        { id: '1', content: 'How do I solve quadratic equations?', category: 'math' },
        { id: '2', content: 'Explain photosynthesis', category: 'science' },
        { id: '3', content: 'What are the main causes of World War I?', category: 'history' },
        { id: '4', content: 'Help me write better essays', category: 'writing' },
        { id: '5', content: 'I\'m struggling with this concept', category: 'support' }
      ]
      
      const matches: EmbeddingMatch[] = []
      
      for (const example of examples) {
        const exampleEmbedding = await this.generateEmbedding(example.content)
        const similarity = this.cosineSimilarity(embedding, exampleEmbedding)
        matches.push({
          id: example.id,
          content: example.content,
          similarity,
          metadata: { category: example.category }
        })
      }
      
      return matches
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
    } catch (error) {
      console.error('Failed to find similar content:', error)
      return []
    }
  }

  /**
   * Route query to appropriate handler based on classification
   */
  async routeQuery(
    query: string,
    classification: ClassificationResult
  ): Promise<{
    handler: 'curriculum' | 'general' | 'feedback' | 'support'
    context?: any
  }> {
    // Route based on category and intent
    if (classification.category === 'question' && classification.topics.some(t => 
      ['math', 'science', 'history', 'programming', 'language'].includes(t.toLowerCase())
    )) {
      return { handler: 'curriculum', context: { topics: classification.topics } }
    }
    
    if (classification.category === 'feedback' || classification.sentiment === 'negative') {
      return { handler: 'support', context: { needsEncouragement: true } }
    }
    
    if (classification.intent.includes('help') || classification.intent.includes('struggle')) {
      return { handler: 'support', context: { personalized: true } }
    }
    
    return { handler: 'general' }
  }

  /**
   * Generate personalized response modifications
   */
  async personalizeResponse(
    baseResponse: string,
    classification: ClassificationResult,
    _userProfile?: any
  ): Promise<string> {
    const { tone } = classification.personalization
    
    // Apply tone adjustments
    const tonePrompt = `Adjust this response to be more ${tone}: "${baseResponse}"`
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are personalizing educational responses. Make the tone ${tone} while maintaining accuracy. Keep the same information but adjust the delivery.`
          },
          {
            role: 'user',
            content: tonePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
      
      return response.choices[0].message.content || baseResponse
    } catch (error) {
      console.error('Personalization failed:', error)
      return baseResponse
    }
  }

  // Helper methods
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
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  private buildClassificationPrompt(
    input: string,
    similarContent: EmbeddingMatch[],
    context?: any
  ): string {
    let prompt = `User input: "${input}"\n\n`
    
    if (similarContent.length > 0) {
      prompt += 'Similar queries found:\n'
      similarContent.forEach(match => {
        prompt += `- "${match.content}" (similarity: ${match.similarity.toFixed(2)})\n`
      })
      prompt += '\n'
    }
    
    if (context?.previousMessages) {
      prompt += 'Recent conversation:\n'
      context.previousMessages.slice(-3).forEach((msg: any) => {
        prompt += `${msg.role}: ${msg.content.substring(0, 100)}...\n`
      })
      prompt += '\n'
    }
    
    if (context?.lessonContext) {
      prompt += `Current lesson context: ${context.lessonContext}\n`
    }
    
    return prompt
  }

  private async storeClassification(
    input: string,
    classification: ClassificationResult,
    userId?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('embedding_classifications')
        .insert({
          user_id: userId,
          input_text: input,
          classification: classification,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      // Silent fail - logging is not critical
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to store classification:', error)
      }
    }
  }

  /**
   * Generate training dataset for fine-tuning
   */
  async generateTrainingDataset(): Promise<any[]> {
    const dataset = []
    
    // Example classifications for common educational queries
    const examples = [
      {
        input: "Can you explain photosynthesis?",
        output: {
          category: 'question',
          intent: 'explain scientific concept',
          topics: ['science', 'biology', 'photosynthesis'],
          sentiment: 'neutral',
          personalization: {
            tone: 'supportive',
            complexity: 'moderate',
            suggestedApproach: 'Step-by-step explanation with examples'
          }
        }
      },
      {
        input: "I don't understand this at all",
        output: {
          category: 'statement',
          intent: 'expressing difficulty',
          topics: [],
          sentiment: 'negative',
          personalization: {
            tone: 'encouraging',
            complexity: 'simple',
            suggestedApproach: 'Break down into smaller parts'
          }
        }
      },
      {
        input: "Show me practice problems",
        output: {
          category: 'command',
          intent: 'request practice materials',
          topics: [],
          sentiment: 'neutral',
          personalization: {
            tone: 'direct',
            complexity: 'moderate',
            suggestedApproach: 'Provide interactive exercises'
          }
        }
      }
    ]
    
    for (const example of examples) {
      dataset.push({
        messages: [
          {
            role: 'system',
            content: 'Classify educational queries and provide personalization guidance.'
          },
          {
            role: 'user',
            content: example.input
          },
          {
            role: 'assistant',
            content: JSON.stringify(example.output)
          }
        ]
      })
    }
    
    return dataset
  }
}

// Export singleton instance
export const embeddingClassifier = new EmbeddingClassifier()

// Middleware for easy integration
export async function classifyAndRoute(
  input: string,
  context?: any
): Promise<{
  classification: ClassificationResult
  routing: { handler: string; context?: any }
}> {
  const classification = await embeddingClassifier.classify(input, context)
  const routing = await embeddingClassifier.routeQuery(input, classification)
  
  return { classification, routing }
}