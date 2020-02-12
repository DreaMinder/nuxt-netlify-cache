#!/usr/bin/env node

const { init, saveCache, restoreCache } = require('../lib/module')

const cacheFlag = 'use_cache'
const rootDir = process.cwd()
const buildDir = rootDir + '/.nuxt/'

const execCommand = (cmd) => {
  const spawn = require('child_process').spawn
  const chunks = cmd.split(' ')
  const command = chunks.shift()

  return new Promise((resolve, reject) => {
    const process = spawn(command, chunks, { stdio: 'inherit' })
    process.on('close', code => code === 0 ? resolve () : reject())
  });
}

(async () => {
  const { paths, useSavedCache } = await init(cacheFlag, { rootDir, buildDir })

  console.log('nuxt-netlify-cache: running cached nuxt-generate')
  if (!paths) throw new Error('nuxt-netlify-cache: cli-generate should be used in netlify environment')

  if (useSavedCache) {
    await restoreCache(paths)
    await execCommand('nuxt generate --no-build')
  } else {
    await execCommand('nuxt generate')
    await saveCache(paths)
  }
})()


// This implementation should be better but it didn't work because of non-transpiled imports in nuxt.config

// const { Nuxt, Generator } = require('nuxt/dist/nuxt')

// const root = process.cwd()
// const config = require(root + '/nuxt.config.js')
// const { triggerCache } = require('./modules/nuxt-netlify-cache')

// const nuxt = new Nuxt(config)
// const generator = new Generator(nuxt)

// const main = async () => {
//   triggerCache('restore', { rootDir: root, buildDir: root + '/.nuxt/' })
//   await generator.generate({ build: false })
//   triggerCache('save', { rootDir: root, buildDir: root + '/.nuxt/' })
// }
