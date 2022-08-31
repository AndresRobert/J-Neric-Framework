# J-Neric-Framework
J-neric is a component-ish ready framework for easy dom manipulation, vanilla based and fully compatible with most of the available frameworks out there.

## How to Use
```html
<script src="path/to/j-neric.js"></script>
```
Or
```html
<script src="path/to/jnrc.min.js"></script>
```
All functions are under the object `_`.

## Missing Functions
There are some useful functions that are needed for most projects that are not available just out of the box using vanilla js:
```javascript
if (!_.exists(id)) {
    let id = _.unqId();
}
let queryParams = _.urlParams();
if (_.isset(queryParams.id)) {
    console.log('id is set by user');
    id = queryParams.id;
} else {
    console.log('id is set by system');
}
```

## Http API Helper
curl, or ajax if you want, made easy and ready to use (it uses promise so it's async and can be handled as any other promise)
```javascript
_.curl('https://www.myproject.dev/endpoint', {method: 'GET'}, {user: 9345})
    .then( response => console.log(response));
```

## Cookies Helper
```javascript
_cookie.put('myCookie', 'store this value locally please');
...
console.log(_cookie.get('myCookie'));
/* output: store this value locally please */
```

## DOM Manipulation
Shorthand for `document` methods, attributes and functions

### Selectors
```javascript
_.dom('#element_by_id');
_.dom('.elements_by_className');
_.dom('create_tag', true);

/* Document ready */
_.ready(() => {
    /* Do something */
});
```

### Prototypes
```javascript
let get_value_from_element = element._val();

element
    ._on('event', () => {/* Do something */})
    ._trigger('event')
    ._val('set value for element')
    ._html('set inner html')
    ._text('set text content')
    ._append(element_at_the_end)
    ._prepend(element_at_the_beggining)
    ._attr('data-id', 'some_id')
    ._addClass('className')
    ._removeClass('another_ClassName')
    ._toggleClass('visibility_maybe')
    ._hide()
    ._show()
    ._empty()
    .remove();

if (another_element._hasClass('this_className')) {
    let previous_element = another_element._prev();
    let next_element = another_element._next();
    let parent_element = another_element._parent();
    let found_element_inside = another_element._find('#specific_id');
}
```

### JSX
To get this:
```html
<div id="myAwesomeComponent">
    <h1>Title</h1>
    <p class="myColorClass">Content</p>
</div>
```
Do this:
```javascript
let node1 = _.div({id: 'myAwesomeComponent'}, [
    _.h1(null, 'Title'),
    _.p({class: 'myColorClass'}, 'Content')
]);
node1.renderTo(_.dom('#app'));
```
Update the node by reactivity:
```javascript
const someState = _.reactive({
    title: 'Title',
    content: 'Content',
    color: 'myColorClass'
});

_.stateWatcher(() => {
    let node2 = _.div({id: 'myAwesomeComponent'}, [
        _.h1(null, someState.title),
        _.p({class: someState.color}, someState.content)
    ]);
    node1.replaceBy(node2);
});

setTimeout(() => {someState.title = 'New Title'}, 1000);
setTimeout(() => {someState.content = 'New Content'}, 2000);
setTimeout(() => {someState.color = 'anotherColorClass'}, 3000);
```

# See it in action
Version 1.0.0 See full documentation [here](https://andresrobert.github.io/J-Neric-Framework/)