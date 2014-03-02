/**
 * @fileOverview 让内部各个部件的代码可以用[amd](https://github.com/amdjs/amdjs-api/wiki/AMD)模块定义方式组织起来。
 *
 * AMD API 内部的简单不完全实现，请忽略。只有当WebUploader被合并成一个文件的时候才会引入。
 */
(function( root, factory ) {
    var modules = {},

    // 简单不完全实现https://github.com/amdjs/amdjs-api/wiki/require
    require2 = function( deps, callback ) {
        var args, len, i;

        // 如果deps不是数组，则直接返回指定module
        if ( typeof deps === 'string' ) {
            return getModule( deps );
        } else {
            args = [];
            for( len = deps.length, i = 0; i < len; i++ ) {
                args.push( getModule( deps[ i ] ) );
            }

            return callback.apply( null, args );
        }
    },

    // 内部的define，暂时不支持不指定id.
    define2 = function( id, deps, factory ) {
        if ( arguments.length === 2 ) {
            factory = deps;
            deps = null;
        }

        require2( deps || [], function() {
            setModule( id, factory, arguments );
        });
    },

    // 设置module, 兼容CommonJs写法。
    setModule = function( id, factory, args ) {
        var module = {
                exports: factory
            },
            returned;

        if ( typeof factory === 'function' ) {
            args.length || (args = [ require2, module.exports, module ]);
            returned = factory.apply( null, args );
            returned !== undefined && (module.exports = returned);
        }

        modules[ id ] = module.exports;
    },

    // 根据id获取module
    getModule = function( id ) {
        var module = modules[ id ] || root[ id ];

        if ( !module ) {
            throw new Error( '`' + id + '` is undefined' );
        }

        return module;
    },

    // 将所有modules，将路径ids装换成对象。
    exportsTo = function( obj ) {
        var key, host, parts, part, last, ucFirst;

        // make the first character upper case.
        ucFirst = function( str ) {
            return str && (str.charAt( 0 ).toUpperCase() + str.substr( 1 ));
        };

        for ( key in modules ) {
            host = obj;

            if ( !modules.hasOwnProperty( key ) ) {
                continue;
            }

            parts = key.split('/');
            last = ucFirst( parts.pop() );

            while( (part = ucFirst( parts.shift() )) ) {
                host[ part ] = host[ part ] || {};
                host = host[ part ];
            }

            host[ last ] = modules[ key ];
        }
    };

    if ( typeof module === 'object' && typeof module.exports === 'object' ) {

        // For CommonJS and CommonJS-like environments where a proper window is present,
        module.exports = factory( root, define2, require2 );
        exportsTo( module.exports );
    } else if ( typeof define === 'function' && define.amd ) {

        // Allow using this built library as an AMD module
        // in another project. That other project will only
        // see this AMD call, not the internal modules in
        // the closure below.
        define([], factory );
    } else {

        // Browser globals case. Just assign the
        // result to a property on the global.
        origin = root.WebUploader;
        root.WebUploader = factory( root, define2, require2 );
        exportsTo( root.WebUploader );
        root.WebUploader.noConflict = function() {
            root.WebUploader = origin;
        };
    }
})( this, function( window, define, require ) {

