#!/usr/bin/env node

/**
 * Advanced Lighthouse Performance Check Script
 * God-Tier performance monitoring with detailed analysis
 */

const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const fs = require('fs').promises
const path = require('path')

// Performance thresholds for God-Tier application
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  'largest-contentful-paint': { threshold: 2.5, unit: 's', critical: true },
  'first-input-delay': { threshold: 100, unit: 'ms', critical: true },
  'cumulative-layout-shift': { threshold: 0.1, unit: 'score', critical: true },
  'first-contentful-paint': { threshold: 1.8, unit: 's', critical: false },
  'speed-index': { threshold: 3.0, unit: 's', critical: false },
  'total-blocking-time': { threshold: 200, unit: 'ms', critical: false },
  
  // Additional metrics
  'time-to-interactive': { threshold: 3.8, unit: 's', critical: false },
  'server-response-time': { threshold: 600, unit: 'ms', critical: false },
  'dom-size': { threshold: 800, unit: 'elements', critical: false },
  'unused-css-rules': { threshold: 20, unit: 'KB', critical: false }
}

// URLs to test
const TEST_URLS = [
  { url: 'http://localhost:3000/', name: 'Homepage' },
  { url: 'http://localhost:3000/landing', name: 'Landing Page' },
  { url: 'http://localhost:3000/learn', name: 'Learn Page' },
  { url: 'http://localhost:3000/auth/signin', name: 'Sign In' },
  { url: 'http://localhost:3000/profile', name: 'Profile Page' }
]

class PerformanceAnalyzer {
  constructor() {
    this.results = []
    this.chrome = null
  }

  async initialize() {
    console.log('🚀 Launching Chrome for Lighthouse analysis...')
    this.chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    })
  }

  async runLighthouse(url, name) {
    console.log(`📊 Analyzing: ${name} (${url})`)
    
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: this.chrome.port,
      settings: {
        throttling: {
          cpuSlowdownMultiplier: 1,
          downloadThroughputKbps: 10240,
          uploadThroughputKbps: 10240,
          rttMs: 40
        }
      }
    }

    try {
      const runnerResult = await lighthouse(url, options)
      return {
        name,
        url,
        lhr: runnerResult.lhr,
        report: runnerResult.report
      }
    } catch (error) {
      console.error(`❌ Failed to analyze ${name}:`, error.message)
      return null
    }
  }

  analyzeResult(result) {
    if (!result) return null

    const { lhr, name, url } = result
    const audits = lhr.audits
    const analysis = {
      name,
      url,
      score: Math.round(lhr.categories.performance.score * 100),
      metrics: {},
      issues: [],
      recommendations: []
    }

    // Analyze Core Web Vitals and other metrics
    Object.entries(PERFORMANCE_THRESHOLDS).forEach(([metric, config]) => {
      const audit = audits[metric]
      if (audit && audit.numericValue !== undefined) {
        const value = audit.numericValue
        const displayValue = audit.displayValue
        const passed = this.checkThreshold(value, config.threshold, metric)
        
        analysis.metrics[metric] = {
          value,
          displayValue,
          threshold: config.threshold,
          unit: config.unit,
          passed,
          critical: config.critical
        }

        if (!passed) {
          analysis.issues.push({
            metric,
            severity: config.critical ? 'critical' : 'warning',
            message: `${metric}: ${displayValue} exceeds threshold of ${config.threshold}${config.unit}`
          })
        }
      }
    })

    // Add specific recommendations
    this.addRecommendations(analysis, audits)

    return analysis
  }

  checkThreshold(value, threshold, metric) {
    // Convert values to comparable units
    switch (metric) {
      case 'largest-contentful-paint':
      case 'first-contentful-paint':
      case 'speed-index':
      case 'time-to-interactive':
        return (value / 1000) <= threshold // Convert ms to seconds
      case 'server-response-time':
      case 'total-blocking-time':
      case 'first-input-delay':
        return value <= threshold // Already in ms
      case 'cumulative-layout-shift':
        return value <= threshold // Score-based
      case 'dom-size':
        return value <= threshold // Element count
      case 'unused-css-rules':
        return (value / 1024) <= threshold // Convert bytes to KB
      default:
        return value <= threshold
    }
  }

  addRecommendations(analysis, audits) {
    const recommendations = []

    // Image optimization
    if (audits['unused-images'] && audits['unused-images'].score < 1) {
      recommendations.push('🖼️ Optimize unused images or implement lazy loading')
    }

    // JavaScript optimization
    if (audits['unused-javascript'] && audits['unused-javascript'].score < 0.9) {
      recommendations.push('📦 Remove unused JavaScript code or implement code splitting')
    }

    // CSS optimization
    if (audits['unused-css-rules'] && audits['unused-css-rules'].score < 0.9) {
      recommendations.push('🎨 Remove unused CSS rules or implement critical CSS')
    }

    // Render blocking resources
    if (audits['render-blocking-resources'] && audits['render-blocking-resources'].score < 1) {
      recommendations.push('⚡ Eliminate render-blocking resources')
    }

    // Font optimization
    if (audits['font-display'] && audits['font-display'].score < 1) {
      recommendations.push('🔤 Optimize font loading with font-display: swap')
    }

    // Caching
    if (audits['uses-long-cache-ttl'] && audits['uses-long-cache-ttl'].score < 0.9) {
      recommendations.push('📂 Implement better caching strategies')
    }

    analysis.recommendations = recommendations
  }

  generateReport(analyses) {
    console.log('\n' + '='.repeat(80))
    console.log('🏆 ZENYA AI - GOD-TIER PERFORMANCE REPORT')
    console.log('='.repeat(80))

    let allPassed = true
    let criticalIssues = 0
    let warnings = 0

    analyses.forEach(analysis => {
      if (!analysis) return

      console.log(`\n📊 ${analysis.name}`)
      console.log(`   URL: ${analysis.url}`)
      console.log(`   Performance Score: ${analysis.score}/100 ${analysis.score >= 90 ? '🟢' : analysis.score >= 70 ? '🟡' : '🔴'}`)
      
      // Core Web Vitals summary
      console.log('\n   Core Web Vitals:')
      const coreMetrics = ['largest-contentful-paint', 'first-input-delay', 'cumulative-layout-shift']
      coreMetrics.forEach(metric => {
        const data = analysis.metrics[metric]
        if (data) {
          const status = data.passed ? '✅' : '❌'
          console.log(`   ${status} ${metric.toUpperCase()}: ${data.displayValue} (limit: ${data.threshold}${data.unit})`)
          if (!data.passed && data.critical) {
            criticalIssues++
            allPassed = false
          }
        }
      })

      // Issues
      if (analysis.issues.length > 0) {
        console.log('\n   ⚠️  Issues:')
        analysis.issues.forEach(issue => {
          const icon = issue.severity === 'critical' ? '🚨' : '⚠️'
          console.log(`   ${icon} ${issue.message}`)
          if (issue.severity === 'critical') {
            criticalIssues++
            allPassed = false
          } else {
            warnings++
          }
        })
      }

      // Recommendations
      if (analysis.recommendations.length > 0) {
        console.log('\n   💡 Recommendations:')
        analysis.recommendations.forEach(rec => {
          console.log(`   ${rec}`)
        })
      }
    })

    // Overall summary
    console.log('\n' + '='.repeat(80))
    console.log('📈 OVERALL PERFORMANCE SUMMARY')
    console.log('='.repeat(80))
    
    if (allPassed && criticalIssues === 0) {
      console.log('🎉 CONGRATULATIONS! God-Tier performance achieved!')
      console.log('✨ All Core Web Vitals and performance thresholds met')
    } else {
      console.log(`❌ Performance issues detected:`)
      console.log(`   🚨 Critical issues: ${criticalIssues}`)
      console.log(`   ⚠️  Warnings: ${warnings}`)
      console.log('\n🎯 Focus on critical issues first to achieve God-Tier status')
    }

    return allPassed && criticalIssues === 0
  }

  async saveDetailedReport(analyses) {
    const reportDir = path.join(process.cwd(), 'lighthouse-reports')
    await fs.mkdir(reportDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportPath = path.join(reportDir, `performance-report-${timestamp}.json`)

    const detailedReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPages: analyses.length,
        passedPages: analyses.filter(a => a && a.score >= 90).length,
        averageScore: analyses.reduce((sum, a) => sum + (a?.score || 0), 0) / analyses.length
      },
      analyses: analyses.filter(a => a),
      thresholds: PERFORMANCE_THRESHOLDS
    }

    await fs.writeFile(reportPath, JSON.stringify(detailedReport, null, 2))
    console.log(`\n📄 Detailed report saved: ${reportPath}`)
  }

  async cleanup() {
    if (this.chrome) {
      await this.chrome.kill()
    }
  }

  async run() {
    try {
      await this.initialize()
      
      console.log('🔍 Running comprehensive performance analysis...')
      console.log(`📝 Testing ${TEST_URLS.length} pages against God-Tier standards\n`)

      const analyses = []
      
      for (const { url, name } of TEST_URLS) {
        const result = await this.runLighthouse(url, name)
        const analysis = this.analyzeResult(result)
        analyses.push(analysis)
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const allPassed = this.generateReport(analyses)
      await this.saveDetailedReport(analyses)

      // Exit with appropriate code
      process.exit(allPassed ? 0 : 1)
      
    } catch (error) {
      console.error('💥 Performance analysis failed:', error)
      process.exit(1)
    } finally {
      await this.cleanup()
    }
  }
}

// Run if called directly
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer()
  analyzer.run().catch(console.error)
}

module.exports = PerformanceAnalyzer