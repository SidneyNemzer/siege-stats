export const mapPromiseSync = (callback, array, results=[]) => {
  return new Promise(resolve => {
    if (!array || array.length === 0) {
      resolve(results)
    } else {
      callback(array[0])
        .then(result => resolve(mapPromiseSync(callback, array.slice(1), results.concat(result))))
    }
  })
}
