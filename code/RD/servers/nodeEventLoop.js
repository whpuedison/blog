// setImmediate(() => {
//     console.log('timeout1')
//     Promise.resolve().then(() => console.log('promise resolve'))
//     process.nextTick(() => console.log('next tick1'))
// });
// setImmediate(() => {
//     console.log('timeout2')
//     process.nextTick(() => console.log('next tick2'))
// });
// setImmediate(() => console.log('timeout3'));
// setImmediate(() => console.log('timeout4'));



// setTimeout(()=>{
//     console.log('timer1')
//     Promise.resolve().then(function() {
//         console.log('promise1')
//     })
// }, 0)
// setTimeout(()=>{
//     console.log('timer2')
//     Promise.resolve().then(function() {
//         console.log('promise2')
//     })
// }, 0)



// console.log('start')
// setTimeout(() => {
//   console.log('timer1')
//   Promise.resolve().then(function() {
//     console.log('promise1')
//   })
// }, 0)
// setTimeout(() => {
//   console.log('timer2')
//   Promise.resolve().then(function() {
//     console.log('promise2')
//   })
// }, 0)
// Promise.resolve().then(function() {
//   console.log('promise3')
// })
// console.log('end')


// setTimeout(function timeout () {
//     console.log('timeout');
//   },0);
//   setImmediate(function immediate () {
//     console.log('immediate');
//   });


  const fs =require('fs')
  fs.readFile('./reptileServer.js', 'utf-8', (err, res) => {
      if (err) throw err
      setTimeout(function timeout () {
        console.log('timeout');
      },0);
      setImmediate(function immediate () {
        console.log('immediate');
      });
  })


// setImmediate(() => {
//     console.log('timeout1')
//     Promise.resolve().then(() => console.log('promise resolve'))
//     process.nextTick(() => console.log('next tick1'))
// });
// setImmediate(() => {
//     console.log('timeout2')
//     process.nextTick(() => console.log('next tick2'))
// });
// setImmediate(() => console.log('timeout3'));
// setImmediate(() => console.log('timeout4'));
