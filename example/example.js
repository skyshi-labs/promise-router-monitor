const express = require('express');
const axios = require('axios');
const { EventEmitter } = require('events');
const { limitPromise, WrapRouter } = require('promise-router-monitor');

/** Create event emitter to monitor/log timeout or rejected promise that wrapped with limitPromise */
const emitterPromise = new EventEmitter();
emitterPromise.on('timeout', ({ promise, message }) => {
  console.log(message);
})
emitterPromise.on('reject', ({ promise, message, err }) => {
  console.log(message);
  console.log(err);
})

/** Util function to delay promise execution */
const delayPromise = (promise, time) => new Promise((resolve, reject) => setTimeout(() => {
  resolve(promise)
}, time));

const app = express();
app.set('env', 'development')

/** Instantiate new express router with WrapRouter */
const exampleRouter = new WrapRouter();
exampleRouter.get('/limit',
  async (req, res) => {
    const url = 'https://api.chucknorris.io/jokes/random'
    const url1 = 'http://http://bugr.or.id/'
    const axiosGetPromise = delayPromise(axios.get(url), 1000)

    const props = { promise: axiosGetPromise, time: 3000, location: `'axiosDelayPromise' in ${__filename}` }
    const data = await limitPromise(emitterPromise)(props)

    res.json({
      status: true,
      code: 200,
      message: 'Success',
      data: data.data || data,
    })
  },
)

/** Get the original express router */
app.use('/', exampleRouter.getOriginal());

/** Not found handler */
app.use((req, res, next) => {
  const err = new Error('URL Not Found')
  err.httpStatus = 404
  next(err)
});

/** Development error handler */
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    const { start, httpStatus, message, previousError, stack } = err
    res.status(httpStatus || 406).json({
      status: false,
      code: httpStatus || 406,
      message,
      data: previousError,
      error: stack
    })
  })
}

/** Production error handler */
app.use((err, req, res, next) => {
  const { start, httpStatus, previousError, stack } = err
  const message = (httpStatus === 500) ? 'Internal Server Error' : err.message
  res.status(httpStatus || 406).json({
    status: false,
    code: httpStatus || 406,
    message,
    data: previousError,
  })
})

app.listen(5000, () => {
  console.log('Running on port 5000')
})
