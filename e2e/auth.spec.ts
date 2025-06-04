import { test, expect, TestHelpers } from './fixtures/test-fixtures'

test.describe('Authentication', () => {
  test('should show landing page for unauthenticated users', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/landing')
    await expect(page.getByRole('heading', { name: 'AI Learning Designed for Your Mind' })).toBeVisible()
  })

  test('should allow user registration', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    await page.goto('/auth/register')
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    
    // Fill registration form
    const timestamp = Date.now()
    await page.getByLabel('Name').fill(`Test User ${timestamp}`)
    await page.getByLabel('Email').fill(`test${timestamp}@example.com`)
    await page.getByLabel('Password').fill('TestPassword123!')
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    // Should redirect to confirmation page
    await expect(page).toHaveURL('/auth/confirm')
    await helpers.waitForToast('Please check your email to confirm your account')
  })

  test('should allow user sign in', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    await page.goto('/auth/signin')
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    
    // Fill sign in form
    await page.getByLabel('Email').fill('demo@zenyaai.com')
    await page.getByLabel('Password').fill('demo123456')
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should redirect to learn page
    await expect(page).toHaveURL('/learn')
    await expect(page.getByRole('heading', { name: 'Choose Your Learning Path' })).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    await page.goto('/auth/signin')
    
    // Fill with invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Should show error
    await helpers.waitForToast('Invalid email or password')
    await expect(page).toHaveURL('/auth/signin')
  })

  test('should allow password reset', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Click forgot password
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    
    // Should show password reset form
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible()
    
    // Fill email
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByRole('button', { name: 'Send Reset Link' }).click()
    
    // Should show confirmation
    await expect(page.getByText('Check your email for a password reset link')).toBeVisible()
  })

  test('should protect authenticated routes', async ({ page }) => {
    // Try to access protected route
    await page.goto('/learn')
    
    // Should redirect to landing
    await expect(page).toHaveURL('/landing')
  })

  test('should allow sign out', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    // Sign in first
    await helpers.signIn({ email: 'demo@zenyaai.com', password: 'demo123456', name: 'Demo User' })
    
    // Sign out
    await page.getByRole('button', { name: 'Profile' }).click()
    await page.getByRole('button', { name: 'Sign Out' }).click()
    
    // Should redirect to landing
    await expect(page).toHaveURL('/landing')
    
    // Try to access protected route
    await page.goto('/learn')
    await expect(page).toHaveURL('/landing')
  })

  test('should handle OAuth sign in', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Check OAuth buttons exist
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue with GitHub' })).toBeVisible()
  })

  test('should validate registration form', async ({ page }) => {
    await page.goto('/auth/register')
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    // Check validation messages
    await expect(page.getByText('Name is required')).toBeVisible()
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
    
    // Test invalid email
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByText('Invalid email address')).toBeVisible()
    
    // Test weak password
    await page.getByLabel('Password').fill('weak')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should handle session expiry', async ({ page, context }) => {
    const helpers = new TestHelpers(page)
    
    // Sign in
    await helpers.signIn({ email: 'demo@zenyaai.com', password: 'demo123456', name: 'Demo User' })
    
    // Clear session storage to simulate expiry
    await context.clearCookies()
    
    // Try to navigate
    await page.goto('/learn')
    
    // Should redirect to landing
    await expect(page).toHaveURL('/landing')
  })
})