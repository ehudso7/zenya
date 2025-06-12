#!/usr/bin/env ts-node

/**
 * AI Features Test Runner
 * Execute comprehensive testing of Zenya AI features
 */

import { aiTester } from './ai-features-test'
import { promises as fs } from 'fs'
import path from 'path'

async function runTests() {
  console.log('🤖 Zenya AI Features Testing Suite')
  console.log('=' .repeat(50))
  console.log('Testing AI provider integrations, features, and fallback systems\n')
  
  try {
    // Run all tests
    await aiTester.runAllTests()
    
    // Generate and save report
    const report = aiTester.generateReport()
    
    // Save results to file
    const resultsPath = path.join(__dirname, 'ai-test-results.json')
    await fs.writeFile(
      resultsPath,
      JSON.stringify(report, null, 2),
      'utf-8'
    )
    
    // Exit with appropriate code
    const exitCode = report.summary.failed > 0 ? 1 : 0
    process.exit(exitCode)
    
  } catch (error) {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  }
}

// Run tests
runTests()