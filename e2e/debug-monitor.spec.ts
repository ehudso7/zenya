import { test, expect } from '@playwright/test'

test.describe('Debug Monitor - Production Grade Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start with debug monitor
    await page.goto('/debug/monitor')
    await expect(page.locator('text=Debug Monitor')).toBeVisible()
  })

  test('should connect and display session ID', async ({ page }) => {
    // Wait for connection
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 10000 })
    
    // Session ID should be displayed
    const sessionText = await page.locator('text=/Session: debug-.*/')
    await expect(sessionText).toBeVisible()
  })

  test('should receive and display logs from test page', async ({ page, context }) => {
    // Open test page in new tab
    const testPage = await context.newPage()
    await testPage.goto('/debug/test')
    
    // Enable debug
    await testPage.click('text=Enable Debug')
    await expect(testPage.locator('text=Debug ENABLED')).toBeVisible()
    
    // Send test log
    await testPage.click('text=Test Log')
    
    // Check monitor received the log
    await page.bringToFront()
    await expect(page.locator('text=Test log message')).toBeVisible({ timeout: 5000 })
  })

  test('should capture API errors', async ({ page, context }) => {
    // Open test page
    const testPage = await context.newPage()
    await testPage.goto('/debug/test')
    
    // Trigger 500 error
    await testPage.click('text=Test 500 Error')
    
    // Check monitor shows error
    await page.bringToFront()
    await expect(page.locator('text=API Error')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=500')).toBeVisible()
  })

  test('should handle circular references without crashing', async ({ page, context }) => {
    // Open test page
    const testPage = await context.newPage()
    await testPage.goto('/debug/test')
    
    // Enable debug and send error (which previously caused stack overflow)
    await testPage.click('text=Enable Debug')
    await testPage.click('text=Test Error')
    
    // Monitor should still be responsive
    await page.bringToFront()
    await expect(page.locator('text=Test error message')).toBeVisible({ timeout: 5000 })
    
    // UI controls should still work
    await page.click('text=Pause')
    await expect(page.locator('text=Logging paused')).toBeVisible()
  })

  test('should filter logs correctly', async ({ page, context }) => {
    // Generate different types of logs
    const testPage = await context.newPage()
    await testPage.goto('/debug/test')
    await testPage.click('text=Enable Debug')
    
    // Send various log types
    await testPage.click('text=Test Log')
    await testPage.click('text=Test Error')
    await testPage.click('text=Test API Call')
    
    // Test filtering in monitor
    await page.bringToFront()
    
    // Filter by error
    await page.click('button:has-text("error")')
    await expect(page.locator('text=Test error message')).toBeVisible()
    await expect(page.locator('text=Test log message')).not.toBeVisible()
    
    // Show all
    await page.click('button:has-text("all")')
    await expect(page.locator('text=Test log message')).toBeVisible()
  })

  test('should export logs as valid JSON', async ({ page, context }) => {
    // Generate some logs
    const testPage = await context.newPage()
    await testPage.goto('/debug/test')
    await testPage.click('text=Enable Debug')
    await testPage.click('text=Test Log')
    
    // Download logs
    await page.bringToFront()
    const downloadPromise = page.waitForEvent('download')
    await page.click('[aria-label="Download"]')
    const download = await downloadPromise
    
    // Verify download
    const content = await download.textContent()
    expect(() => JSON.parse(content)).not.toThrow()
  })

  test('should maintain performance with many logs', async ({ page, context }) => {
    const testPage = await context.newPage()
    await testPage.goto('/debug/test-stream')
    
    // Send 100 logs rapidly
    for (let i = 0; i < 100; i++) {
      await testPage.click('text=Send Log')
      await page.waitForTimeout(10) // Small delay
    }
    
    // Monitor should still be responsive
    await page.bringToFront()
    await page.click('text=Pause')
    await expect(page.locator('text=Logging paused')).toBeVisible()
    
    // Clear should work
    await page.click('[aria-label="Clear"]')
    await expect(page.locator('text=No logs yet')).toBeVisible()
  })
})