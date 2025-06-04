import { test, expect, TestHelpers, LearnPage } from './fixtures/test-fixtures'

test.describe('Learning Experience', () => {
  test.beforeEach(async ({ page }) => {
    const helpers = new TestHelpers(page)
    await helpers.signIn({ email: 'demo@zenyaai.com', password: 'demo123456', name: 'Demo User' })
  })

  test('should display curriculum selection', async ({ page }) => {
    const learnPage = new LearnPage(page)
    await learnPage.goto()
    
    // Check curriculum cards are visible
    await expect(page.getByRole('heading', { name: 'Choose Your Learning Path' })).toBeVisible()
    await expect(page.getByText('Web Development Basics')).toBeVisible()
    await expect(page.getByText('JavaScript Fundamentals')).toBeVisible()
    await expect(page.getByText('React Essentials')).toBeVisible()
  })

  test('should start a lesson', async ({ page }) => {
    const learnPage = new LearnPage(page)
    const helpers = new TestHelpers(page)
    
    await learnPage.goto()
    await learnPage.selectCurriculum('Web Development Basics')
    
    // Check lesson view
    await expect(page.getByRole('heading', { name: 'Introduction to HTML' })).toBeVisible()
    await expect(page.getByText('Let\'s learn the basics of HTML')).toBeVisible()
    
    // Mock AI response
    await helpers.mockAIResponse('HTML stands for HyperText Markup Language...')
    
    // Start learning
    await learnPage.startLesson()
    
    // Check chat interface
    await expect(page.getByPlaceholder('Type your message...')).toBeVisible()
    await expect(page.getByTestId('ai-response')).toBeVisible()
  })

  test('should interact with AI tutor', async ({ page }) => {
    const learnPage = new LearnPage(page)
    const helpers = new TestHelpers(page)
    
    await learnPage.goto()
    await learnPage.selectCurriculum('Web Development Basics')
    await learnPage.startLesson()
    
    // Mock AI response
    await helpers.mockAIResponse('Great question! Let me explain...')
    
    // Send a message
    await learnPage.sendMessage('What is an HTML tag?')
    
    // Check response appears
    await learnPage.waitForAIResponse()
    await expect(page.getByText('Great question! Let me explain...')).toBeVisible()
  })

  test('should track lesson progress', async ({ page }) => {
    const learnPage = new LearnPage(page)
    
    await learnPage.goto()
    await learnPage.selectCurriculum('Web Development Basics')
    
    // Check progress bar
    const progressBar = page.getByRole('progressbar')
    await expect(progressBar).toBeVisible()
    await expect(progressBar).toHaveAttribute('aria-valuenow', '0')
    
    // Start lesson
    await learnPage.startLesson()
    
    // Progress should update
    await expect(progressBar).toHaveAttribute('aria-valuenow', '25')
  })

  test('should handle simplify mode', async ({ page }) => {
    const learnPage = new LearnPage(page)
    const helpers = new TestHelpers(page)
    
    await learnPage.goto()
    await learnPage.selectCurriculum('JavaScript Fundamentals')
    await learnPage.startLesson()
    
    // Mock complex response
    await helpers.mockAIResponse('Functions are first-class citizens in JavaScript...')
    await learnPage.sendMessage('Explain functions')
    await learnPage.waitForAIResponse()
    
    // Click simplify
    await page.getByRole('button', { name: 'Simplify' }).click()
    
    // Mock simplified response
    await helpers.mockAIResponse('Functions are like recipes. They take ingredients...')
    
    // Check simplified response
    await expect(page.getByText('Functions are like recipes')).toBeVisible()
  })

  test('should complete a lesson', async ({ page }) => {
    const learnPage = new LearnPage(page)
    const helpers = new TestHelpers(page)
    
    await learnPage.goto()
    await learnPage.selectCurriculum('Web Development Basics')
    await learnPage.startLesson()
    
    // Complete interactions
    await helpers.mockAIResponse('You\'re doing great!')
    await learnPage.sendMessage('I understand now')
    
    // Complete lesson
    await learnPage.completeLesson()
    
    // Check celebration
    await expect(page.getByText('Lesson Complete!')).toBeVisible()
    await expect(page.getByText('+50 XP')).toBeVisible()
    
    // Should show next lesson
    await expect(page.getByRole('button', { name: 'Next Lesson' })).toBeVisible()
  })

  test('should handle mood selection', async ({ page }) => {
    await page.goto('/learn')
    
    // Check mood selector
    await expect(page.getByText('How are you feeling today?')).toBeVisible()
    
    // Select low energy mood
    await page.getByRole('button', { name: '😴 Low Energy' }).click()
    
    // Check gentle mode indicator
    await expect(page.getByText('Gentle pace mode')).toBeVisible()
  })

  test('should show streak counter', async ({ page }) => {
    await page.goto('/learn')
    
    // Check streak display
    const streakElement = page.getByTestId('streak-counter')
    await expect(streakElement).toBeVisible()
    await expect(streakElement).toContainText('day streak')
  })

  test('should handle lesson navigation', async ({ page }) => {
    const learnPage = new LearnPage(page)
    
    await learnPage.goto()
    await learnPage.selectCurriculum('React Essentials')
    
    // Check lesson list
    await expect(page.getByText('Introduction to React')).toBeVisible()
    await expect(page.getByText('Components and Props')).toBeVisible()
    await expect(page.getByText('State and Lifecycle')).toBeVisible()
    
    // Navigate between lessons
    await page.getByText('Components and Props').click()
    await expect(page.getByRole('heading', { name: 'Components and Props' })).toBeVisible()
    
    // Go back
    await page.getByRole('button', { name: 'Back' }).click()
    await expect(page.getByRole('heading', { name: 'React Essentials' })).toBeVisible()
  })

  test('should save lesson progress', async ({ page }) => {
    const learnPage = new LearnPage(page)
    const helpers = new TestHelpers(page)
    
    await learnPage.goto()
    await learnPage.selectCurriculum('Web Development Basics')
    await learnPage.startLesson()
    
    // Interact with lesson
    await helpers.mockAIResponse('Great progress!')
    await learnPage.sendMessage('Test message')
    
    // Refresh page
    await page.reload()
    
    // Progress should be saved
    await expect(page.getByText('Continue Learning')).toBeVisible()
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25')
  })

  test('should handle errors gracefully', async ({ page }) => {
    const learnPage = new LearnPage(page)
    
    await learnPage.goto()
    await learnPage.selectCurriculum('Web Development Basics')
    await learnPage.startLesson()
    
    // Mock API error
    await page.route('**/api/ai', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      })
    })
    
    // Send message
    await learnPage.sendMessage('Test message')
    
    // Should show error
    await expect(page.getByText('Failed to get AI response')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  })
})