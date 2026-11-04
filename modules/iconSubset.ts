/**
 * Production builds ship only the icons the code uses, instead of two full icon fonts on every page:
 *
 * - Material Design Icons (`mdi-*`): ~7,400 icons, a 403 KB font and a 418 KB render-blocking stylesheet.
 *   We keep the icons named in the source plus the ones Vuetify's own components use.
 * - Material Symbols (`md:*`): a 414 KB variable font. We ask Google Fonts for a subset of the names
 *   used in the source (keeping the FILL and optical-size axes the icon set uses).
 *
 * Icon names that only exist at run time can't be found by scanning, so code must name icons in
 * full (`'mdi-eye'`, not `` `mdi-${name}` ``). Names that come from data use the `mdfull:` set,
 * which keeps the whole Material Symbols font (see app/utils/iconsets/mdSymbols.ts).
 *
 * If a subset can't be built (e.g. no network during the build), the build keeps the full font for
 * that set and prints a warning: it never fails the build or ships missing icons.
 * Development (`nuxt dev`) always uses the full fonts.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { defineNuxtModule, useLogger } from '@nuxt/kit'
import subsetFont from 'subset-font'

const SOURCE_DIRS = ['app', 'store']
const SOURCE_EXTENSIONS = /\.(vue|ts|js|mjs)$/
const MDI_CSS = '@mdi/font/css/materialdesignicons.css'
const SYMBOLS_CSS_HREF = '/assets/css/material-symbols.css'
// A modern browser user agent, so Google Fonts answers with woff2.
const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

const listSourceFiles = async (dir: string): Promise<string[]> => {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return []
  }
  const files = await Promise.all(entries.map((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return listSourceFiles(path)
    return SOURCE_EXTENSIONS.test(entry.name) ? [path] : []
  }))
  return files.flat()
}

const buildMdiSubset = async (source: string, outDir: string, resolve: (id: string) => string) => {
  const vuetifyAliases = await readFile(resolve('vuetify/lib/iconsets/mdi.js'), 'utf8')
  const wanted = new Set([...`${source}\n${vuetifyAliases}`.matchAll(/\bmdi-([a-z0-9]+(?:-[a-z0-9]+)*)/g)].map(m => m[1]!))

  const variables = await readFile(resolve('@mdi/font/scss/_variables.scss'), 'utf8')
  const codepoints = new Map([...variables.matchAll(/"([a-z0-9-]+)": (F[0-9A-F]+),/g)].map(m => [m[1]!, m[2]!]))
  const used = [...wanted].filter(name => codepoints.has(name))
  if (!used.length) throw new Error('no Material Design Icons names found in the source')

  const css = await readFile(resolve(MDI_CSS), 'utf8')
  const subsetCss = css
    // Drop the rules of icons nobody uses.
    .replace(/\.mdi-([a-z0-9-]+)::before \{\s*content: "\\[0-9A-F]+";\s*\}\n?/g, (rule, name: string) => (used.includes(name) ? rule : ''))
    // One woff2 source instead of the eot/woff/ttf chain.
    .replace(/@font-face \{[^}]*\}/, `@font-face {
  font-family: "Material Design Icons";
  src: url("./materialdesignicons-subset.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: block;
}`)

  const font = await readFile(resolve('@mdi/font/fonts/materialdesignicons-webfont.woff2'))
  const text = used.map(name => String.fromCodePoint(Number.parseInt(codepoints.get(name)!, 16))).join('')
  const subset = await subsetFont(font, text, { targetFormat: 'woff2' })

  await writeFile(join(outDir, 'materialdesignicons-subset.woff2'), subset)
  const cssPath = join(outDir, 'materialdesignicons-subset.css')
  await writeFile(cssPath, subsetCss)
  return { cssPath, count: used.length, fontBytes: subset.length, cssBytes: subsetCss.length }
}

const buildSymbolsSubset = async (source: string, outDir: string, publicCss: string) => {
  // `md:name` and `md:name_outlined` (the icon set turns `_outlined` into FILL 0).
  const names = [...new Set([...source.matchAll(/(?<![a-z])md:([a-z0-9_]+)/g)].map(m => m[1]!.replace(/_outlined$/, '')))].sort()
  if (!names.length) throw new Error('no Material Symbols names found in the source')

  // Google needs the names sorted; the axes match what the md icon set sets in font-variation-settings.
  const url = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0..1,0&icon_names=${names.join(',')}&display=block`
  const cssResponse = await fetch(url, { headers: { 'User-Agent': BROWSER_UA }, signal: AbortSignal.timeout(20_000) })
  if (!cssResponse.ok) throw new Error(`Google Fonts answered ${cssResponse.status}`)
  const fontUrl = (await cssResponse.text()).match(/src:\s*url\((https:[^)]+)\)\s*format\('woff2'\)/)?.[1]
  if (!fontUrl) throw new Error('no woff2 font in the Google Fonts response')
  const fontResponse = await fetch(fontUrl, { signal: AbortSignal.timeout(20_000) })
  if (!fontResponse.ok) throw new Error(`font download answered ${fontResponse.status}`)
  const font = Buffer.from(await fontResponse.arrayBuffer())

  await writeFile(join(outDir, 'material-symbols-subset.woff2'), font)
  const css = publicCss.replace(/url\([^)]*\)/, 'url(\'./material-symbols-subset.woff2\')')
  const cssPath = join(outDir, 'material-symbols-subset.css')
  await writeFile(cssPath, css)
  return { cssPath, count: names.length, fontBytes: font.length }
}

export default defineNuxtModule({
  meta: { name: 'icon-subset' },
  async setup(_options, nuxt) {
    if (nuxt.options.dev || nuxt.options._prepare) return

    const logger = useLogger('icon-subset')
    const resolve = createRequire(join(nuxt.options.rootDir, 'package.json')).resolve
    // Not buildDir: Nuxt empties that after modules run, which would delete these files.
    const outDir = join(nuxt.options.rootDir, 'node_modules', '.cache', 'icon-subset')
    await mkdir(outDir, { recursive: true })

    const files = (await Promise.all(SOURCE_DIRS.map(dir => listSourceFiles(join(nuxt.options.rootDir, dir))))).flat()
    files.push(join(nuxt.options.rootDir, 'nuxt.config.js'))
    const source = (await Promise.all(files.map(file => readFile(file, 'utf8').catch(() => '')))).join('\n')

    try {
      const mdi = await buildMdiSubset(source, outDir, resolve)
      nuxt.options.alias[MDI_CSS] = mdi.cssPath
      logger.success(`Material Design Icons: ${mdi.count} icons, ${Math.round(mdi.fontBytes / 1024)} KB font, ${Math.round(mdi.cssBytes / 1024)} KB CSS`)
    }
    catch (error) {
      logger.warn(`Material Design Icons: keeping the full font (${(error as Error).message})`)
    }

    try {
      const publicCss = await readFile(join(nuxt.options.rootDir, 'public', SYMBOLS_CSS_HREF), 'utf8')
      const symbols = await buildSymbolsSubset(source, outDir, publicCss)
      // Bundle the subset with the app CSS and drop the full font's <link> tags.
      nuxt.options.css.push(symbols.cssPath)
      const head = nuxt.options.app.head
      head.link = (head.link || []).filter(link => link.href !== SYMBOLS_CSS_HREF)
      logger.success(`Material Symbols: ${symbols.count} icons, ${Math.round(symbols.fontBytes / 1024)} KB font`)
    }
    catch (error) {
      logger.warn(`Material Symbols: keeping the full font (${(error as Error).message})`)
    }
  },
})
