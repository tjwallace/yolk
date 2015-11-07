const Rx = require(`rx`)
const test = require(`tape`)
const Yolk = require(`yolk`)
const renderInDoc = require(`../helpers/renderInDoc`)

test(`CreateCustomComponent: a component that has livecycle hooks`, t => {
  t.plan(3)
  t.timeoutAfter(100)

  class CustomOnlyMount extends Yolk.CustomComponent {
    onMount (props, node) {
      const className = props.className.join(` `)
      node.setAttribute(`class`, className)
    }

    onUpdate (props, node) {
      const className = props.className.join(` `)
      node.setAttribute(`class`, className)
    }

    onUnmount () {
      t.pass(`custom component unmounts`)
    }
  }

  const names = new Rx.BehaviorSubject([`a`, `b`, `c`, `d`])

  const instance = <CustomOnlyMount className={names}><p /></CustomOnlyMount>
  const [node, cleanup] = renderInDoc(instance)

  t.equal(node.tagName, `P`)
  t.equal(node.className, `a b c d`)

  names.onNext([`e`, `ee`, `eee`, `eeee`])

  t.equal(node.className, `e ee eee eeee`)

  Yolk.render(<div />, node)

  cleanup()
})

test(`CreateCustomComponent: uses a div if no child is passed in`, t => {
  t.plan(2)
  t.timeoutAfter(100)

  class CC extends Yolk.CustomComponent {}
  const [node, cleanup] = renderInDoc(<CC />)

  t.equal(node.tagName, `DIV`)

  const [node2, cleanup2] = renderInDoc(<CC><p /></CC>)

  t.equal(node2.tagName, `P`)

  cleanup()
  cleanup2()
})

test(`CreateCustomComponent: should raise when there is more than one child`, t => {
  t.plan(6)
  t.timeoutAfter(100)

  class CC extends Yolk.CustomComponent {}

  t.throws(() => <CC><p /><p /></CC>)
  t.throws(() => <CC><p><p /></p><p /></CC>)
  t.doesNotThrow(() => <CC><p /></CC>)
  t.doesNotThrow(() => <CC><p><p /></p></CC>)
  t.doesNotThrow(() => <CC><p><p /><p /></p></CC>)
  t.doesNotThrow(() => <CC />)
})
