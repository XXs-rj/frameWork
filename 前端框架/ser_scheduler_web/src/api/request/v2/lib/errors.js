
'use strict'

class ClientError extends Error {
  constructor (data, statusCode) {
    super()
    this.message = data
    this.statusCode = statusCode
  }
}

class InvalidDataError extends ClientError {
  constructor (data, statusCode) {
    super(data, statusCode)
    this.statusCode = 400
  }
}

// 认证错误
class AuthenticationError extends ClientError {
  constructor (data, statusCode) {
    super(data, statusCode)
    this.statusCode = 401
  }
}

// 授权错误
class AuthorizationError extends ClientError {
  constructor (data, statusCode) {
    super(data, statusCode)
    this.statusCode = 403
  }
}

class NotFoundError extends ClientError {
  constructor (data, statusCode) {
    super(data, statusCode)
    this.statusCode = 404
  }
}

class ServerError extends ClientError {
  constructor (data, statusCode) {
    super(data, statusCode)
    switch (data.code) {
      case 'ENOTFOUND':
        this.message = `Request ${data.host} ENOTFOUND`
        break
      default:
        this.message = data.message || 'Internal server error'
    }
    if (data.reason) {
      this.message = data
    }
    this.statusCode = 500
  }
}

class InvalidHttpCodeError extends Error {
  constructor (err) {
    super()
    this.message = err.message
    switch (err.name) {
      case 'ResponseTimeoutError':
      case 'ConnectionTimeoutError':
        this.statusCode = 504
        this.message = this.message || 'Gateway Timeout'
        break
      case 'RequestError':
        this.statusCode = 503
        break
      default:
        this.statusCode = 500
    }
    // For request error
    switch (err.code) {
      case 'ETIMEDOUT':
        this.message = this.message || 'Gateway Timeout'
        this.statusCode = 504
        break
      case 'ECONNREFUSED':
        this.message = this.message || 'The connection could not be established'
        this.statusCode = 501
        break
    }
  }
}

function get (res) {
  const statusCode = res.statusCode
  let data = res.data || {}
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (error) {
    }
  }
  const requestUrls = res.requestUrls
  if (requestUrls && requestUrls.length > 0) {
    window.console.error(`request urls error: ${res.requestUrls.join(', ')}`)
  }
  if (statusCode !== 200) {
    window.console.error('Error data: ' + JSON.stringify(data))
  }
  switch (statusCode) {
    case 400:
      return new InvalidDataError(data)
    case 401:
      return new AuthenticationError(data)
    case 403:
      return new AuthorizationError(data)
    case 404:
      return new NotFoundError(data)
    case 500:
      return new ServerError(data)
    case -1:
      return new InvalidHttpCodeError(res)
    default:
      return new ClientError(data, statusCode)
  }
}

exports.ClientError = ClientError
exports.InvalidDataError = InvalidDataError
exports.AuthenticationError = AuthenticationError
exports.AuthorizationError = AuthorizationError
exports.NotFoundError = NotFoundError
exports.ServerError = ServerError
exports.InvalidHttpCodeError = InvalidHttpCodeError
exports.get = get
