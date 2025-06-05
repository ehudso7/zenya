import { test as base, expect, Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Test user credentials
export const TEST_USERS = {
  regular: {
    email: 'test.user@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
  },
  premium: {
    email: 'premium.user@example.com',
    password: 'PremiumPassword123!',
    name: 'Premium User',
  },
  admin: {
    email: 'admin@zenyaai.com',
    password: 'AdminPassword123!',
    name: 'Admin User',
  },
}

// Custom test fixtures
export type TestFixtures = {
  authenticatedPage: any
  testUser: typeof TEST_USERS.regular
  supabase: SupabaseClient
}

export const test = base.extend<TestFixtures>({
  // Authenticated page fixture
  authenticatedPage: async ({ page }: { page: Page }, use: (page: Page) => Promise<void>) => {
    // Sign in before each test
    await page.goto('/auth/signin')
    await page.getByLabel('Email').fill(TEST_USERS.regular.email)
    await page.getByLabel('Password').fill(TEST_USERS.regular.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Wait for redirect
    await page.waitForURL('/learn')
    
    // Use the authenticated page
    await use(page)
    
    // Sign out after test
    await page.getByRole('button', { name: 'Profile' }).click()
    await page.getByRole('button', { name: 'Sign Out' }).click()
  },
  
  // Test user fixture
  testUser: async ({}, use) => {
    await use(TEST_USERS.regular)
  },
  
  // Supabase client fixture
  supabase: async ({}, use) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    await use(supabase)
  },
})

export { expect }

// Test helpers
export class TestHelpers {
  constructor(private page: any) {}
  
  async signIn(user = TEST_USERS.regular) {
    await this.page.goto('/auth/signin')
    await this.page.getByLabel('Email').fill(user.email)
    await this.page.getByLabel('Password').fill(user.password)
    await this.page.getByRole('button', { name: 'Sign In' }).click()
    await this.page.waitForURL('/learn')
  }
  
  async signOut() {
    await this.page.getByRole('button', { name: 'Profile' }).click()
    await this.page.getByRole('button', { name: 'Sign Out' }).click()
    await this.page.waitForURL('/landing')
  }
  
  async waitForToast(message: string) {
    await this.page.getByText(message).waitFor({ state: 'visible' })
  }
  
  async dismissToast() {
    const toast = this.page.locator('[role="status"]').first()
    if (await toast.isVisible()) {
      await toast.click()
    }
  }
  
  async checkAccessibility() {
    const accessibilityScanResults = await this.page.accessibility.snapshot()
    expect(accessibilityScanResults).toBeTruthy()
  }
  
  async mockAIResponse(response: string) {
    await this.page.route('**/api/ai', async (route: any) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: response,
          usage: { tokens: 100 },
        }),
      })
    })
  }
  
  async waitForLoadingComplete() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForTimeout(100) // Small buffer for animations
  }
}

// Page object models
export class LandingPage {
  constructor(private page: any) {}
  
  async goto() {
    await this.page.goto('/landing')
  }
  
  async clickGetStarted() {
    await this.page.getByRole('link', { name: 'Get Started' }).click()
  }
  
  async clickSignIn() {
    await this.page.getByRole('link', { name: 'Sign In' }).click()
  }
}

export class LearnPage {
  constructor(private page: any) {}
  
  async goto() {
    await this.page.goto('/learn')
  }
  
  async selectCurriculum(name: string) {
    await this.page.getByRole('button', { name }).click()
  }
  
  async startLesson() {
    await this.page.getByRole('button', { name: 'Start Learning' }).click()
  }
  
  async sendMessage(message: string) {
    await this.page.getByPlaceholder('Type your message...').fill(message)
    await this.page.getByRole('button', { name: 'Send' }).click()
  }
  
  async waitForAIResponse() {
    await this.page.getByTestId('ai-response').waitFor({ state: 'visible' })
  }
  
  async completeLesson() {
    await this.page.getByRole('button', { name: 'Complete Lesson' }).click()
  }
}