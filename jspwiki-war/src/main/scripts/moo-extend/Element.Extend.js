/*
    JSPWiki - a JSP-based WikiWiki clone.

    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); fyou may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/
/*
Moo-extend: String-extensions
    Element: ifClass(), addHover(),onHover(), hoverUpdate(), getDefaultValue(), observe()
*/

Element.implement({

    /*
    Function: ifClass
        Convenience function.
        Add or remove a css class from an element depending on a conditional flag.

    Arguments:
        flag : (boolean)
        T_Class : (string) css class name, add on true, remove on false
        F_Class : (string) css class name, remove on true, add on false

    Returns:
        (element) - This Element

    Examples:
    >    $("page").ifClass( i > 5, "hideMe" );
    */
    ifClass: function(flag, trueClass, falseClass){

        trueClass = trueClass || "";
        falseClass = falseClass || "";

        return this.addClass(flag ? trueClass : falseClass).removeClass(flag ? falseClass : trueClass);

    },

    /*
    Function: wrapChildren
        This method moves this Element around its children elements.
        The Element is moved to the position of the passed element and becomes the parent.
        All child-nodes are moved to the new element.

    Arguments:
        el - DOM element.

    Returns:
        (element) This Element.

    DOM Structure:
    (start code)
        //before
        div#firstElement
            <children>

        //javaScript
        var secondElement = "div#secondElement".slick();
        secondElement.wrapChildren($("myFirstElement"));

        //after
        div#firstElement
            div#secondElement
            <children>
    (end)
    */
    /*CHECKME: obsolete ??
    wrapChildren : function(el){

        while( el.firstChild ){ this.appendChild( el.firstChild ); }
        el.appendChild( this ) ;
        return this;

    },
    */

    /*
    Function: addHover
        Shortcut function to add a css class to an element on mouseenter,
        and remove it again on mouseleave.
        This allows to support :hover effects on all elements, also in IE.
        Obsolete

    Arguments
        clazz - (optional) hover class-name, default is {{hover}}

    Returns:
        (element) - This Element

    Examples:
    >    $("thisElement").addHover();
    */
    addHover: function( clazz ){

        clazz = clazz || "hover";

        return this.addEvents({
            mouseenter: function(){ this.addClass(clazz); },
            mouseleave: function(){ this.removeClass(clazz); }
        });

    },

    /*
    Function: onHover
        Turns a DOM element into a hoverable menu.

    Arguments:
        toggle - (string,optional) A CSS selector to match the hoverable toggle element
        onOpen - (function, optional) Function which is call when opening the menu

    Example
    > $("li.dropdown-menu").onHover("ul");
    */
    onHover: function( toggle, onOpen ){

        var element = this;

        if( toggle = element.getParent(toggle) ){

             element.fade("hide");  //CHECKME : is this sill needed, menu should be hidden/visible depending on .open

             toggle.addEvents({
                mouseenter: function(){
                    element.fade(0.9);
                    toggle.addClass("open");
                    if(onOpen){ onOpen(); }
                },
                mouseleave: function(){
                    element.fade(0);
                    toggle.removeClass("open");
                }
            });

        }
        return element;
    },

    /*
    Function: onToggle
        Set/reset ".active" class of an element, based on click events received on
        the element referred to by the "data-toggle" attribute.

    Arguments:
        toggle - A CSS selector of clickable toggle buttons
            The selector "buttons" is used to style a group of checkboxes or radio-buttons.  (ref. Bootstrap)

        active - CSS classname to toggle this element (default is ".active" )

    Example
    (start code)
       wiki.add("[data-toggle]", function(element){
           element.onToggle( element.get("data-toggle") );
       })
    (end)

    DOM Structure
    (start code)
        //normal toggle case
        div[data-toggle="button#somebutton"](.active)
        ..
        button#somebutton Click here to toggle that

        //special toggle case with "buttons" selector
        div.btn-group[data-toggle="buttons"]
            label.btn.btn-default(.active)
                input[type="radio"][name="aRadio"] checked="checked" value="One" />
            label.btn.btn-default(.active)
                input[type="radio"][name="aRadio"] value="Two" />

    (end)

    */
    onToggle: function( toggle, callback ){

        var element = this,
            active = "active";

        if( toggle == "buttons" ){

            toggle = function(event){
                //FIXME: differentiate between radioboxes and checkboxes
                element.getElements("." + active).removeClass(active);
                //console.log(element.getElements(":checked !>").length, element);
                element.getElements(":checked !>").addClass(active);
            };
            toggle();
            element.addEvent("click", toggle);

        } else {

            //if(!document.getElements(toggle)[0]){ console.log("toggle error:",toggle); }
            document.getElements(toggle).addEvent("click", function(event){
                event.stop();
                element.toggleClass( active );

                if( callback ){
                    callback( element.hasClass(active) );
                }
            });

        }
        return element;

    },

    /*
    Function onModal
        Open a modal dialog with ""message"".

        Used on clickable elements (input, button, a.href) to get a
        confirmation prior to executing the default behaviour of the CLICK.

    Example:
    (start code)
        <a href="..." data-modal=".modal">
             <div class=".modal">Are your really sure?</div>
        </a>

        behavior.add("[data-modal]", function(element){
            element.onModal( element.get("data-modal") );
        });
    (end)

    */
    onModal: function( selector ){

        var self = this,
            modal = self.getElement(selector);

        function doSelfEvent(event){

            modal.addClass( "active" );
            document.body.addClass( "show-modal" );
            event.preventDefault(); //postpone the click event
        }

        function doModalEvent(){

            modal.removeClass( "active" );
            document.body.removeClass( "show-modal" );

            if( this.match(".btn-primary") ){
                self.removeEvent( "click" , doSelfEvent ).click();
            }
        }

        if( modal ){

            //build a pretty modal dialog
            if( !modal.getElement("> modal-footer") ){
                modal.grab([
                    "div.modal-footer", [
                        "button.btn.btn-primary", { text: "Confirm" },
                        "button.btn.btn-danger", { text: "Cancel" },
                    ]
                ].slick());
            }
            //move it just before the backdrop element for easy css styling
            modal.inject( document.getBackdrop(), "before" )
                 .addEvent( "click:relay(.btn)",  doModalEvent );

            self.addEvent( "click" , doSelfEvent );
        }
    },

    /*
    Function sticky
        Simulate "position:sticky".
        Keep the element fixed on the screen, during scrolling.
        Only supports top-bottom scrolling.

    Example:
    (start code)
        //css
        .sticky {
            display:block;
            + .sticky-spacer { .hide; }
        }
        .stickyOn {
            position: fixed;
            top: 0;
            z-index: @sticky-index;

            // avoid page-bump when sticky become "fixed", by adding a spacer with its height
            + .sticky-spacer { .show; }
        }

        wiki.add(".sticky", function(element){ element.onSticky() );  });
    (end)
    */
    onSticky: function(){

        //FFS: check for native position:sticky support
        var element = this,
            origWidth = element.offsetWidth,
            origOffset = element.getPosition(document.body).y, //get offset relative to the doc.body
            on;

        "div.sticky-spacer".slick({styles: {height: element.offsetHeight} }).inject(element, "after");

        //FFS: consider adding throttle to limit event invocation rate eg "scroll:throttle"
        document.addEvent("scroll", function(){

            on = ( window.scrollY >= origOffset );

            element.ifClass(on, "stickyOn").setStyle("width", on ? origWidth : "" );
            //take care of the "inherited" width
            //set the width of the fixed element, because "position:fixed" is relative to the document,
            //therefore the element may loose inherited box widths (FFS: quid other inherited styles ??)

        });
    },

    /*
    Function: getDefaultValue
        Returns the default value of a form element.
        Inspired by get("value") of mootools, v1.1

    Note:
        Checkboxes will return true/false depending on the default checked status.
        ( input.checked to read actual value )
        The value returned in a POST will be input.get("value")
        and is depending on the value set by the "value" attribute (optional)

    Returns:
        (value) - the default value of the element; or false if not applicable.

    Examples:
    > $("thisElement").getDefaultValue();
    */
    getDefaultValue: function(){

        var self = this,
            type = self.get("type"),
            values = [];

        switch( self.get("tag") ){

            case "select":

                Array.from(this.options).each( function(option){

                    if (option.defaultSelected){ values.push(option.value || option.text); }

                });

                return (self.multiple) ? values : values[0];

            case "input":

                if( type == "checkbox" ){   //checkbox.get-value = returns "on" on some browsers, T/F on others

                    //console.log("pipo", self.get("value"), self.value, self.checked, self.defaultChecked);
                    //console.log("input[type=checkbox]" + (self.defaultChecked ? ":checked" : "")).slick().get("value") );
                    //return ("input[type=checkbox]" + (self.defaultChecked ? ":checked" : "")).slick().get("value");
                    return self.defaultChecked;

                }

                if( !"radio|hidden|text|password".test(type) ){ break; }

            case "textarea":

                return self.defaultValue;

            default: return false;

        }

    },

    /*
    Function: groupChildren(start, grab)
        groups lists of children, which are delimited by certain DOM elements.

    Arguments
        - start : (string) css selector to match delimiting DOM elements
        - grab : (string) css selector, grabs a subset of dom elements
                    and replaces the start element
        - replacesFn: (callback function) called at the point of replacing the
                start-element with the grab-element

    DOM Structure:
    (start code)
        //before groupChildren(start,grab)
        start
        b
        b
        start
        b
        //after groupChildren(start,grab)
        grab [data-inherit="{text:.<start.text>.,id:.<start.id>.}"]
            b
            b
        grab [data-inherit="{text:.<start.text>.,id:.<start.id>.}"]
            b

    Example:
    >   el.groupChildren(/hr/i,"div.col");
    >   el.groupChildren(/h[1-6]/i,"div.col");
    >   el.groupChildren( container.getTag(), "div");
    */
    groupChildren: function(start, grab, replacesFn){

        var next,
            group = grab.slick().inject(this, "top"),
            firstGroupDone = false;

        //need at least one start element to get going
        if( this.getElement(start) ){

            while( next = group.nextSibling ){

                if( ( next.nodeType == 1 ) && next.match(start) ){  //start a new group

                    if( firstGroupDone ){ group = grab.slick(); } //make a new group
                    if( replacesFn ){ replacesFn(group, next); }
                    group.replaces( next );  //destroys the matched start element
                    firstGroupDone = true;

                } else {

                    group.appendChild( next );  //grab all other elements in the group

                }
            }
        }
        return this;
    },

    /*
    Function: observe
        Observe a dom element for changes, and trigger a callback function.

    Arguments:
        fn - callback function
        options - (object)
        options.event - (string) event-type to observe, default = "keyup"
        options.delay - (number) timeout in ms, default = 300ms

    Example:
    >    $(formInput).observe(function(){
    >        alert("my value changed to "+this.get("value") );
    >    });

    */
    observe: function(callback, options){

        var element = this,
            value = element.get("value"),
            event = (options && options.event) || "keyup",
            delay = (options && options.delay) || 300,
            timer = null;

        return element.set({autocomplete: "off"}).addEvent(event, function(){

            var v = element.get("value");

            if( v != value ){
                value = v;
                //console.log("observer ",v);
                clearTimeout( timer );
                timer = callback.delay(delay, element);
            }

        });

    }

});


Document.implement({

    getBackdrop : function(){

        var body = document.body;
        return body.getElement(".backdrop") || "div.backdrop".slick().inject(body);

    }

});
