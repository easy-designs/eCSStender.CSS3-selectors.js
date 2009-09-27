(function(Sizzle){
  // CLASSES
  // compound class selection (no other class selections seem to be an issue)
  eCSStender.register(
    { 'selector': /\.\S+?\.\S+/,
      'test':     function(){
        // the markup
        var
        div = document.createElement('div'),
        p   = document.createElement('p');
        p.className = 'foo';
        div.appendChild( p );
        // the test
        return ( eCSStender.isSupported( 'selector', 'div p.bar.foo', div, p ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      // we need to invert the selection and get anything without the first class
      var
      classes = selector.replace( /.*?((?:\.\S+?)+)/, '$1' ),
      false_positive, matches, els, i, j, k;
      classes = classes.split('.');
      classes.shift();
      false_positive = classes.pop();
      // re-apply all affected styles
      matches = eCSStender.lookup( 
        {
          'selector':    new RegExp( '\.' + false_positive ),
          'specificity': specificity,
          'media':       medium
        },
        '*'
      );
      for ( j=0; j<matches.length; j++ )
      {
        els = Sizzle( matches[j]['selector'] );
        for ( k=0; k<els.length; k++ )
        {
          eCSStender.applyWeightedStyle( els[k], matches[j]['properties'], matches[j]['specificity'] );
        }
      }
    }
  );

  // PSEUDO CLASSES
  // attribute selectors
  eCSStender.register(
    { 'selector': /\[.*\]/,
      'test':     function(){
        // the markup
        var
        div = document.createElement('div'),
        p   = document.createElement('p');
        p.setAttribute('title','a b-c');
        div.appendChild( p );
        // the test
        return ( ! eCSStender.isSupported( 'selector', 'div p[title]', div, p ) ||
                 ! eCSStender.isSupported( 'selector', 'div p[title="a b-c"]', div, p ) ||
                 ! eCSStender.isSupported( 'selector', 'div p[title~=a]', div, p ) ||
                 ! eCSStender.isSupported( 'selector', 'div p[title^=a]', div, p ) ||
                 ! eCSStender.isSupported( 'selector', 'div p[title$=c]', div, p ) ||
                 ! eCSStender.isSupported( 'selector', 'div p[title|=c]', div, p ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      if ( medium!='screen' ){ return; }
      var els = Sizzle( selector );
      for ( i=0; i<els.length; i++ )
      {
        eCSStender.applyWeightedStyle( els[i], properties, specificity );
      }
    }
  );

  // :root
  // seems to be causing other extensions to crash
//  eCSStender.register(
//    { 'selector': /:root/,
//      'test':     function(){
//        // the markup
//        html = document.getElementsByTagName('html')[0];
//        // the test
//        return ( ! eCSStender.isSupported( 'selector', ':root', false, html ) );
//      }
//    },
//    '*',
//    function( selector, properties, medium, specificity ){
//      if ( medium!='screen' ){ return; }
//      var els = Sizzle( selector ),
//      /* root can only be the first element (IE gets this wrong) */
//      root = document.getElementsByTagName('script')[0];
//      while ( root.parentNode )
//      {
//        if ( root.parentNode.nodeName == '#document' ){ break; }
//        root = root.parentNode;
//      }
//      for ( i=0; i<els.length; i++ )
//      {
//        if ( els[i] !== root ) { continue; }
//        eCSStender.applyWeightedStyle( els[i], properties, specificity );
//      }
//    }
//  );

  // nth-child
  eCSStender.register(
    { 'selector': /:nth-child\(\s*(?:even|odd|[+-]?\d+|[+-]?\d*?n(?:\s*[+-]\s*\d*?)?)\s*\)/,
      'test':     function(){
        // the markup
        var
        div = document.createElement('div'),
        p   = document.createElement('p');
        div.appendChild( p );
        // the test
        return ( ! eCSStender.isSupported( 'selector', 'div p:nth-child( odd )', div, p ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      selector = selector.replace( /(child\()\s*/g, '$1' ).replace( /\s*(\+)\s*/g, '$1' ).replace( /\s*(\))/g, '$1' );
      // secondary test to see if the browser just doesn't like spaces in the parentheses
      // the markup
      var
      style_block = selector + ' {',
      prop, els, i,
      div   = document.createElement('div'),
      p     = document.createElement('p');
      div.appendChild( p );
      // embedding is the way to go
      if ( ( eCSStender.isSupported( 'selector', 'p:nth-child(odd)', div, p ) &&
             ! eCSStender.isSupported( 'selector', 'p:nth-child(2n+1)', div, p ) &&
             selector.match( /:nth-child\(\s*(?:even|odd)\s*\)/ ) != null ) ||
           eCSStender.isSupported( 'selector', 'p:nth-child(2n+1)', div, p ) )
      {
        for ( prop in properties )
        {
          if ( eCSStender.isInheritedProperty( properties, prop ) ) { continue; };
          style_block += prop + ': ' + properties[prop] + '; ';
        }
        style_block += '} ';
        eCSStender.embedCSS( style_block, medium );
      }
      // no nth-child support natively, so inline is only option
      else
      {
        els = Sizzle( selector );
        for ( i=0; i<els.length; i++ )
        {
          eCSStender.applyWeightedStyle( els[i], properties, specificity );
        }
      }
    }
  );

  // :nth-last-child - has an issue in IE: selects all
  eCSStender.register(
    { 'selector': /:nth-last-child\(\s*(?:even|odd|[+-]?\d*?|[+-]?\d*?n(?:\s*[+-]\s*\d*?)?)\s*\)/,
      'test':     function(){
        // the markup
        var
        div = document.createElement('div'),
        p   = document.createElement('p');
        div.appendChild( p );
        // the test
        return ( ! eCSStender.isSupported( 'selector', 'div p:nth-last-child( odd )', div, p ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      selector = selector.replace( /(child\()\s*/g, '$1' ).replace( /\s*(\+)\s*/g, '$1' ).replace( /\s*(\))/g, '$1' );
      // secondary test to see if the browser just doesn't like spaces in the parentheses
      // the markup
      var
      style_block = selector + ' {',
      prop, els, i,
      div   = document.createElement('div'),
      p     = document.createElement('p');
      div.appendChild( p );
      // embedding is the way to go
      if ( ( eCSStender.isSupported( 'selector', 'p:nth-last-child(odd)', div, p ) &&
             ! eCSStender.isSupported( 'selector', 'p:nth-last-child(2n+1)', div, p ) &&
             selector.match( /:nth-last-child\(\s*(?:even|odd)\s*\)/ ) != null ) ||
           eCSStender.isSupported( 'selector', 'p:nth-last-child(2n+1)', div, p ) )
      {
        for ( prop in properties )
        {
          if ( eCSStender.isInheritedProperty( properties, prop ) ) { continue; };
          style_block += prop + ': ' + properties[prop] + '; ';
        }
        style_block += '} ';
        eCSStender.embedCSS( style_block, medium );
      }
      // no nth-child support natively, so inline is only option
      else
      {
        els = Sizzle( selector );
        for ( i=0; i<els.length; i++ )
        {
          eCSStender.applyWeightedStyle( els[i], properties, specificity );
        }
      }
    }
  );

  // :nth-of-type, :nth-last-of-type - has an issue in IE6 - selects all
  eCSStender.register(
    { 'selector': /:nth-(?:last-)?of-type\(\s*(?:even|odd|[+-]?\d*?|[+-]?\d*?n(?:\s*[+-]\s*\d*?)?)\s*\)/,
      'test':     function(){
        // the markup
        var
        div = document.createElement('div'),
        p   = document.createElement('p');
        div.appendChild( p );
        // the test
        return ( ! eCSStender.isSupported( 'selector', 'div p:nth-of-type( odd )', div, p ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      selector = selector.replace( /(type\()\s*/g, '$1' ).replace( /\s*(\+)\s*/g, '$1' ).replace( /\s*(\))/g, '$1' );
      var els = Sizzle( selector );
      for ( i=0; i<els.length; i++ )
      {
        eCSStender.applyWeightedStyle( els[i], properties, specificity );
      }
    }
  );

  // :first-child
  eCSStender.register(
    { 'selector': /:first-child/,
      'test':     function(){
        // the markup
        var
        div = document.createElement('div'),
        p   = document.createElement('p');
        div.appendChild( p );
        // the test
        return ( ! eCSStender.isSupported( 'selector', 'div :first-child', div, p ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      var els = Sizzle( selector );
      for ( i=0; i<els.length; i++ )
      {
        eCSStender.applyWeightedStyle( els[i], properties, specificity );
      }
    }
  );

  // :last-child/:only-child
  eCSStender.register(
    { 'selector': /:(?:last|only)-child/,
      'test':     function(){
        // the markup
        var
        div = document.createElement('div'),
        p   = document.createElement('p');
        div.appendChild( p );
        // the test
        return ( ! eCSStender.isSupported( 'selector', 'div :last-child', div, p ) ||
                 ! eCSStender.isSupported( 'selector', 'div :only-child', div, p ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      var els = Sizzle( selector );
      for ( i=0; i<els.length; i++ )
      {
        eCSStender.applyWeightedStyle( els[i], properties, specificity );
      }
    }
  );

  // :first-of-type/:last-of-type/:only-of-type
  // seems to be causing other extensions to crash
//  eCSStender.register(
//    { 'selector': /:(?:first|last|only)-of-type/,
//      'test':     function(){
//        // the markup
//        var
//        div  = document.createElement('div'),
//        div2 = div.cloneNode(true),
//        p    = document.createElement('p'),
//        p2   = p.cloneNode(true);
//        div.appendChild( p );
//        div.appendChild( p2 );
//        div.appendChild( div );
//        // the test
//        return ( ! eCSStender.isSupported( 'selector', 'div p:first-of-type', div, p ) ||
//                 ! eCSStender.isSupported( 'selector', 'div p:last-of-type', div, p2 ) ||
//                 ! eCSStender.isSupported( 'selector', 'div div:only-of-type', div, div2 ) );
//      }
//    },
//    '*',
//    function( selector, properties, medium, specificity ){
//      var els = Sizzle( selector );
//      for ( i=0; i<els.length; i++ )
//      {
//        eCSStender.applyWeightedStyle( els[i], properties, specificity );
//      }
//    }
//  );

  // :empty
  eCSStender.register(
    { 'selector': /:empty/,
      'test':     function(){
        // the markup
        var
        div  = document.createElement('div'),
        p    = document.createElement('p');
        div.appendChild( p );
        // the test
        return ( ! eCSStender.isSupported( 'selector', 'div p:empty', div, p ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      var els = Sizzle( selector );
      for ( i=0; i<els.length; i++ )
      {
        eCSStender.applyWeightedStyle( els[i], properties, specificity );
      }
    }
  );

  // :target
  // How do we test this one?

  // :lang()
  eCSStender.register(
    { 'selector': /:lang\(.*\)/,
      'test':     function(){
        // the markup
        var
        div  = document.createElement('div'),
        p    = document.createElement('p');
        p.setAttribute('lang','en');
        div.appendChild( p );
        // the test
        return ( ! eCSStender.isSupported( 'selector', 'div p:lang(en)', div, p ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      // convert for Sizzle
      selector = selector.replace( /:lang\(([^)]*)\)/, '[lang=$1]' );
      var els = Sizzle( selector );
      for ( i=0; i<els.length; i++ )
      {
        eCSStender.applyWeightedStyle( els[i], properties, specificity );
      }
    }
  );

  // :enabled/:disabled/:checked
  eCSStender.register(
    { 'selector': /:(?:(?:en|dis)abled|checked)/,
      'test':     function(){
        // the markup
        var
        div  = document.createElement('div'),
        inputs, i1, i2, i3;
        div.innerHTML = '<input type="text" /><input type="text" disabled="disabled" /><input type="checkbox" checked="checked" />';
        inputs = div.getElementsByTagName('input');
        i1 = inputs[0];
        i2 = inputs[1];
        i3 = inputs[2];
        // the test
        return ( ! eCSStender.isSupported( 'selector', 'div :enabled', div, i1 ) ||
                 ! eCSStender.isSupported( 'selector', 'div :disabled', div, i2 ) ||
                 ! eCSStender.isSupported( 'selector', 'div :checked', div, i3 ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      // TODO: need to make these dynamic which means adding and removing styles
      // (and keeping track of the previous versions)
      var els = Sizzle( selector );
      for ( i=0; i<els.length; i++ )
      {
        eCSStender.applyWeightedStyle( els[i], properties, specificity );
      }
    }
  );

  // :first-line/:first-letter/::first-line/::first-letter
  // how do we handle these?

  // :before/:after/::before/::after
  // need a clean element

  // :not
  eCSStender.register(
    { 'selector': /:not\([^)]*\)/,
      'test':     function(){
        // the markup
        var
        div  = document.createElement('div'),
        p    = document.createElement('p'),
        p2   = p.cloneNode(true);
        p.setAttribute('id','no');
        // the test
        return ( ! eCSStender.isSupported( 'selector', 'div p:not(#no)', div, p2 ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      var els = Sizzle( selector );
      for ( i=0; i<els.length; i++ )
      {
        eCSStender.applyWeightedStyle( els[i], properties, specificity );
      }
    }
  );

  // adjacent sibling
  // interferes with the nth-child... adjust the RegEx
//  eCSStender.register(
//    { 'selector': /[^(]*\+[^)]*/,
//      'test':     function(){
//        // the markup
//        var
//        div  = document.createElement('div'),
//        p    = document.createElement('p'),
//        p2   = p.cloneNode(true);
//        // the test
//        return ( ! eCSStender.isSupported( 'selector', 'div p + p', div, p2 ) );
//      }
//    },
//    '*',
//    function( selector, properties, medium, specificity ){
//      var els = Sizzle( selector );
//      for ( i=0; i<els.length; i++ )
//      {
//        eCSStender.applyWeightedStyle( els[i], properties, specificity );
//      }
//    }
//  );

  // general sibling
  eCSStender.register(
    { 'selector': /[^(]*~[^)]*/,
      'test':     function(){
        // the markup
        var
        div  = document.createElement('div'),
        p    = document.createElement('p'),
        p2   = p.cloneNode(true);
        // the test
        return ( ! eCSStender.isSupported( 'selector', 'div p ~ p', div, p2 ) );
      }
    },
    '*',
    function( selector, properties, medium, specificity ){
      var els = Sizzle( selector );
      for ( i=0; i<els.length; i++ )
      {
        eCSStender.applyWeightedStyle( els[i], properties, specificity );
      }
    }
  );
  
})(Sizzle);