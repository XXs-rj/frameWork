// export  {
export function add (value, object, refs) {
  validData(value, refs).then(valid => {
    if (valid) {
      value.push(object)
    }
  })
}
export function remove (value, index) {
  value.splice(index, 1)
}
export async function validData (value, refs) {
  if (value && value.length > 0) {
    let validResult = true
    for (const index in value) {
      await refs.form[index].validate(valid => {
        validResult = validResult && valid
      })
    }
    return validResult
  } else {
    return true
  }
}
// }
