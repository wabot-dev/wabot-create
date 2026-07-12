import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)

const FRAMEWORK_PKG = '@wabot-dev/framework'
const FRAMEWORK_SEGMENTS = FRAMEWORK_PKG.split('/')

function packageRootFromEntry(entryPath) {
  let dir = path.dirname(entryPath)
  const { root } = path.parse(dir)
  while (dir && dir !== root) {
    const pkgFile = path.join(dir, 'package.json')
    if (fs.existsSync(pkgFile)) {
      try {
        if (JSON.parse(fs.readFileSync(pkgFile, 'utf8')).name === FRAMEWORK_PKG) {
          return dir
        }
      } catch {
        // ignore malformed package.json and keep walking up
      }
    }
    dir = path.dirname(dir)
  }
  return null
}

// Locate the packaged `skills/` directory shipped by @wabot-dev/framework.
//
// The framework owns the skills and versions them with its API. When bootstrapping
// or resyncing a project, resolve them from the framework installed *in that
// project* (`fromDir`) so the copied skills match the project's pinned framework
// version. For standalone use (e.g. `skill add`) fall back to the framework
// resolvable from this package.
export function resolveFrameworkSkillsDir(fromDir) {
  const candidates = []

  if (fromDir) {
    candidates.push(path.join(fromDir, 'node_modules', ...FRAMEWORK_SEGMENTS, 'skills'))
  }

  try {
    const pkgRoot = packageRootFromEntry(require.resolve(FRAMEWORK_PKG))
    if (pkgRoot) candidates.push(path.join(pkgRoot, 'skills'))
  } catch {
    // framework not resolvable via node resolution; try the node_modules lookups below
  }

  const createPkgRoot = fileURLToPath(new URL('../../', import.meta.url))
  candidates.push(path.join(createPkgRoot, 'node_modules', ...FRAMEWORK_SEGMENTS, 'skills'))
  candidates.push(path.join(process.cwd(), 'node_modules', ...FRAMEWORK_SEGMENTS, 'skills'))

  // Monorepo dev fallback: the framework lives beside this package as a sibling
  // checkout (`../wabot-ts`). Used so smoke tests can resolve skills without the
  // framework being installed as a dependency; installed lookups above win.
  candidates.push(path.join(createPkgRoot, '..', 'wabot-ts', 'skills'))

  for (const dir of candidates) {
    if (dir && fs.existsSync(dir)) return dir
  }

  throw new Error(
    `Could not locate ${FRAMEWORK_PKG} skills. Ensure ${FRAMEWORK_PKG} is installed ` +
      `(the packaged skills ship with the framework as of the version that added them).`,
  )
}
