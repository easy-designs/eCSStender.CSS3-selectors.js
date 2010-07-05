/*------------------------------------------------------------------------------
Function:       eCSStender.css3-selectors.js
Author:         Aaron Gustafson (aaron at easy-designs dot net)
Creation Date:  2009-09-17
Version:        0.2
Homepage:       http://github.com/easy-designs/eCSStender.css3-selectors.js
License:        MIT License 
Note:           If you change or improve on this script, please let us know by
                emailing the author (above) with a link to your demo page.
------------------------------------------------------------------------------*/
(function(e){
  
  if ( typeof e == 'undefined' ){ return; }
  
  var
  // aliases
  $         = e.methods.findBySelector,
  supported = e.isSupported,
  embedCSS  = e.embedCSS,
  style     = e.applyWeightedStyle,
  embed     = function( selector, properties, medium )
  {
    var style_block = EMPTY, prop;
    for ( prop in properties )
    {
      if ( e.isInheritedProperty( properties, prop ) ) { continue; };
      style_block += prop + COLON + properties[prop] + SEMICOL;
    }
    if ( style_block != EMPTY )
    {
      embedCSS( selector + CURLY_O + style_block + CURLY_C, medium );
    }
  },
  inline    = function( selector, properties, medium, specificity )
  {
    if ( notScreen( medium ) ){ return; }
    try {
      var
      $els = $( selector ),
      i    = $els.length;
      while ( i-- )
      {
        style( $els[i], properties, specificity );
      }
    } catch(e) {
      throw new Error( LIB_ERROR + selector );
    }
  },
  notScreen = function( medium )
  {
    return medium != 'screen';
  },
  cleanNth  = function( selector )
  {
    return selector.replace( re_nth, '$1$2$3$4$5' );
  },
  // strings
  EASY        = 'net.easy-designs.',
  SELECTOR    = 'selector',
  PROPERTIES  = 'properties',
  SPECIFICITY = 'specificity',
  EVERYTHING  = '*',
  EMPTY       = '',
  CURLY_O     = '{',
  CURLY_C     = '}',
  PAREN_O     = '(',
  PAREN_C     = ')',
  COLON       = ':',
  SEMICOL     = ';',
  HYPHEN      = '-',
  DOT         = '.',
  LIB_ERROR   = 'Your chosen selector library does not support this selector: ',
  // Regular Expressions
  re_nth      = /(.*\()\s*(?:(\d+n?|odd|even)\s*(\+|-)?\s*(\d+)?)\s*(\).*)/g,
  // elements
  div   = document.createElement('div'),
  para  = document.createElement('p');
  
  // define our selector engine or die
  if ( ! ( $ instanceof Function ) )
  {
    throw new Error('eCSStender.methods.findBySelector is not defined. eCSStender.css3-selectors.js is quitting.');
  }
  
  // CLASSES
  // compound class selection (no other class selections seem to be an issue)
  e.register(
    { fingerprint: EASY + 'compound-class-selector',
      selector: /(?:\.\S+){2,}/,
      test:     function(){
        // the markup
        var
        d = div.cloneNode(true),
        p = para.cloneNode(true);
        p.className = 'foo';
        d.appendChild( p );
        // the test
        return ( supported( SELECTOR, 'div p.bar.foo', d, p ) );
      }
    },
    EVERYTHING,
    function( selector, properties, medium, specificity ){
      // we need to invert the selection and get anything without the first class
      var
      regex   = /((?:\.\S+){2,})/,
      classes = selector.replace( regex, '$1' ),
      false_positive, matches, j;
      // get the classes
      classes = classes.split('.');
      classes.shift();
      false_positive = classes.pop();
      // re-apply all affected styles
      matches = e.lookup( 
        {
          selector:    new RegExp( '\\.' + false_positive ),
          specificity: specificity,
          media:       medium
        },
        EVERYTHING
      );
      for ( j=0; j<matches.length; j++ )
      {
        inline( matches[j][SELECTOR], matches[j][PROPERTIES], medium, matches[j][SPECIFICITY] );
      }
    }
  );

  // PSEUDO CLASSES
  // attribute selectors
  (function(){
    var
    selectors = ['div p[title]',         // attribute
                 'div p[title="a b-c"]', // attribute value
                 'div p[title*=a]',      // substring
                 'div p[title~=a]',      // contains
                 'div p[title^=a]',      // starts with
                 'div p[title$=c]',      // ends with
                 'div p[title|=c]'],     // part of hyphen-separated list
    i = selectors.length,
    d = div.cloneNode(true),
    p = para.cloneNode(true);
    p.setAttribute('title','a b-c');
    d.appendChild( p );
    while ( i-- )
    {
      (function(selector){
        e.register(
          { fingerprint: EASY + 'attribute-selector-' + i,
            selector: /\[.*\]/,
            test:     function(){
              return ! supported( SELECTOR, selector, d, p );
            }
          },
          EVERYTHING,
          inline
        );
      })(selectors[i]);
    }    
  })();

  // :root
  //e.register(
  //  { fingerprint: EASY + 'root',
  //    selector: /:root/,
  //    test:     function(){
  //      // the markup
  //      html = document.getElementsByTagName('html')[0];
  //      // the test
  //      return ( ! supported( SELECTOR, ':root', false, html ) );
  //    }
  //  },
  //  EVERYTHING,
  //  function( selector, properties, medium, specificity ){
  //    if ( notScreen(medium) ){ return; }
  //    var els, i,
  //    /* root can only be the first element (IE gets this wrong) */
  //    root = document.getElementsByTagName('script')[0];
  //    while ( root.parentNode )
  //    {
  //      if ( root.parentNode.nodeName == '#document' ){ break; }
  //      root = root.parentNode;
  //    }
  //    try {
  //      els = $( selector );
  //      i = els.length;
  //      while ( i-- )
  //      {
  //        if ( els[i] !== root ) { continue; }
  //        style( els[i], properties, specificity );
  //      }
  //    } catch(e) {
  //      // throw new Error( LIB_ERROR + selector );
  //    }
  //  }
  //);

  // nth-child
  e.register(
    { fingerprint: EASY + 'nth-child',
      selector: /:nth-child\(\s*(?:even|odd|[+-]?\d+|[+-]?\d*?n(?:\s*[+-]\s*\d*)?)\s*\)/,
      test:     function(){
        // the markup
        var
        d = div.cloneNode(true),
        p = para.cloneNode(true);
        d.appendChild( p );
        // the test
        return ( ! supported( SELECTOR, 'div p:nth-child( 2n + 1 )', d, p ) );
      }
    },
    EVERYTHING,
    function( selector, properties, medium, specificity )
    {
      selector = cleanNth( selector );
      // secondary test to see if the browser just doesn't like spaces in the parentheses
      var
      calc = 'p:nth-child(2n+1)',
      d = div.cloneNode(true),
      p = para.cloneNode(true),
      func = inline;
      d.appendChild( p );
      // embedding is the way to go
      if ( ( supported( SELECTOR, 'p:nth-child(odd)', d, p ) &&
             ! supported( SELECTOR, calc, d, p ) &&
             selector.match( /:nth-child\(\s*(?:even|odd)\s*\)/ ) != null ) ||
           supported( SELECTOR, calc, d, p ) )
      {
        
        func = embedNth;
      }
      func( selector, properties, medium, specificity );
      return func;
    }
  );

  // :nth-last-child
  e.register(
    { fingerprint: EASY + 'nth-last-child',
      selector: /:nth-last-child\(\s*(?:even|odd|[+-]?\d*?|[+-]?\d*?n(?:\s*[+-]\s*\d*?)?)\s*\)/,
      test:     function(){
        // the markup
        var
        d = div.cloneNode(true),
        p = para.cloneNode(true);
        d.appendChild( p );
        // the test
        return ( ! supported( SELECTOR, 'div p:nth-last-child( 2n + 1 )', d, p ) );
      }
    },
    EVERYTHING,
    function( selector, properties, medium, specificity ){
      selector = cleanNth( selector );
      // secondary test to see if the browser just doesn't like spaces in the parentheses
      var
      calc = 'p:nth-last-child(2n+1)',
      d = div.cloneNode(true),
      p = para.cloneNode(true),
      func = inline;
      d.appendChild( p );
      // embedding is the way to go
      if ( ( supported( SELECTOR, 'p:nth-last-child(odd)', d, p ) &&
             ! supported( SELECTOR, calc, d, p ) &&
             selector.match( /:nth-last-child\(\s*(?:even|odd)\s*\)/ ) != null ) ||
           supported( SELECTOR, calc, d, p ) )
      {
        
        func = embedNth;
      }
      func( selector, properties, medium, specificity );
      return func;
    }
  );
  
  // :nth-of-type, :nth-last-of-type
  e.register(
    { selector: /:nth-(?:last-)?of-type\(\s*(?:even|odd|[+-]?\d*?|[+-]?\d*?n(?:\s*[+-]\s*\d*?)?)\s*\)/,
      test:     function(){
        // the markup
        var
        d = div.cloneNode(true),
        p = para.cloneNode(true);
        d.appendChild( p );
        // the test
        return ( ! supported( SELECTOR, 'div p:nth-of-type( 2n + 1 )', d, p ) );
      }
    },
    EVERYTHING,
    inline
  );
  
  // :(first|last|only)-child
  (function(){
    var
    selectors = { 'div :first-child': /:first-child/,
                  'div :last-child':  /:last-child/,
                  'div :only-child':  /:only-child/ },
    selector,
    d = div.cloneNode(true),
    p = para.cloneNode(true);
    d.appendChild( p );
    for ( selector in selectors )
    {
      (function( selector, lookup ){
         e.register(
           { fingerprint: EASY + lookup.toString().replace(/[\/:]/g,''),
             selector: lookup,
             test:     function(){
               return ! supported( SELECTOR, selector, d, p );
             }
           },
           EVERYTHING,
           inline
         );
      })( selector, selectors[selector] );
    }
  })();
  
  // :(first|last|only)-of-type
  (function(){
    var
    selectors = { 'div p:first-of-type': /:first-of-type/,
                  'div p:last-of-type':  /:last-of-type/,
                  'div div:only-of-type':  /:only-of-type/ },
    d  = div.cloneNode(true),
    d2 = div.cloneNode(true),
    p  = para.cloneNode(true),
    p2 = para.cloneNode(true);
    d.appendChild( p );
    d.appendChild( p2 );
    d.appendChild( d2 );
    for ( selector in selectors )
    {
      (function( selector, lookup ){
         e.register(
           { fingerprint: EASY + lookup.toString().replace(/[\/:]/g,''),
             selector: lookup,
             test:     function(){
               return ! supported( SELECTOR, selector, d, p );
             }
           },
           EVERYTHING,
           inline
         );
      })( selector, selectors[selector] );
    }
  })();
  
  // :empty
  eCSStender.register(
    { selector: /:empty/,
      test:     function(){
        // the markup
        var
        d = div.cloneNode(true),
        p = para.cloneNode(true);
        d.appendChild( p );
        // the test
        return ( ! supported( SELECTOR, 'div p:empty', d, p ) );
      }
    },
    EVERYTHING,
    inline
  );

  // :target
  // How do we test this one?

  // :lang()
  e.register(
    { selector: /:lang\(.*\)/,
      test:     function(){
        // the markup
        var
        d = div.cloneNode(true),
        p = para.cloneNode(true);
        p.setAttribute('lang','en');
        d.appendChild( p );
        // the test
        return ( ! supported( 'selector', 'div p:lang(en)', d, p ) );
      }
    },
    EVERYTHING,
    function( selector, properties, medium, specificity )
    {
      var func = inline, $els;
      // fix for selector engines that don't implement lang()
      try {
        $els = $(selector);
      } catch( e ) {
        func = function( selector, properties, medium, specificity )
        {
          selector = selector.replace( /:lang\(([^)]*)\)/, '[lang=$1]' );
          inline( selector, properties, medium, specificity );
        };
      }
      func( selector, properties, medium, specificity );
      return func;
    }
  );

  // :enabled/:disabled/:checked
  eCSStender.register(
    { selector: /:(?:(?:en|dis)abled|checked)/,
      test:     function(){
        // the markup
        var
        d = div.cloneNode(true),
        inputs, i1, i2, i3;
        d.innerHTML = '<input type="text" /><input type="text" disabled="disabled" /><input type="checkbox" checked="checked" />';
        inputs = d.getElementsByTagName('input');
        i1 = inputs[0];
        i2 = inputs[1];
        i3 = inputs[2];
        // the test
        return ( ! supported( SELECTOR, 'div :enabled', d, i1 ) ||
                 ! supported( SELECTOR, 'div :disabled', d, i2 ) ||
                 ! supported( SELECTOR, 'div :checked', d, i3 ) );
      }
    },
    EVERYTHING,
    // TODO: need to make these dynamic which means adding and removing styles
    // (and keeping track of the previous versions)
    inline
  );

  // :first-line/:first-letter/::first-line/::first-letter
  // how do we handle these?

  // :before/:after/::before/::after
  // need a clean element

  // :not
  e.register(
    { selector: /:not\([^)]*\)/,
      test:     function(){
        // the markup
        var
        d  = div.cloneNode(true),
        p  = para.cloneNode(true),
        p2 = para.cloneNode(true);
        p.setAttribute('id','no');
        d.appendChild( p );
        d.appendChild( p2 );
        // the test
        return ( ! supported( SELECTOR, 'div p:not(#no)', d, p2 ) );
      }
    },
    EVERYTHING,
    inline
  );
  
  // adjacent siblings
  e.register(
    { selector: function(){
        return ( this.match(/\+/) &&
                 ! this.match( /:nth-(?:last-)?(?:child|of-type)\(\s*(?:even|odd|[+-]?\d*?|[+-]?\d*?n(?:\s*[+-]\s*\d*?)?)\s*\)/ ) );
      },
      test:     function(){
        // the markup
        var
        d  = div.cloneNode(true),
        p  = para.cloneNode(true),
        p2 = para.cloneNode(true);
        d.appendChild( p );
        d.appendChild( p2 );
        // the test
        return ( ! supported( SELECTOR, 'div p + p', d, p2 ) );
      }
    },
    EVERYTHING,
    inline
  );

  // general sibling
  e.register(
    { selector: /~[^=]/,
      test:     function(){
        // the markup
        var
        d  = div.cloneNode(true),
        p  = para.cloneNode(true),
        p2 = para.cloneNode(true),
        p3 = para.cloneNode(true);
        d.appendChild( p );
        d.appendChild( p2 );
        d.appendChild( p3 );
        // the test
        return ( ! supported( SELECTOR, 'div p ~ p', d, p3 ) );
      }
    },
    EVERYTHING,
    inline
  );
  
})(eCSStender);