(function() {
	'use strict';
	// classes
	class VirtualNode {
		constructor(_tag, _props, _children) {
			this.tag = _tag.toLowerCase();
			this.props = _props;
			this.children = _children;
			this.el = _.dom(this.tag, true);
		}

		len() {
			return this.children.length;
		}

		app() {
			return _.dom('#app');
		}

		parent() {
			return this.el._parent();
		}

		remove() {
			if (this.el != null) this.el._remove();
		}

		renderTo(_container) {
			const _element = this.el;
			if (_container == null) _container = this.app();
			for (const _key in this.props) {
				if (_key) _element._attr(_key, this.props[_key]);
			}
			if (typeof this.children === 'string')
				_element._text(this.children);
			else this.children.forEach(
				child => child.renderTo(_element)
			);
			_container.appendChild(_element);
		}

		replaceBy(_vnode) {
			const _element = (_vnode._element = this.el);
			if (this.tag !== _vnode.tag) {
				_vnode.renderTo(_element.parent());
				this.remove();
				return;
			}
			if (typeof _vnode.children === 'string') {
				this.el._text(_vnode.children);
				return;
			}
			if (typeof this.children === 'string') {
				_element._text('');
				_vnode.children.forEach(
					_child => _child.renderTo(_element)
				);
				return;
			}
			for (let i = 0; i < Math.min(this.len(), _vnode.len()); i++)
				this.children[i].replaceBy(_vnode.children[i]);
			if (this.len() > _vnode.len()) {
				const _oldChildren = this.children;
				_oldChildren.slice(_vnode.len()).forEach(
					_child => _child.remove()
				);
				return;
			}
			if (this.len() < _vnode.len()) {
				const _newChildren = _vnode.children;
				_newChildren.slice(this.len()).forEach(
					_child => _child.renderTo(_element)
				);
			}
		}

	}
    class ReactiveDependency {
        constructor(_value) {
            this._value = _value;
            this.subscribers = new Set();
        }

        get value() {
            this.depend();
            return this._value;
        }

        set value(_value) {
            this._value = _value;
            this.notify();
        }

        depend() {
            if (_.activeEffect) this.subscribers.add(_.activeEffect);
        }

        notify() {
            this.subscribers.forEach(subscriber => subscriber());
        }
    }

	// prototype
	const _pro = HTMLElement.prototype;
	_pro._on = function(_eventName, _eventHandler) {
		this.addEventListener(
			_eventName,
			_eventHandler, {
				capture: true,
				once: false,
				passive: true
			}
		);
		return this;
	};
	_pro._val = function(_value) {
		if (!_.isset(_value)) return this.value;
		this.value = _value;
		return this;
	};
	_pro._html = function(_html) {
		if (!_.isset(_html)) return this.innerHTML;
		this.innerHTML = _html;
		return this;
	};
	_pro._text = function(_text) {
		if (!_.isset(_text)) return this.textContent;
		this.textContent = _text;
		return this;
	};
	_pro._empty = function() {
		this.innerHTML = '';
		return this;
	};
	_pro._append = function(_html) {
		this.innerHTML = this.innerHTML + _html;
		return this;
	};
	_pro._prepend = function(_html) {
		this.innerHTML = _html + this.innerHTML;
		return this;
	};
	_pro._addClass = function(_className) {
		this.classList.add(_className);
		return this;
	};
	_pro._removeClass = function(_className) {
		this.classList.remove(_className);
		return this;
	};
	_pro._toggleClass = function(_className) {
		this.classList.toggle(_className);
		return this;
	};
	_pro._hide = function() {
		this.style.display = 'none';
		return this;
	};
	_pro._show = function() {
		if (this.style.display == 'none') this.style.display = '';
		return this;
	};
	_pro._toggle = function() {
		if (this.style.display == 'none') this._show();
		else this._hide();
		return this;
	};
	_pro._remove = function() {
		this.parent().removeChild(this);
	};
	_pro._attr = function(_attributeName, _value) {
		if (!_.isset(_value)) return this.getAttribute(_attributeName);
		this.setAttribute(_attributeName, _value);
		return this;
	};
	_pro._hasClass = function(_className) {
		return this.classList.contains(_className);
	};
	_pro._prev = function() {
		return this.previousElementSibling;
	};
	_pro._next = function() {
		return this.nextElementSibling;
	};
	_pro._parent = function() {
		return this.parentNode;
	};
	_pro._find = function(_selector) {
		return this.querySelectorAll(_selector);
	};
	_pro._trigger = function(_eventName) {
		const _event = new Event(_eventName);
		this.dispatchEvent(_event);
		return this;
	};

	// base
	const _ = {};
    _.activeEffect = null;
	_.unqId = () => {
		return (btoa(Date.now().toString() + Math.random().toString()))
			.replace(/=/g, '')
			.replace(/.{9}/g, '$&-');
	};
	_.exists = _element => _element instanceof Element ? document.body.contains(_element) : document.body.contains(_.dom(_element));
	_.isset = _item => _item instanceof Element ? _.exists(_item) : typeof _item != 'undefined' && _item != null;
	_.urlParams = () => {
		return new Proxy(
			new URLSearchParams(window.location.search), {
				get: (searchParams, prop) => searchParams.get(prop)
			}
		);
	};
	_.isValidTag = _tag => {
		return /^[a-zA-Z]+$/.test(_tag);
	};
	_.dom = (_selector, _create) => {
		if (_create == true) {
			if (_.isValidTag(_selector))
				return document.createElement(
					_selector.toLowerCase()
				);
			return null;
		}
		const _elements = document.querySelectorAll(_selector);
		if (_elements.length == 1) return _elements[0];
		return _elements;
	};
	_.ready = _fn => {
		if (document.readyState != 'loading') _fn();
		else document.addEventListener(
			'DOMContentLoaded',
			_fn, {
				capture: true,
				once: false,
				passive: true
			}
		);
	};
	_.curl = async function(_url, _request = {method: 'GET'}, _data = {}) {
		/* How to use
		    _.curl('https://www.mysite.dev/api/endpoint', {method: 'GET'}, {user: 9345})
		        .then( response => console.log(response) );
		*/
		_request.method = _request.method.toUpperCase();
		_request.headers = _request.headers ?? {'Content-Type': 'application/json'};
		_request.cache = _request.cache ?? 'no-cache'; // default, no-cache, reload, force-cache, only-if-cached
		_request.mode = _request.mode ?? 'cors'; // no-cors, *cors, same-origin
		_request.credentials = _request.credentials ?? 'same-origin'; // include, *same-origin, omit
		_request.redirect = _request.redirect ?? 'follow'; // manual, *follow, error
		_request.referrerPolicy = _request.referrerPolicy ?? 'no-referrer'; // *no-referrer, client
		if (_request.method != 'GET') _request.body = JSON.stringify(_data);
		else if (_data != {}) {
			let _qryArray = [];
			Object.keys(_data).forEach(_key => {
				_qryArray.push(_key + "=" + _data[_key]);
			});
			_url = _url + "?" + _qryArray.join("&");
		}
		const _response = await fetch(_url, _request);

		return _response.json();
	};

	// Cookies
	_.cookie = {};
	_.cookie.put = (_name, _value, _days = 90) => {
		let _now = new Date();
		_now.setTime(_now.getTime() + (_days * 24 * 60 * 60 * 1000));
		document.cookie = _name + "=" + (_value || "") + "; expires=" + _now.toUTCString() + "; path=/";
	};
    _.cookie.get = _name => {
		const _cookies = new URLSearchParams(
            document.cookie
            .replaceAll('&', '%26')
            .replaceAll('; ', '&')
        );
        return _cookies.get(_name);
	};
	_.cookie.del = _name => document.cookie = _name + '=; Max-Age=-99999999;';

	// JSX Virtual DOM
	/* How to use
	To get this:
	    <div id="myAwesomeComponent">
	        <h1>Title</h1>
	        <p class="myColor">Content</p>
	    </div>
	Do this:
	    let node1 = 
	        _.div({id: 'myAwesomeComponent'}, [
	            _.h1(null, 'Title'),
	            _.p({class: 'myColor'}, 'Content')
	        ]);
	    node1.renderTo();
	Update the node by:
	    let node2 = 
	        _.div({id: 'myNewAwesomeComponent'}, [
	            _.h1(null, 'Another Title'),
	            _.p({class: 'anotherColor'}, 'Another Content')
	        ]);
	    node1.replaceBy(node2);
	*/
	_.a = (props, children) => new VirtualNode('a', props, children);
	_.area = (props, children) => new VirtualNode('area', props, children);
	_.article = (props, children) => new VirtualNode('article', props, children);
	_.aside = (props, children) => new VirtualNode('aside', props, children);
	_.b = (props, children) => new VirtualNode('b', props, children);
	_.blockquote = (props, children) => new VirtualNode('blockquote', props, children);
	_.br = (props, children) => new VirtualNode('br', props, children);
	_.button = (props, children) => new VirtualNode('button', props, children);
	_.canvas = (props, children) => new VirtualNode('canvas', props, children);
	_.code = (props, children) => new VirtualNode('code', props, children);
	_.div = (props, children) => new VirtualNode('div', props, children);
	_.footer = (props, children) => new VirtualNode('footer', props, children);
	_.form = (props, children) => new VirtualNode('form', props, children);
	_.h1 = (props, children) => new VirtualNode('h1', props, children);
	_.h2 = (props, children) => new VirtualNode('h2', props, children);
	_.h3 = (props, children) => new VirtualNode('h3', props, children);
	_.h4 = (props, children) => new VirtualNode('h4', props, children);
	_.h5 = (props, children) => new VirtualNode('h5', props, children);
	_.h6 = (props, children) => new VirtualNode('h6', props, children);
	_.header = (props, children) => new VirtualNode('header', props, children);
	_.hr = (props, children) => new VirtualNode('hr', props, children);
	_.i = (props, children) => new VirtualNode('i', props, children);
	_.img = (props, children) => new VirtualNode('img', props, children);
	_.input = (props, children) => new VirtualNode('input', props, children);
	_.label = (props, children) => new VirtualNode('label', props, children);
	_.li = (props, children) => new VirtualNode('li', props, children);
	_.main = (props, children) => new VirtualNode('main', props, children);
	_.nav = (props, children) => new VirtualNode('nav', props, children);
	_.ol = (props, children) => new VirtualNode('ol', props, children);
	_.optgroup = (props, children) => new VirtualNode('optgroup', props, children);
	_.option = (props, children) => new VirtualNode('option', props, children);
	_.p = (props, children) => new VirtualNode('p', props, children);
	_.pre = (props, children) => new VirtualNode('pre', props, children);
	_.section = (props, children) => new VirtualNode('section', props, children);
	_.select = (props, children) => new VirtualNode('select', props, children);
	_.span = (props, children) => new VirtualNode('span', props, children);
	_.table = (props, children) => new VirtualNode('table', props, children);
	_.tbody = (props, children) => new VirtualNode('tbody', props, children);
	_.td = (props, children) => new VirtualNode('td', props, children);
	_.textarea = (props, children) => new VirtualNode('textarea', props, children);
	_.tfoot = (props, children) => new VirtualNode('tfoot', props, children);
	_.th = (props, children) => new VirtualNode('th', props, children);
	_.thead = (props, children) => new VirtualNode('thead', props, children);
	_.tr = (props, children) => new VirtualNode('tr', props, children);
	_.ul = (props, children) => new VirtualNode('ul', props, children);

	// JSX Reactivity
    /* How to use
    const _state = _.reactive({
        name: 'My Name',
        email: 'myemail@gmail.com'
    });
    _.stateWatcher(
        () => console.log(
            'state has changed', 
            _state.count, 
            _state.name
        )
    );
    setTimeout(() => {state.name = 'New Name'}, 1000);
    setTimeout(() => {state.email = 'newemail@gmail.com'}, 2000);
    */
    _.stateWatcher = _fn => {
        _.activeEffect = _fn;
        _fn();
        _.activeEffect = null;
    };
    _.reactive = _object => {
        Object.keys(_object).forEach(
            _key => {
                const _dependency = new ReactiveDependency();
                let _value = _object[_key];
                Object.defineProperty(
                    _object, 
                    _key, 
                    {
                        get() {
                            _dependency.depend();
                            return _value;
                        },
                        set(_newValue) {
                            if (_newValue !== _value) {
                                _value = _newValue;
                                _dependency.notify();
                            }
                        }
                    }
                );
            }
        );
        return _object;
    };

	// Service worker
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/src/j-neric-worker.js')
			.then(
				registration => {
					console.log("J-neric worker registered");
					console.log(registration);
				}
			).catch(console.log);
	}
}());