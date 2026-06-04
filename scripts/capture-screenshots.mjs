import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import path from 'path'

const BASE = process.env.APP_URL ?? 'http://127.0.0.1:5173'
const OUT = path.resolve('docs/screenshots-pracownicy')

const EXAMPLE = `Magazyn biala 04.06 14:00
zamrażalnik
4x nugetsy
5x skrzydełka
lodówka
2x jogurt grecki
2 kg ser mozzarella
7x salami zwykle`

async function main() {
  await mkdir(OUT, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 2,
  })

  await page.goto(BASE, { waitUntil: 'networkidle' })

  // 01 — cały widok
  await page.screenshot({
    path: path.join(OUT, '01-pelny-widok.png'),
    fullPage: false,
  })

  // 02 — panel Smart Paste (lewa kolumna)
  const aside = page.locator('aside').first()
  await aside.screenshot({ path: path.join(OUT, '02-smart-paste-panel.png') })

  // 03 — szablon rozwinięty
  await page.getByRole('button', { name: /Szablon dla Messengera/i }).click()
  await page.waitForTimeout(300)
  await aside.screenshot({ path: path.join(OUT, '03-szablon-messenger.png') })

  // 04 — demo + tekst w polu
  await page.getByRole('button', { name: 'Demo' }).click()
  await page.waitForTimeout(200)
  await aside.screenshot({ path: path.join(OUT, '04-demo-wklejony-tekst.png') })

  // 05 — po przetworzeniu
  await page.getByRole('button', { name: /Przetwórz tekst/i }).click()
  await page.waitForTimeout(500)
  await page.screenshot({
    path: path.join(OUT, '05-po-przetworzeniu.png'),
    fullPage: false,
  })

  // 06 — karta towaru (ręczna ilość + jednostka)
  const card = page.locator('article').filter({ hasText: 'Jogurt grecki' }).first()
  if (await card.count()) {
    await card.screenshot({ path: path.join(OUT, '06-reczna-ilosc-jednostka.png') })
  }

  // 07 — tylko lodówka (wąski przykład) — mobile
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.locator('textarea').fill(EXAMPLE)
  await page.getByRole('button', { name: /Przetwórz tekst/i }).click()
  await page.waitForTimeout(500)
  await page.screenshot({
    path: path.join(OUT, '07-telefon-po-lodowce.png'),
    fullPage: true,
  })

  await browser.close()
  console.log('Zrzuty zapisane w:', OUT)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
