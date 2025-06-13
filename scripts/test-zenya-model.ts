#!/usr/bin/env ts-node
/**
 * Test script for Zenya fine-tuned model
 * Usage: npx ts-node scripts/test-zenya-model.ts
 */

import { ZenyaOpenAIProvider } from '../lib/ai/zenya-openai-provider'
import { UserContext } from '../lib/ai/zenya-model-config'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testZenyaModel() {
  console.log('🧪 Testing Zenya Fine-Tuned Model Integration\n')
  
  // Check environment variables
  const apiKey = process.env.OPENAI_API_KEY
  const modelId = process.env.ZENYA_FINE_TUNED_MODEL
  const isEnabled = process.env.ENABLE_FINE_TUNED_MODEL === 'true'
  
  console.log('📋 Configuration:')
  console.log(`- API Key: ${apiKey ? '✅ Present' : '❌ Missing'}`)
  console.log(`- Model ID: ${modelId || 'Not configured'}`)
  console.log(`- Enabled: ${isEnabled ? '✅ Yes' : '❌ No'}`)
  console.log()
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is required')
    process.exit(1)
  }
  
  // Create provider instance
  const provider = new ZenyaOpenAIProvider({ apiKey })
  
  // Test cases
  const testCases = [
    {
      name: 'Semantic Search Explanation',
      messages: [
        { role: 'system', content: 'You are Zenya, a witty AI tutor.' },
        { role: 'user', content: 'Can you explain semantic search simply?' }
      ],
      userContext: {
        id: 'test-user-1',
        usageScore: 85,
        segment: 'power-user' as const,
        persona: 'zenya'
      }
    },
    {
      name: 'Learning Encouragement',
      messages: [
        { role: 'system', content: 'You are Zenya, an encouraging learning coach. The user is feeling tired.' },
        { role: 'user', content: "I'm struggling with understanding recursion. It's so confusing!" }
      ],
      userContext: {
        id: 'test-user-2',
        usageScore: 45,
        segment: 'regular' as const,
        persona: 'zenya'
      }
    },
    {
      name: 'Complex Technical Topic',
      messages: [
        { role: 'system', content: 'You are Zenya, helping a user understand complex topics in simple terms.' },
        { role: 'user', content: 'What is the difference between supervised and unsupervised learning?' }
      ],
      userContext: {
        id: 'test-user-3',
        usageScore: 95,
        segment: 'power-user' as const,
        persona: 'zenya'
      }
    }
  ]
  
  // Run tests
  for (const testCase of testCases) {
    console.log(`\n🔬 Test: ${testCase.name}`)
    console.log(`👤 User: ${testCase.userContext.segment} (score: ${testCase.userContext.usageScore})`)
    console.log(`💬 Question: ${testCase.messages[1].content}`)
    
    try {
      const startTime = Date.now()
      
      // Test model selection
      const modelConfig = provider.getModelConfig()
      const expectedModel = isEnabled && testCase.userContext.usageScore >= (modelConfig.minUsageScore || 80)
        ? modelId
        : 'gpt-3.5-turbo'
      
      console.log(`🎯 Expected Model: ${expectedModel}`)
      
      // Make API call
      const response = await provider.chat(testCase.messages, {
        user: testCase.userContext as UserContext,
        variant: 'zenya-chat',
        temperature: 0.7,
        maxTokens: 200
      })
      
      const duration = Date.now() - startTime
      
      console.log(`✅ Response received in ${duration}ms`)
      console.log(`📝 Response: ${response.substring(0, 150)}...`)
      
      // Estimate cost
      const estimatedCost = provider.estimateCost(response.length / 4, expectedModel) // Rough token estimate
      console.log(`💰 Estimated cost: $${estimatedCost.toFixed(4)}`)
      
    } catch (error) {
      console.error(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  console.log('\n\n📊 Test Summary:')
  console.log('- All tests completed')
  console.log('- Check logs for detailed metrics')
  console.log('- Monitor your OpenAI dashboard for usage')
}

// Run tests
testZenyaModel().catch(console.error)