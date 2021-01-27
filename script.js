(() => {
  let pr
  setTimeout(() => {
    pr = hippoDrawBox.getABox().then(console.log)
  }, 100)

  // setTimeout(() => {
  //   hippoDrawBox.dismiss(pr)
  // }, 2000)
})()