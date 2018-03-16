const Promise = require('bluebird');
const { timeoutMsg, rejectMsg } = require('./message');

/** Enable bluebird cancel promise */
Promise.config({ cancellation: true });

/**
 * @param  {Promise} {promise
 * @param  {integer} time in millisecond
 * @param  {string} location}
 */
module.exports = eventEmitter => ({ promise, time, location}) => {
  return new Promise((resolve, reject) => {
    const promisified = new Promise(res => res(promise));
    promisified
      .timeout(time)
      .then(data => resolve(data))
      .catch(err => {
        if (err.name === 'TimeoutError') {
          eventEmitter.emit('timeout', { promise, message: timeoutMsg(location, time) });
          err.httpStatus = 408;
          err.msg = timeoutMsg(location, time);
          reject(err);
        } else {
          eventEmitter.emit('reject', { promise, message: rejectMsg(location), err });
          err.httpStatus = 500;
          err.msg = rejectMsg(location);
          reject(err);
        }
      })
  })
}