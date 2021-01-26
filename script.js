(() => {
  let pr
  setTimeout(() => {
    pr = drawbox.getABox().then(console.log)
  }, 100)

  // setTimeout(() => {
  //   drawbox.dismiss(pr)
  // }, 2000)
})()