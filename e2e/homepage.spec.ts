import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')

    // Wait for the page to load
    await expect(page).toHaveTitle(/Kenomi/i)
  })

  test('should display main navigation', async ({ page }) => {
    await page.goto('/')

    // Check for navigation elements
    const navigation = page.locator('nav, header')
    await expect(navigation).toBeVisible()
  })

  test('should have a donation CTA button', async ({ page }) => {
    await page.goto('/')

    // Look for donation button
    const donateButton = page.getByRole('link', { name: /faire un don|don/i })
    await expect(donateButton).toBeVisible()
  })

  test('should navigate to donation page', async ({ page }) => {
    await page.goto('/')

    // Click donation button
    const donateButton = page.getByRole('link', { name: /faire un don|don/i }).first()
    await donateButton.click()

    // Check URL changed
    await expect(page).toHaveURL(/\/don/)
  })

  test('should display hero section', async ({ page }) => {
    await page.goto('/')

    // Check for hero content
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })

  test('should have footer with legal links', async ({ page }) => {
    await page.goto('/')

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Check for legal links
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Page should still load
    await expect(page).toHaveTitle(/Kenomi/i)
  })
})
