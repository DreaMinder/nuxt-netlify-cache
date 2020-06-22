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
  if (!paths) throw new Error('nuxt-netlify-cache: cli-generate should be used in netlify environment')

  if (useSavedCache) {
    await restoreCache(paths)
    await execCommand('nuxt export')
  } else {
    await execCommand('nuxt build')
    await execCommand('nuxt export')
    await saveCache(paths)
  }
})()