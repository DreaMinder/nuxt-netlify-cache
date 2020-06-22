# Nuxt netlify cache

Nuxt.js module that helps to speed up Netlify content updates by 20%-80%.

## Strategies

This package can be used in two ways: *Module* and *Advanced*. But generally, the flow looks like this:
1. Save .nuxt dir to netlify cache dir on a redeploy.
2. Detect a redeploy that has been triggered with a HTTP-request using [netlify hook](https://docs.netlify.com/configure-builds/build-hooks/).
3. If this request has a special flag inside, restore .nuxt dir from cache and try to use it to speed up the process.

### Module usage

This is a simplified approach, but not the fastest one. It uses [webpack-cache](https://nuxtjs.org/api/configuration-build/#cache) feature to speed up bundle build process.

- Add `nuxt-netlify-cache` dependency
- Define nuxt module:
```js
{
  modules: [
   'nuxt-netlify-cache'
  ]
}
```
- Add a special flag `use_cache` (flag value changeable with module options) to your netlify-hook like this:
`https://api.netlify.com/build_hooks/XXXXXXXXXXXXXXX?trigger_title=Your+title+use_cache`
- Add updated netlify-hook URL to your CMS and check netlify deploy-logs to make sure netlify-cache kicked in


### Advanced usage

This is a more complicated approach that removes bundle-build process entirely. It saves cache the same way as it does in the module approach, but this time if it detects `use_cache` flag in redeploy request, it runs `nuxt export` instead of `nuxt build && nuxt export`.

- Add `nuxt-netlify-cache` dependency
- Add a new command to `package.json`
```js
"scripts": {
  "generate:cached": "nuxt-netlify-cache",
```
- Cange your Netlify Build Command to `npm run generate:cached`
- Add a special flag `use_cache` to your netlify-hook as follows:
`https://api.netlify.com/build_hooks/XXXXXXXXXXXXXXX?trigger_title=Your+title+use_cache`
- Check netlify deploy-logs to make sure netlify-cache kicked in


## Old Nuxt < v2.13

`nuxt generate` has been renamed to `nuxt export` in Nuxt.js version >= v2.13. If you are still using old version, you need to use version v0.0.3 of this package.
