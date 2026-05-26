import { test } from '@playwright/test'

test('verify no diagonal flash, nodes radiate from center', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('http://localhost:3000')
  await page.waitForTimeout(1000)

  await page.fill('input[aria-label="Enter a concept to explore"]', 'consciousness')

  // Rapid shots immediately after Enter — catch the diagonal flash if still present
  await page.keyboard.press('Enter')
  for (let i = 0; i < 20; i++) {
    await page.screenshot({ path: `/tmp/fix_load_${String(i).padStart(2,'0')}_${i*50}ms.png` })
    await page.waitForTimeout(50)
  }

  // Wait for graph, then capture the radiation animation at 200ms intervals
  await page.waitForTimeout(5000)
  for (let i = 0; i < 20; i++) {
    await page.screenshot({ path: `/tmp/fix_anim_${String(i).padStart(2,'0')}_${i*200}ms.png` })
    await page.waitForTimeout(200)
  }
})
