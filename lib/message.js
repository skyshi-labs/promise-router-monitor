/**
 * Return timeout message
 * @param  {} location
 * @param  {} time
 */
function timeoutMsg(location, time) {
  return `PROMISE_TIMEOUT: Promise ${location} is longer than ${time} ms`;
}
/**
 * Return reject message
 * @param  {} location
 */
function rejectMsg(location) {
  return `PROMISE_REJECT: Promise ${location} is rejected`;
}

module.exports = { timeoutMsg, rejectMsg };
