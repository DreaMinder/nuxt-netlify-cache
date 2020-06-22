const { resolve, relative } = require(`path`)
const { ensureDir, pathExists, copy } = require(`fs-extra`)

const getPaths = (rootDir, nuxtBuildDir, netlifyBuildDir) => {
  const nuxtDirName = relative(rootDir, nuxtBuildDir)
  const cachePath = resolve(netlifyBuildDir, 'cache', nuxtDirName)
  const buildPath = nuxtBuildDir

  return {
    cachePath,
    buildPath
  }
}

const restoreCache = async ({ cachePath, buildPath }) => {
  console.log('nuxt-netlify-cache: restoring build from cache...')

  await copy(cachePath, buildPath)

  console.log('nuxt-netlify-cache: done')
}

const saveCache = async ({ cachePath, buildPath }) => {
  console.log('nuxt-netlify-cache: saving cache...')

  await ensureDir(cachePath)
  await copy(buildPath, cachePath)

  console.log('nuxt-netlify-cache: done')
}

const init = async (cacheFlag, options) => {
  const netlifyHookTitle = process.env.INCOMING_HOOK_TITLE || ''
  const netlifyBuildDir = process.env.NETLIFY_BUILD_BASE
  const nuxtBuildDir = options.buildDir
  const rootDir = options.rootDir
  if (!netlifyBuildDir) return {}

  const paths = getPaths(rootDir, nuxtBuildDir, netlifyBuildDir);
  const cacheAvailable = await pathExists(paths.cachePath)
  const useSavedCache = cacheAvailable && netlifyHookTitle.includes(cacheFlag)
  if (!cacheAvailable) console.log('nuxt-netlify-cache: no cache')

  return {
    useSavedCache,
    paths
  }
}

module.exports = async function module({ cacheFlag = 'use_cache' }) {
  const { paths, useSavedCache } = await init(cacheFlag, this.nuxt.options)
  if (!paths) return null

  if (useSavedCache) {
    this.nuxt.options.build.cache = true
    this.nuxt.hook('build:before', () => restoreCache(paths))
  } else {
    this.nuxt.hook('build:done', () => saveCache(paths))
  }
}

// for cli-implementation (/bin/generate)
module.exports.init = init
module.exports.saveCache = saveCache
module.exports.restoreCache = restoreCache

module.exports.meta = require('../package.json')