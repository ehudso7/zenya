#!/usr/bin/env ts-node

/**
 * AI Test Report Generator
 * Generates comprehensive HTML report of AI testing results
 */

import { promises as fs } from 'fs'
import path from 'path'

interface TestResult {
  testName: string
  status: 'passed' | 'failed' | 'warning'
  duration: number
  details: any
  error?: string
}

interface TestReport {
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
    successRate: number
  }
  results: TestResult[]
  timestamp: string
}

async function generateHTMLReport(report: TestReport): Promise<string> {
  const { summary, results, timestamp } = report
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zenya AI Test Report - ${new Date(timestamp).toLocaleDateString()}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 0.9em;
      text-transform: uppercase;
    }
    
    .summary-card .value {
      font-size: 2.5em;
      font-weight: bold;
      margin: 0;
    }
    
    .passed { color: #10b981; }
    .failed { color: #ef4444; }
    .warning { color: #f59e0b; }
    .neutral { color: #6b7280; }
    
    .success-rate {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }
    
    .results {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .results h2 {
      margin: 0;
      padding: 20px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .test-item {
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      transition: background 0.2s;
    }
    
    .test-item:hover {
      background: #f9fafb;
    }
    
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .test-name {
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .status-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
    }
    
    .status-icon.passed { background: #10b981; }
    .status-icon.failed { background: #ef4444; }
    .status-icon.warning { background: #f59e0b; }
    
    .duration {
      color: #6b7280;
      font-size: 0.9em;
    }
    
    .details {
      background: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      margin-top: 10px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.85em;
      overflow-x: auto;
    }
    
    .error {
      background: #fee;
      color: #c00;
      padding: 10px;
      border-radius: 6px;
      margin-top: 10px;
    }
    
    .category {
      background: #f3f4f6;
      padding: 15px 20px;
      font-weight: 600;
      color: #4b5563;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .charts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .chart-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .progress-bar {
      width: 100%;
      height: 20px;
      background: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 10px;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981 0%, #059669 100%);
      transition: width 0.3s ease;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      color: #6b7280;
    }
    
    @media (max-width: 768px) {
      .summary {
        grid-template-columns: 1fr 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 Zenya AI Test Report</h1>
    <p>Generated on ${new Date(timestamp).toLocaleString()}</p>
  </div>
  
  <div class="summary">
    <div class="summary-card">
      <h3>Total Tests</h3>
      <p class="value neutral">${summary.total}</p>
    </div>
    <div class="summary-card">
      <h3>Passed</h3>
      <p class="value passed">${summary.passed}</p>
    </div>
    <div class="summary-card">
      <h3>Failed</h3>
      <p class="value failed">${summary.failed}</p>
    </div>
    <div class="summary-card">
      <h3>Warnings</h3>
      <p class="value warning">${summary.warnings}</p>
    </div>
    <div class="summary-card success-rate">
      <h3>Success Rate</h3>
      <p class="value">${summary.successRate}%</p>
    </div>
  </div>
  
  <div class="charts">
    <div class="chart-card">
      <h3>Test Results Distribution</h3>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${summary.successRate}%"></div>
      </div>
      <p style="margin-top: 10px; color: #6b7280; font-size: 0.9em;">
        ${summary.passed} passed / ${summary.total} total
      </p>
    </div>
    
    <div class="chart-card">
      <h3>Performance Overview</h3>
      <div style="display: flex; justify-content: space-between; margin-top: 15px;">
        <div>
          <p style="margin: 0; color: #6b7280; font-size: 0.9em;">Avg Duration</p>
          <p style="margin: 0; font-weight: bold;">
            ${Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)}ms
          </p>
        </div>
        <div>
          <p style="margin: 0; color: #6b7280; font-size: 0.9em;">Max Duration</p>
          <p style="margin: 0; font-weight: bold;">
            ${Math.max(...results.map(r => r.duration))}ms
          </p>
        </div>
      </div>
    </div>
  </div>
  
  <div class="results">
    <h2>Test Results</h2>
    
    ${generateTestCategories(results)}
  </div>
  
  <div class="footer">
    <p>Zenya AI Testing Suite v1.0.0</p>
    <p>Comprehensive testing for AI features, providers, and fallback systems</p>
  </div>
</body>
</html>
  `
  
  return html
}

function generateTestCategories(results: TestResult[]): string {
  const categories = {
    'Provider Integration': results.filter(r => r.testName.includes('Integration')),
    'AI Features': results.filter(r => r.testName.includes('AI Feature')),
    'Fallback Mechanisms': results.filter(r => 
      r.testName.includes('Circuit Breaker') || 
      r.testName.includes('Retry') || 
      r.testName.includes('Fallback') ||
      r.testName.includes('Degradation')
    ),
    'Performance': results.filter(r => 
      r.testName.includes('Performance') || 
      r.testName.includes('Streaming') ||
      r.testName.includes('Token') ||
      r.testName.includes('Caching') ||
      r.testName.includes('Rate Limiting')
    ),
    'Context Management': results.filter(r => 
      r.testName.includes('Context') || 
      r.testName.includes('Conversation') ||
      r.testName.includes('Memory') ||
      r.testName.includes('Preference')
    ),
    'Quality Assurance': results.filter(r => 
      r.testName.includes('Quality') || 
      r.testName.includes('Moderation') ||
      r.testName.includes('Accessibility') ||
      r.testName.includes('Language')
    )
  }
  
  let html = ''
  
  for (const [category, tests] of Object.entries(categories)) {
    if (tests.length === 0) continue
    
    html += `<div class="category">${category}</div>`
    
    for (const test of tests) {
      const statusIcon = test.status === 'passed' ? '✓' : 
                        test.status === 'failed' ? '✗' : '⚠'
      
      html += `
        <div class="test-item">
          <div class="test-header">
            <div class="test-name">
              <div class="status-icon ${test.status}">${statusIcon}</div>
              ${test.testName}
            </div>
            <div class="duration">${test.duration}ms</div>
          </div>
          
          ${test.details ? `
            <div class="details">
              <pre>${JSON.stringify(test.details, null, 2)}</pre>
            </div>
          ` : ''}
          
          ${test.error ? `
            <div class="error">
              Error: ${test.error}
            </div>
          ` : ''}
        </div>
      `
    }
  }
  
  return html
}

async function main() {
  try {
    // Read test results
    const resultsPath = path.join(__dirname, 'ai-test-results.json')
    const resultsData = await fs.readFile(resultsPath, 'utf-8')
    const report: TestReport = JSON.parse(resultsData)
    
    // Generate HTML report
    const htmlReport = await generateHTMLReport(report)
    
    // Save HTML report
    const reportPath = path.join(__dirname, 'ai-test-report.html')
    await fs.writeFile(reportPath, htmlReport, 'utf-8')
    
    console.log(`✅ Test report generated: ${reportPath}`)
    
    // Also generate a markdown summary
    const markdownSummary = generateMarkdownSummary(report)
    const summaryPath = path.join(__dirname, 'ai-test-summary.md')
    await fs.writeFile(summaryPath, markdownSummary, 'utf-8')
    
    console.log(`✅ Test summary generated: ${summaryPath}`)
    
  } catch (error) {
    console.error('❌ Failed to generate report:', error)
    process.exit(1)
  }
}

function generateMarkdownSummary(report: TestReport): string {
  const { summary, results } = report
  
  let md = `# Zenya AI Test Summary

Generated: ${new Date(report.timestamp).toLocaleString()}

## Overall Results

- **Total Tests**: ${summary.total}
- **Passed**: ${summary.passed} ✅
- **Failed**: ${summary.failed} ❌
- **Warnings**: ${summary.warnings} ⚠️
- **Success Rate**: ${summary.successRate}%

## Test Categories

### ✅ Passed Tests
${results.filter(r => r.status === 'passed').map(r => `- ${r.testName} (${r.duration}ms)`).join('\n')}

### ❌ Failed Tests
${results.filter(r => r.status === 'failed').map(r => `- ${r.testName}: ${r.error || 'Unknown error'}`).join('\n') || 'None'}

### ⚠️ Warning Tests
${results.filter(r => r.status === 'warning').map(r => `- ${r.testName}`).join('\n') || 'None'}

## Key Findings

### AI Provider Integration
- OpenAI integration: ${results.find(r => r.testName === 'OpenAI Integration')?.status || 'Not tested'}
- Anthropic integration: ${results.find(r => r.testName === 'Anthropic Integration')?.status || 'Not tested'}
- Fallback mechanisms: ${results.find(r => r.testName === 'Graceful Degradation')?.status || 'Not tested'}

### Performance Metrics
- Average response time: ${Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)}ms
- Max response time: ${Math.max(...results.map(r => r.duration))}ms
- Min response time: ${Math.min(...results.map(r => r.duration))}ms

## Recommendations

${generateRecommendations(results)}
`
  
  return md
}

function generateRecommendations(results: TestResult[]): string {
  const recommendations: string[] = []
  
  const failed = results.filter(r => r.status === 'failed')
  const warnings = results.filter(r => r.status === 'warning')
  
  if (failed.length > 0) {
    recommendations.push('### Critical Issues')
    failed.forEach(test => {
      if (test.testName.includes('Provider')) {
        recommendations.push(`- Fix ${test.testName}: Check API key configuration`)
      } else if (test.testName.includes('Memory')) {
        recommendations.push(`- Optimize memory usage in ${test.testName}`)
      } else {
        recommendations.push(`- Investigate failure in ${test.testName}`)
      }
    })
  }
  
  if (warnings.length > 0) {
    recommendations.push('\n### Performance Optimizations')
    warnings.forEach(test => {
      if (test.testName.includes('Cache')) {
        recommendations.push('- Implement more aggressive caching strategies')
      } else if (test.testName.includes('Token')) {
        recommendations.push('- Optimize token usage for cost efficiency')
      } else {
        recommendations.push(`- Review performance of ${test.testName}`)
      }
    })
  }
  
  if (failed.length === 0 && warnings.length === 0) {
    recommendations.push('✅ All systems operating optimally!')
  }
  
  return recommendations.join('\n')
}

// Run report generation
if (require.main === module) {
  main()
}