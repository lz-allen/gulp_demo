// TODO: site logics

$(($) => {
  const $body = $('html, body')

  $('#scroll_top').on('click', () => {
    $body.animate({
      scrollTop: 0
    }, 600)
    return false
  })
})

class A {
  constructor(a) {
    this.a = a;
  }
}

class B extends A {

}
