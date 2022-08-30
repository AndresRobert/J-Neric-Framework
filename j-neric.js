// base
const _unqId = () => {
    return (btoa(Date.now().toString() + Math.random().toString()))
        .replace(/=/g, '')
        .replace(/.{9}/g, '$&-');
};
const _exists = sel => sel instanceof Element
    ? document.body.contains(sel)
    : document.body.contains(_dom.get(sel));
const _isset = item => item instanceof Element
    ? _exists(item)
    : typeof item != 'undefined' && item != null;
const _url = {};
_url.params = () => {
    const queryParameters = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    return queryParameters;
};

// dom
const _dom = {};
_dom.get = sel => {
    const el = document.querySelectorAll(sel);
    return el.length == 0
        ? document.createElement(sel)
        : el[0];
};
_dom.all = sel => {
    const el = document.querySelectorAll(sel);
    return el.length == 0
        ? document.createElement(sel)
        : el;
};
_dom.new = tag => document.createElement(tag);
_dom.ready = fn => {
    if (document.readyState != 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, _dom.evtOpt);
};
_dom.evtOpt = { capture: true, once: false, passive: true };

// prototype
const _pro = HTMLElement.prototype;
_pro._on = function (eventName, eventHandler) {
    this.addEventListener(eventName, eventHandler, _dom.evtOpt);
    return this;
};
_pro._val = function (newVal) {
    if (newVal == undefined)  return this.value;
    this.value = newVal;
    return this;
};
_pro._html = function (html) {
    if (html == undefined) return this.innerHTML;
    this.innerHTML = html;
    return this;
};
_pro._empty = function () {
    this.innerHTML = '';
    return this;
};
_pro._append = function (html) {
    this.innerHTML = this.innerHTML + html;
    return this;
};
_pro._prepend = function (html) {
    this.innerHTML = html + this.innerHTML;
    return this;
};
_pro._addClass = function (className) {
    this.classList.add(className);
    return this;
};
_pro._removeClass = function (className) {
    this.classList.remove(className);
    return this;
};
_pro._toggleClass = function (className) {
    this.classList.toggle(className);
    return this;
};
_pro._hide = function () {
    this.style.display = 'none';
    return this;
};
_pro._show = function () {
    if (this.style.display == 'none') this.style.display = '';
    return this;
};
_pro._remove = function () {
    this.parentNode.removeChild(this);
};
_pro._attr = function (attributeName, value) {
    if (typeof value == 'undefined') return this.getAttribute(attributeName);
    this.setAttribute(attributeName, value);
    return this;
};
_pro._hasClass = function (className) {
    return this.classList.contains(className);
};
_pro._prev = function () {
    return this.previousElementSibling;
};
_pro._next = function () {
    return this.nextElementSibling;
};
_pro._parent = function () {
    return this.parentNode;
};
_pro._find = function (sel) {
    return this.querySelectorAll(sel);
};
_pro._trigger = function (eventName) {
    const event = new Event(eventName);
    this.dispatchEvent(event);
    return this;
};

// JSX Components
/* How to use
_jsx.render(
    _jsx.div({ id: 'app', className: 'card' },
        _jsx.header({ className: 'header' },
            _jsx.h1({ className: 'header_title' }, 'Simple Framework'),
            _jsx.a(
                {
                    className: 'button',
                    target: '_blank',
                    alt: 'Find out more about Simple Framework',
                    href: 'https://simple.acode.cl',
                },
                'What is this?',
            ),
        ),
    )
);
*/
const _jsx = {};
_jsx.exception = {};
_jsx.set = {};
_jsx.add = {};
_jsx.exception.attribute = ['role'];
_jsx.set.text = (el, text) => {
    const textNode = document.createTextNode(text);
    el._append(textNode);
};
_jsx.set.attribute = (el, styles) => {
    if (!styles) {
        el.removeAttribute('styles');
        return;
    }
    Object.keys(styles).forEach(styleName => {
        if (styleName in el.style) el.style[styleName] = styles[styleName];
        else console.warn(`${ styleName } is not a valid style for a <${ el.tagName.toLowerCase() }>`);
    });
};
_jsx.add.array = (el, children) => {
    children.forEach(child => {
        if (Array.isArray(child)) _jsx.add.array(el, child);
        else if (child instanceof window.Element) el._append(child);
        else if (typeof child == 'string') _jsx.set.text(el, child);
    });
};
_jsx.dom = (type, _txtPrpOrChild, ...children) => {
    const el = _dom.get(type);
    if (Array.isArray(_txtPrpOrChild)) { // is Array of children
        _jsx.add.array(el, _txtPrpOrChild);
    } else if (_txtPrpOrChild instanceof window.Element) { // is a Child
        el.appendChild(_txtPrpOrChild);
    } else if (typeof _txtPrpOrChild == 'string') { // is Text
        _jsx.set.text(el, _txtPrpOrChild);
    } else if (typeof _txtPrpOrChild == 'object') { // is Property or Attribute
        Object.keys(_txtPrpOrChild).forEach(
            propName => {
                if (propName in el || _jsx.exception.attribute.includes(propName) || propName.startsWith('data-')) {
                    const value = _txtPrpOrChild[propName];
                    if (propName == 'style') _jsx.set.attribute(el, value);
                    else if (value) el[propName] = value;
                } else console.warn(`${propName} is not a valid property of a <${type}>`);
            }
        );
    }
    if (children) _jsx.add.array(el, children);

    return el;
};
_jsx.render = (html, container = document.body) => container._append(html);
_jsx.a = (...args) => _jsx.dom('a', ...args);
_jsx.area = (...args) => _jsx.dom('area', ...args);
_jsx.article = (...args) => _jsx.dom('article', ...args);
_jsx.aside = (...args) => _jsx.dom('aside', ...args);
_jsx.b = (...args) => _jsx.dom('b', ...args);
_jsx.blockquote = (...args) => _jsx.dom('blockquote', ...args);
_jsx.br = (...args) => _jsx.dom('br', ...args);
_jsx.button = (...args) => _jsx.dom('button', ...args);
_jsx.canvas = (...args) => _jsx.dom('canvas', ...args);
_jsx.code = (...args) => _jsx.dom('code', ...args);
_jsx.div = (...args) => _jsx.dom('div', ...args);
_jsx.footer = (...args) => _jsx.dom('footer', ...args);
_jsx.form = (...args) => _jsx.dom('form', ...args);
_jsx.h1 = (...args) => _jsx.dom('h1', ...args);
_jsx.h2 = (...args) => _jsx.dom('h2', ...args);
_jsx.h3 = (...args) => _jsx.dom('h3', ...args);
_jsx.h4 = (...args) => _jsx.dom('h4', ...args);
_jsx.h5 = (...args) => _jsx.dom('h5', ...args);
_jsx.h6 = (...args) => _jsx.dom('h6', ...args);
_jsx.header = (...args) => _jsx.dom('header', ...args);
_jsx.hr = (...args) => _jsx.dom('hr', ...args);
_jsx.i = (...args) => _jsx.dom('i', ...args);
_jsx.img = (...args) => _jsx.dom('img', ...args);
_jsx.input = (...args) => _jsx.dom('input', ...args);
_jsx.label = (...args) => _jsx.dom('label', ...args);
_jsx.li = (...args) => _jsx.dom('li', ...args);
_jsx.main = (...args) => _jsx.dom('main', ...args);
_jsx.nav = (...args) => _jsx.dom('nav', ...args);
_jsx.ol = (...args) => _jsx.dom('ol', ...args);
_jsx.optgroup = (...args) => _jsx.dom('optgroup', ...args);
_jsx.option = (...args) => _jsx.dom('option', ...args);
_jsx.p = (...args) => _jsx.dom('p', ...args);
_jsx.pre = (...args) => _jsx.dom('pre', ...args);
_jsx.section = (...args) => _jsx.dom('section', ...args);
_jsx.select = (...args) => _jsx.dom('select', ...args)
_jsx.span = (...args) => _jsx.dom('span', ...args);
_jsx.table = (...args) => _jsx.dom('table', ...args);
_jsx.tbody = (...args) => _jsx.dom('tbody', ...args);
_jsx.td = (...args) => _jsx.dom('td', ...args);
_jsx.textarea = (...args) => _jsx.dom('textarea', ...args);
_jsx.tfoot = (...args) => _jsx.dom('tfoot', ...args);
_jsx.th = (...args) => _jsx.dom('th', ...args);
_jsx.thead = (...args) => _jsx.dom('thead', ...args);
_jsx.tr = (...args) => _jsx.dom('tr', ...args);
_jsx.ul = (...args) => _jsx.dom('ul', ...args);

// Http Request
/* How to use
    _http.curl('https://acode.cl/test', { user: 9345 }, 'GET')
        .then( response => {
            console.log(response);
        });
*/
const _http = {};
_http.curl = async function (url , data, method = 'POST') {
    let request = {
        method: method.toUpperCase(),
        headers: {'Content-Type':'application/json'},
        cache: 'no-cache' // default, no-cache, reload, force-cache, only-if-cached
        //referrerPolicy: 'no-referrer', // *no-referrer, client
        //mode: 'cors', // no-cors, *cors, same-origin
        //credentials: 'same-origin', // include, *same-origin, omit
        //redirect: 'follow' // manual, *follow, error
    };
    if (method.toUpperCase() != 'GET') {
        request.body = JSON.stringify(data);
    } else {
        let queryArray = [];
        Object.keys(data).forEach(key => {
            queryArray.push(key + "=" + data[key]);
        });
        url = url + "?" + queryArray.join("&");
    }
    const response = await fetch(url, request);

    return response.json();
};
_http.post = async function (url , data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        cache: 'no-cache',
        body: JSON.stringify(data)
    });

    return response.json();
};
_http.put = async function (url , data) {
    const response = await fetch(url, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        cache: 'no-cache',
        body: JSON.stringify(data)
    });

    return response.json();
};
_http.get = async function (url , data) {
    let queryArray = [];
    Object.keys(data).forEach(key => {
        queryArray.push(key + "=" + data[key]);
    });
    const response = await fetch(url + "?" + queryArray.join("&"), {
        method: 'GET',
        headers: {'Content-Type':'application/json'},
        cache: 'no-cache'
    });

    return response.json();
};
_http.del = async function (url , data) {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {'Content-Type':'application/json'},
        cache: 'no-cache',
        body: JSON.stringify(data)
    });

    return response.json();
};

// Cookies
_cookie = {};
_cookie.set = (name, value, days = 90) => {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    let expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
};
_cookie.get = name => {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};
_cookie.del = name => document.cookie = name + '=; Max-Age=-99999999;';
