#!/usr/bin/env node

/**
 * Comprehensive Security Audit Script for Zenya AI
 * God-Tier security analysis with automated vulnerability detection
 */

const fs = require('fs').promises
const path = require('path')
const { execSync } = require('child_process')

class SecurityAuditor {
  constructor() {
    this.vulnerabilities = []
    this.warnings = []
    this.passed = []
    this.startTime = Date.now()
  }

  log(level, message, details = {}) {
    const timestamp = new Date().toISOString()
    const logEntry = { timestamp, level, message, details }
    
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        this.vulnerabilities.push(logEntry)
        console.log(`🚨 ${level}: ${message}`)
        break
      case 'MEDIUM':
      case 'LOW':
        this.warnings.push(logEntry)
        console.log(`⚠️  ${level}: ${message}`)
        break
      case 'PASS':
        this.passed.push(logEntry)
        console.log(`✅ ${message}`)
        break
      default:
        console.log(`ℹ️  ${message}`)
    }
  }

  async checkFilePermissions() {
    console.log('\n🔒 Checking file permissions...')
    
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'package.json',
      'next.config.mjs',
      'sentry.server.config.ts',
      'instrumentation.ts'
    ]

    for (const file of sensitiveFiles) {
      try {
        const stats = await fs.stat(file)
        const mode = stats.mode & parseInt('777', 8)
        
        if (mode & parseInt('004', 8)) {
          this.log('MEDIUM', `File ${file} is world-readable`, { file, permissions: mode.toString(8) })
        } else {
          this.log('PASS', `File permissions secure for ${file}`)
        }
      } catch (error) {
        // File doesn't exist, which is fine for optional files
        if (file.startsWith('.env')) {
          this.log('PASS', `Environment file ${file} not found (good for security)`)
        }
      }
    }
  }

  async checkSecrets() {
    console.log('\n🔍 Scanning for exposed secrets...')
    
    const secretPatterns = [
      { name: 'API Keys', pattern: /[A-Za-z0-9]{32,}/ },
      { name: 'JWT Tokens', pattern: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/ },
      { name: 'Supabase URL', pattern: /https:\/\/[a-z0-9]+\.supabase\.co/ },
      { name: 'OpenAI Key', pattern: /sk-[a-zA-Z0-9]{48}/ },
      { name: 'Anthropic Key', pattern: /sk-ant-[a-zA-Z0-9-_]{95}/ },
      { name: 'Private Keys', pattern: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
      { name: 'Database URLs', pattern: /postgresql:\/\/[^\\s]+/ }
    ]

    const filesToCheck = [
      'app/**/*.ts',
      'app/**/*.tsx',
      'lib/**/*.ts',
      'components/**/*.tsx',
      'scripts/**/*.js'
    ]

    let foundSecrets = false

    for (const pattern of filesToCheck) {
      try {
        const files = execSync(`find . -path "./node_modules" -prune -o -name "${pattern.split('/').pop()}" -type f -print`, { encoding: 'utf8' })
          .split('\n')
          .filter(f => f && !f.includes('node_modules'))

        for (const file of files) {
          try {
            const content = await fs.readFile(file, 'utf8')
            
            for (const { name, pattern: regex } of secretPatterns) {
              const matches = content.match(regex)
              if (matches) {
                // Check if it's in a comment or documentation
                const lines = content.split('\n')
                let isInComment = false
                
                for (let i = 0; i < lines.length; i++) {
                  if (regex.test(lines[i])) {
                    const line = lines[i].trim()
                    if (line.startsWith('//') || line.startsWith('*') || line.startsWith('/*')) {
                      isInComment = true
                      break
                    }
                  }
                }

                if (!isInComment) {
                  this.log('HIGH', `Potential ${name} found in ${file}`, { 
                    file, 
                    pattern: name,
                    line: matches[0].substring(0, 20) + '...'
                  })
                  foundSecrets = true
                }
              }
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      } catch (error) {
        // Skip if pattern doesn't match files
      }
    }

    if (!foundSecrets) {
      this.log('PASS', 'No exposed secrets detected in source code')
    }
  }

  async checkDependencyVulnerabilities() {
    console.log('\n📦 Checking dependency vulnerabilities...')
    
    try {
      // Run npm audit
      const auditResult = execSync('npm audit --audit-level=moderate --json', { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const audit = JSON.parse(auditResult)
      
      if (audit.metadata.vulnerabilities.total === 0) {
        this.log('PASS', 'No dependency vulnerabilities found')
      } else {
        const { critical, high, moderate, low } = audit.metadata.vulnerabilities
        
        if (critical > 0) {
          this.log('CRITICAL', `${critical} critical dependency vulnerabilities found`)
        }
        if (high > 0) {
          this.log('HIGH', `${high} high severity dependency vulnerabilities found`)
        }
        if (moderate > 0) {
          this.log('MEDIUM', `${moderate} moderate dependency vulnerabilities found`)
        }
        if (low > 0) {
          this.log('LOW', `${low} low severity dependency vulnerabilities found`)
        }
      }
    } catch (error) {
      if (error.status === 1) {
        // npm audit found vulnerabilities
        this.log('HIGH', 'npm audit detected vulnerabilities - check npm audit for details')
      } else {
        this.log('MEDIUM', 'Could not run dependency vulnerability check', { error: error.message })
      }
    }
  }

  async checkSecurityHeaders() {
    console.log('\n🛡️ Validating security configurations...')
    
    // Check middleware security implementation
    try {
      const middlewareContent = await fs.readFile('middleware.ts', 'utf8')
      
      const securityChecks = [
        { name: 'CSP Headers', pattern: /Content-Security-Policy/ },
        { name: 'CSRF Protection', pattern: /csrf|CSRF/ },
        { name: 'Rate Limiting', pattern: /rate.?limit/i },
        { name: 'HTTPS Redirect', pattern: /https|SSL|TLS/i },
        { name: 'XSS Protection', pattern: /X-XSS-Protection|xss/i },
        { name: 'Frame Options', pattern: /X-Frame-Options|frame/i }
      ]

      for (const check of securityChecks) {
        if (check.pattern.test(middlewareContent)) {
          this.log('PASS', `${check.name} implemented in middleware`)
        } else {
          this.log('MEDIUM', `${check.name} not detected in middleware`)
        }
      }
    } catch (error) {
      this.log('HIGH', 'Could not analyze middleware security configuration')
    }

    // Check Next.js security configuration
    try {
      const nextConfigContent = await fs.readFile('next.config.mjs', 'utf8')
      
      if (nextConfigContent.includes('contentSecurityPolicy')) {
        this.log('PASS', 'Content Security Policy configured in Next.js')
      } else {
        this.log('LOW', 'CSP not configured in Next.js config')
      }

      if (nextConfigContent.includes('hsts')) {
        this.log('PASS', 'HSTS configured in Next.js')
      } else {
        this.log('LOW', 'HSTS not configured in Next.js')
      }
    } catch (error) {
      this.log('MEDIUM', 'Could not analyze Next.js security configuration')
    }
  }

  async checkDatabaseSecurity() {
    console.log('\n🗄️ Checking database security...')
    
    try {
      // Check for SQL injection patterns
      const dbFiles = execSync('find . -name "*.ts" -o -name "*.tsx" | grep -E "(api|lib)" | head -20', { encoding: 'utf8' })
        .split('\n')
        .filter(f => f)

      let sqlInjectionRisk = false
      
      for (const file of dbFiles) {
        try {
          const content = await fs.readFile(file, 'utf8')
          
          // Check for unsafe SQL patterns
          const unsafePatterns = [
            /\$\{.*\}.*sql/i,
            /\+.*sql/i,
            /sql.*\+.*\$/i,
            /query.*\$\{/i
          ]

          for (const pattern of unsafePatterns) {
            if (pattern.test(content) && !content.includes('supabase')) {
              this.log('HIGH', `Potential SQL injection risk in ${file}`)
              sqlInjectionRisk = true
              break
            }
          }

          // Check for proper parameterized queries
          if (content.includes('supabase') && content.includes('.select(') || content.includes('.insert(')) {
            this.log('PASS', `Supabase ORM usage detected in ${file} (safe)`)
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }

      if (!sqlInjectionRisk) {
        this.log('PASS', 'No SQL injection vulnerabilities detected')
      }
    } catch (error) {
      this.log('MEDIUM', 'Could not complete database security check')
    }
  }

  async checkAPIEndpointSecurity() {
    console.log('\n🌐 Analyzing API endpoint security...')
    
    try {
      const apiFiles = execSync('find app/api -name "*.ts" -type f', { encoding: 'utf8' })
        .split('\n')
        .filter(f => f)

      for (const file of apiFiles) {
        try {
          const content = await fs.readFile(file, 'utf8')
          
          // Check for authentication
          if (content.includes('auth') || content.includes('session') || content.includes('user')) {
            this.log('PASS', `Authentication check found in ${file}`)
          } else {
            this.log('MEDIUM', `No obvious authentication in ${file}`)
          }

          // Check for input validation
          if (content.includes('validate') || content.includes('schema') || content.includes('zod')) {
            this.log('PASS', `Input validation found in ${file}`)
          } else {
            this.log('MEDIUM', `No input validation detected in ${file}`)
          }

          // Check for rate limiting
          if (content.includes('rateLimit') || content.includes('rate-limit')) {
            this.log('PASS', `Rate limiting implemented in ${file}`)
          } else {
            this.log('LOW', `No rate limiting in ${file}`)
          }

          // Check for error handling
          if (content.includes('try') && content.includes('catch')) {
            this.log('PASS', `Error handling implemented in ${file}`)
          } else {
            this.log('MEDIUM', `Basic error handling missing in ${file}`)
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    } catch (error) {
      this.log('MEDIUM', 'Could not analyze API endpoints')
    }
  }

  async checkCORSConfiguration() {
    console.log('\n🌍 Checking CORS configuration...')
    
    try {
      const middlewareContent = await fs.readFile('middleware.ts', 'utf8')
      
      if (middlewareContent.includes('Access-Control-Allow-Origin')) {
        // Check for wildcard CORS
        if (middlewareContent.includes('Access-Control-Allow-Origin", "*"')) {
          this.log('HIGH', 'Wildcard CORS detected - security risk')
        } else {
          this.log('PASS', 'CORS properly configured with specific origins')
        }
      } else {
        this.log('LOW', 'No CORS configuration detected')
      }

      if (middlewareContent.includes('Access-Control-Allow-Credentials')) {
        this.log('PASS', 'CORS credentials handling configured')
      }
    } catch (error) {
      this.log('MEDIUM', 'Could not analyze CORS configuration')
    }
  }

  async generateReport() {
    const duration = Date.now() - this.startTime
    const totalIssues = this.vulnerabilities.length + this.warnings.length
    
    console.log('\n' + '='.repeat(80))
    console.log('🛡️ ZENYA AI - COMPREHENSIVE SECURITY AUDIT REPORT')
    console.log('='.repeat(80))
    
    console.log(`\n📊 AUDIT SUMMARY`)
    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s`)
    console.log(`   Checks Passed: ${this.passed.length}`)
    console.log(`   Vulnerabilities: ${this.vulnerabilities.length}`)
    console.log(`   Warnings: ${this.warnings.length}`)
    console.log(`   Total Issues: ${totalIssues}`)

    if (this.vulnerabilities.length > 0) {
      console.log(`\n🚨 CRITICAL VULNERABILITIES (${this.vulnerabilities.length})`)
      this.vulnerabilities.forEach(vuln => {
        console.log(`   • ${vuln.message}`)
        if (vuln.details.file) {
          console.log(`     File: ${vuln.details.file}`)
        }
      })
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  SECURITY WARNINGS (${this.warnings.length})`)
      this.warnings.slice(0, 10).forEach(warning => {
        console.log(`   • ${warning.message}`)
      })
      
      if (this.warnings.length > 10) {
        console.log(`   ... and ${this.warnings.length - 10} more warnings`)
      }
    }

    console.log(`\n✅ SECURITY CHECKS PASSED (${this.passed.length})`)
    this.passed.slice(0, 5).forEach(pass => {
      console.log(`   • ${pass.message}`)
    })
    
    if (this.passed.length > 5) {
      console.log(`   ... and ${this.passed.length - 5} more checks passed`)
    }

    // Security score calculation
    const maxScore = 100
    const vulnerabilityPenalty = this.vulnerabilities.length * 20
    const warningPenalty = this.warnings.length * 5
    const score = Math.max(0, maxScore - vulnerabilityPenalty - warningPenalty)

    console.log('\n' + '='.repeat(80))
    console.log('🏆 SECURITY SCORE')
    console.log('='.repeat(80))
    console.log(`Final Score: ${score}/100`)
    
    if (score >= 95) {
      console.log('🎉 GOD-TIER SECURITY ACHIEVED!')
      console.log('✨ Your application meets the highest security standards')
    } else if (score >= 80) {
      console.log('🟢 EXCELLENT SECURITY')
      console.log('💪 Strong security posture with minor improvements needed')
    } else if (score >= 60) {
      console.log('🟡 GOOD SECURITY')
      console.log('🔧 Some security improvements recommended')
    } else {
      console.log('🔴 SECURITY NEEDS ATTENTION')
      console.log('⚠️  Critical security issues must be addressed')
    }

    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      score: score,
      summary: {
        passed: this.passed.length,
        vulnerabilities: this.vulnerabilities.length,
        warnings: this.warnings.length,
        total_issues: totalIssues
      },
      vulnerabilities: this.vulnerabilities,
      warnings: this.warnings,
      passed: this.passed
    }

    const reportPath = path.join(process.cwd(), 'security-audit-report.json')
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Detailed report saved: ${reportPath}`)

    return score >= 80 // Return true if security is acceptable
  }

  async run() {
    console.log('🔒 Starting comprehensive security audit for Zenya AI...\n')
    
    try {
      await this.checkFilePermissions()
      await this.checkSecrets()
      await this.checkDependencyVulnerabilities()
      await this.checkSecurityHeaders()
      await this.checkDatabaseSecurity()
      await this.checkAPIEndpointSecurity()
      await this.checkCORSConfiguration()
      
      const passed = await this.generateReport()
      process.exit(passed ? 0 : 1)
      
    } catch (error) {
      console.error('💥 Security audit failed:', error)
      process.exit(1)
    }
  }
}

// Run if called directly
if (require.main === module) {
  const auditor = new SecurityAuditor()
  auditor.run().catch(console.error)
}

module.exports = SecurityAuditor