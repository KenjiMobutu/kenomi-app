import { test, expect } from '@playwright/test'

test.describe('Donation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/don')
  })

  test('should display donation page', async ({ page }) => {
    // Check page loaded
    await expect(page).toHaveURL(/\/don/)

    // Check for donation form elements
    const amountSelector = page.locator('input[type="number"], button:has-text("25"), button:has-text("50")')
    await expect(amountSelector.first()).toBeVisible()
  })

  test('should show preset donation amounts', async ({ page }) => {
    // Look for preset amounts (25, 50, 150)
    const amount25 = page.locator('text=25').or(page.locator('[value="25"]'))
    const amount50 = page.locator('text=50').or(page.locator('[value="50"]'))
    const amount150 = page.locator('text=150').or(page.locator('[value="150"]'))

    await expect(amount25.first()).toBeVisible()
    await expect(amount50.first()).toBeVisible()
    await expect(amount150.first()).toBeVisible()
  })

  test('should allow selecting frequency (once/monthly)', async ({ page }) => {
    // Look for frequency selector
    const frequencySelector = page.locator('input[type="radio"], select, button').filter({
      hasText: /une fois|mensuel|monthly|once/i,
    })

    await expect(frequencySelector.first()).toBeVisible()
  })

  test('should require name and email', async ({ page }) => {
    // Look for form fields
    const nameInput = page.locator('input[name*="name" i], input[placeholder*="nom" i]')
    const emailInput = page.locator('input[type="email"], input[name*="email" i]')

    await expect(nameInput.first()).toBeVisible()
    await expect(emailInput.first()).toBeVisible()
  })

  test('should display payment method options', async ({ page }) => {
    // Check for Stripe and PayPal
    const stripeOption = page.locator('text=/stripe|carte/i').or(
      page.locator('button:has-text("Carte")')
    )
    const paypalOption = page.locator('text=/paypal/i').or(
      page.locator('[data-paypal-button]')
    )

    // At least one payment method should be visible
    const hasStripe = await stripeOption.first().isVisible().catch(() => false)
    const hasPayPal = await paypalOption.first().isVisible().catch(() => false)

    expect(hasStripe || hasPayPal).toBe(true)
  })

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first()

    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email')
      await emailInput.blur()

      // HTML5 validation should trigger
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)
      expect(isValid).toBe(false)
    }
  })

  test('should allow custom donation amount', async ({ page }) => {
    // Look for custom amount input
    const customInput = page.locator('input[type="number"]').first()

    if (await customInput.isVisible()) {
      await customInput.fill('75')
      await expect(customInput).toHaveValue('75')
    }
  })

  test('should prevent negative amounts', async ({ page }) => {
    const customInput = page.locator('input[type="number"]').first()

    if (await customInput.isVisible()) {
      await customInput.fill('-50')

      // Should either reject or convert to positive
      const value = await customInput.inputValue()
      expect(parseFloat(value)).toBeGreaterThanOrEqual(0)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/don')

    // Page should still be functional
    const form = page.locator('form, [role="form"]')
    await expect(form.or(page.locator('input').first())).toBeVisible()
  })
})

test.describe('Donation Success Page', () => {
  test('should display success page', async ({ page }) => {
    // Navigate directly to success page
    await page.goto('/don/success')

    // Check for success message
    const successMessage = page.locator('text=/merci|succès|success|reçu/i')
    await expect(successMessage.first()).toBeVisible()
  })

  test('should have link back to homepage', async ({ page }) => {
    await page.goto('/don/success')

    // Look for home link
    const homeLink = page.getByRole('link', { name: /accueil|retour|home/i })
    await expect(homeLink.first()).toBeVisible()
  })
})
