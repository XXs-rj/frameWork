
const apiFactory = require('./request/v2/lib/api_factory')

export function getWatchToken () {
  const spi = apiFactory.getSpi()
  return spi.watch.getBy(['token'])
}
