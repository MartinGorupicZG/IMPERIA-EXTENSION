/*----------------------------------------------------------------------------\
|                                Slider 1.02                                  |
|-----------------------------------------------------------------------------|
|                         Created by Erik Arvidsson                           |
|                  (http://webfx.eae.net/contact.html#erik)                   |
|                      For WebFX (http://webfx.eae.net/)                      |
|-----------------------------------------------------------------------------|
| A  slider  control that  degrades  to an  input control  for non  supported |
| browsers.                                                                   |
|-----------------------------------------------------------------------------|
|                Copyright (c) 2002, 2003, 2006 Erik Arvidsson                |
|-----------------------------------------------------------------------------|
| Licensed under the Apache License, Version 2.0 (the "License"); you may not |
| use this file except in compliance with the License.  You may obtain a copy |
| of the License at http://www.apache.org/licenses/LICENSE-2.0                |
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - |
| Unless  required  by  applicable law or  agreed  to  in  writing,  software |
| distributed under the License is distributed on an  "AS IS" BASIS,  WITHOUT |
| WARRANTIES OR  CONDITIONS OF ANY KIND,  either express or implied.  See the |
| License  for the  specific language  governing permissions  and limitations |
| under the License.                                                          |
|-----------------------------------------------------------------------------|
| Dependencies: timer.js - an OO abstraction of timers                        |
|               range.js - provides the data model for the slider             |
|               winclassic.css or any other css file describing the look      |
|-----------------------------------------------------------------------------|
| 2002-10-14 | Original version released                                      |
| 2003-03-27 | Added a test in the constructor for missing oElement arg       |
| 2003-11-27 | Only use mousewheel when focused                               |
| 2006-05-28 | Changed license to Apache Software License 2.0.                |
|-----------------------------------------------------------------------------|
| Created 2002-10-14 | All changes are in the log above. | Updated 2006-05-28 |
\----------------------------------------------------------------------------*/

Slider.isSupported = typeof document.createElement != "undefined" &&
    typeof document.documentElement != "undefined" &&
    typeof document.documentElement.offsetWidth == "number";


function Slider(oElement, oInput, sOrientation) {
    if (!oElement) return;
    this._orientation = sOrientation || "horizontal";
    this._elWidth = slideWidth;
    this._handWidth = defHandleWidth;
    this._range = new Range();
    this._range.setExtent(0);
    this._blockIncrement = 10;
    this._unitIncrement = 1;
    this._timer = new Timer(100);
    this._dir = 0;


    if (Slider.isSupported && oElement) {

        this.document = oElement.ownerDocument || oElement.document;

        this.element = oElement;
        this.element.slider = this;
        this.element.unselectable = "on";

        // add class name tag to class name
        this.element.className = this._orientation + " " + this.classNameTag + " " + this.element.className;

        // create line
        this.line = this.document.createElement("DIV");
        this.line.className = "line";
        this.line.unselectable = "on";
        this.line.appendChild(this.document.createElement("DIV"));
        this.element.appendChild(this.line);

//
        this.line2 = this.document.createElement("DIV");
        this.line2.className = "line2";
        this.line2.unselectable = "on";
        this.line2.appendChild(this.document.createElement("DIV"));
        this.element.appendChild(this.line2);

        // create handle
        this.handle = this.document.createElement("DIV");
        this.handle.className = "handle";
        this.handle.unselectable = "on";
        this.handle.appendChild(this.document.createElement("DIV"));
        this.handle.firstChild.appendChild(
            this.document.createTextNode(String.fromCharCode(160)));
        this.element.appendChild(this.handle);
    }

    this.input = oInput;

    // events
    var oThis = this;
    this._range.onchange = function () {
        oThis.recalculate();
        if (typeof oThis.onchange == "function")
            oThis.onchange();
    };

    if (Slider.isSupported && oElement) {
        this.element.onfocus        = Slider.eventHandlers.onfocus;
        this.element.onblur            = Slider.eventHandlers.onblur;
        if (window.DocumentTouch && document instanceof DocumentTouch) {
//        iSektir Stuff
            this.element.ontouchstart    = Slider.eventHandlers.ontouchdown;

        }else{
            this.element.onmousedown    = Slider.eventHandlers.onmousedown;
            this.element.onmouseover    = Slider.eventHandlers.onmouseover;
            this.element.onmouseout        = Slider.eventHandlers.onmouseout;
        }

        this.element.onkeydown        = Slider.eventHandlers.onkeydown;
        this.element.onkeypress        = Slider.eventHandlers.onkeypress;
        this.element.onmousewheel    = Slider.eventHandlers.onmousewheel;
        this.handle.onselectstart    =
        this.element.onselectstart    = function () { return false; };

        this._timer.ontimer = function () {
            oThis.ontimer();
        };

        // extra recalculate for ie
        window.setTimeout(function() {
            oThis.recalculate();
        }, 1);
    }
    else {
        this.input.onchange = function (e) {
            oThis.setValue(oThis.input.value);
        };
    }
}

Slider.eventHandlers = {

    // helpers to make events a bit easier
    getEvent:    function (e, el) {
        if (!e) {
            if (el)
                e = el.document.parentWindow.event;
            else
                e = window.event;
        }
        if ((!e.srcElement)) {
            if (window.DocumentTouch && document instanceof DocumentTouch) {
                var el = e.touches[0].target;
            }else{
                var el = e.target;
            }

            while (el != null && el.nodeType != 1)
                el = el.parentNode;
            e.srcElement = el;
        }
        if (typeof e.offsetX == "undefined") {
            e.offsetX = e.layerX;
            e.offsetY = e.layerY;
        }

        return e;
    },

    getDocument:    function (e) {
        if (e.target){
            return e.target.ownerDocument;
        }
        return e.srcElement.document;
    },

    getSlider:    function (e) {
        if (window.DocumentTouch && document instanceof DocumentTouch) {
            var el = e.target || e.srcElement || e.touches[0].target || e.touches[0].srcElement;
        }else{
            var el = e.target || e.srcElement;
        }
        while (el != null && el.slider == null)    {
            el = el.parentNode;
        }
        if (el)
            return el.slider;
        return null;
    },

    getLine:    function (e) {
        if (window.DocumentTouch && document instanceof DocumentTouch) {
            var el = e.target || e.srcElement || e.touches[0].target || e.touches[0].srcElement;
        }else{
            var el = e.target || e.srcElement;
        }
        while (el != null && el.className != "line")    {
            el = el.parentNode;
        }
        return el;
    },

    getHandle:    function (e) {
        if (window.DocumentTouch && document instanceof DocumentTouch) {
            var el = e.target || e.srcElement || e.touches[0].target || e.touches[0].srcElement;
        }else{
            var el = e.target || e.srcElement;
        }
        var re = /handle/;
        while (el != null && !re.test(el.className))    {
            el = el.parentNode;
        }
        return el;
    },
    // end helpers

    onfocus:    function (e) {
        var s = this.slider;
        s._focused = true;
        s.handle.className = "handle hover";
    },

    onblur:    function (e) {
        var s = this.slider
        s._focused = false;
        s.handle.className = "handle";
    },

    onmouseover:    function (e) {
        e = Slider.eventHandlers.getEvent(e, this);
        var s = this.slider;
        if (e.srcElement == s.handle)
            s.handle.className = "handle hover";
    },

    onmouseout:    function (e) {
        e = Slider.eventHandlers.getEvent(e, this);
        var s = this.slider;
        if (e.srcElement == s.handle && !s._focused)
            s.handle.className = "handle";
    },
getElementPosition:function(e){
    var offsetTrail = e.srcElement? e.srcElement: e.target;
    if (window.DocumentTouch && document instanceof DocumentTouch) {
        offsetTrail = e.touches[0].srcElement? e.touches[0].srcElement: e.touches[0].target;
    }
    var offsetLeft = 0;
    var offsetTop = 0;
    while (offsetTrail){
        offsetLeft += offsetTrail.offsetLeft;
        offsetTop += offsetTrail.offsetTop;
        offsetTrail = offsetTrail.offsetParent;
    }
    if (navigator.userAgent.indexOf('Mac') != -1 && typeof document.body.leftMargin != 'undefined'){
        offsetLeft += document.body.leftMargin;
        offsetTop += document.body.topMargin;
    }
    return {left:offsetLeft,top:offsetTop};
},

    onmousedown:    function (e) {
        e = Slider.eventHandlers.getEvent(e, this);
        document.body.style.MozUserSelect="none";
        document.body.style.WebkitUserSelect="none";
        var s = this.slider;
        if (s.element.focus)
            s.element.focus();

        Slider._currentInstance = s;
        var doc = s.document;

        if (doc.addEventListener) {
            doc.addEventListener("mousemove", Slider.eventHandlers.onmousemove, true);
            doc.addEventListener("mouseup", Slider.eventHandlers.onmouseup, true);
        }
        else if (doc.attachEvent) {
            doc.attachEvent("onmousemove", Slider.eventHandlers.onmousemove);
            doc.attachEvent("onmouseup", Slider.eventHandlers.onmouseup);
            doc.attachEvent("onlosecapture", Slider.eventHandlers.onmouseup);
            s.element.setCapture();
        }
        if (Slider.eventHandlers.getHandle(e)) {    // start drag
            Slider._sliderDragData = {
                screenX:    e.screenX,
                screenY:    e.screenY,
                dx:            e.screenX - s.handle.offsetLeft,
                dx2:        e.screenX - s.line2.offsetLeft,
                dy:            e.screenY - s.handle.offsetTop,
                startValue:    s.getValue(),
                slider:        s
            };
        }
        else {
//            var lineEl = Slider.eventHandlers.getLine(e);

//            s.handle.offsetLeft=e.offsetX;
//            alert(e.offsetX+" "+s.handle.offsetLeft);
//            s.setValue(e.offsetX);


//            var s = Slider._sliderDragData.slider;

            var boundSize = s.getMaximum() - s.getMinimum();
            var size, pos, reset;

            if (s._orientation == "horizontal") {
                size = s.element.offsetWidth - s.handle.offsetWidth;
                pos = e.offsetX - (s.handle.offsetWidth/2);
                reset = Math.abs(e.screenY) > 100;

            }
            else {
                size = s.element.offsetHeight - s.handle.offsetHeight;
                pos = s.element.offsetHeight - s.handle.offsetHeight -
                    (e.screenY - Slider._sliderDragData.dy);
                reset = Math.abs(e.screenX - Slider._sliderDragData.screenX) > 100;
            }
            s.setValue(s.getMinimum() + boundSize * pos / size);
            Slider._sliderDragData = {
                screenX:    e.screenX,
                screenY:    e.screenY,
                dx:            e.screenX - s.handle.offsetLeft,
                dx2:        e.screenX - s.line2.offsetLeft,
                dy:            e.screenY - s.handle.offsetTop,
                startValue:    s.getValue(),
                slider:        s
            };
//            var lineEl = Slider.eventHandlers.getLine(e);
//            s._mouseX = e.offsetX + (lineEl ? s.line.offsetLeft : 0);
//            s._mouseY = e.offsetY + (lineEl ? s.line.offsetTop : 0);
//            s._increasing = null;
//            s.ontimer();
        }
    },

    onmousemove:    function (e) {
        e = Slider.eventHandlers.getEvent(e, this);

        if (Slider._sliderDragData) {    // drag
            var s = Slider._sliderDragData.slider;

            var boundSize = s.getMaximum() - s.getMinimum();
            var size, pos, reset;

            if (s._orientation == "horizontal") {
                size = s.element.offsetWidth - s.handle.offsetWidth;
                pos = e.screenX - Slider._sliderDragData.dx;
                reset = Math.abs(e.screenY - Slider._sliderDragData.screenY) > 100;

            }
            else {
                size = s.element.offsetHeight - s.handle.offsetHeight;
                pos = s.element.offsetHeight - s.handle.offsetHeight -
                    (e.screenY - Slider._sliderDragData.dy);
                reset = Math.abs(e.screenX - Slider._sliderDragData.screenX) > 100;
            }
            s.setValue(reset ? Slider._sliderDragData.startValue :
                        s.getMinimum() + boundSize * pos / size);

            return false;
        }
        else {
            var s = Slider._currentInstance;
            if (s != null) {
                var lineEl = Slider.eventHandlers.getLine(e);
                s._mouseX = e.offsetX + (lineEl ? s.line.offsetLeft : 0);
                s._mouseY = e.offsetY + (lineEl ? s.line.offsetTop : 0);
            }
        }

    },
    onmouseup:    function (e) {
        e = Slider.eventHandlers.getEvent(e, this);
        var s = Slider._currentInstance;
        var doc = s.document;
        document.body.style.MozUserSelect="auto";
        document.body.style.WebkitUserSelect="auto";
        if (doc.removeEventListener) {
            doc.removeEventListener("mousemove", Slider.eventHandlers.onmousemove, true);
            doc.removeEventListener("mouseup", Slider.eventHandlers.onmouseup, true);
        }
        else if (doc.detachEvent) {
            doc.detachEvent("onmousemove", Slider.eventHandlers.onmousemove);
            doc.detachEvent("onmouseup", Slider.eventHandlers.onmouseup);
            doc.detachEvent("onlosecapture", Slider.eventHandlers.onmouseup);
            s.element.releaseCapture();
        }

        if (Slider._sliderDragData) {    // end drag
            Slider._sliderDragData = null;
        }
        else {
            s._timer.stop();
            s._increasing = null;
        }
        Slider._currentInstance = null;
    },

    ontouchdown:    function (e) {
        e = Slider.eventHandlers.getEvent(e, this);
        var s = this.slider;
        if (s.element.focus)
            s.element.focus();

        Slider._currentInstance = s;
        var doc = s.document;

        if (doc.addEventListener) {
//            alert(1);
            doc.addEventListener("touchmove", Slider.eventHandlers.ontouchmove, true);
            doc.addEventListener("touchend", Slider.eventHandlers.ontouchup, true);
            doc.addEventListener("touchcancel", Slider.eventHandlers.ontouchup, true);
        }
        else if (doc.attachEvent) {
//            alert(2);
            doc.attachEvent("onmousemove", Slider.eventHandlers.onmousemove);
            doc.attachEvent("onmouseup", Slider.eventHandlers.ontouchup);
            doc.attachEvent("onlosecapture", Slider.eventHandlers.ontouchup);
            s.element.setCapture();
        }
//alert('bu');

//        if (Slider.eventHandlers.getHandle(e)) {    // start drag
//            alert(e.screenX);
//for(var key in this.args){
//            for(var key in e.touches[0]){
//                alert(key+ ' = ' +e.touches[0][key]);
//            }
//alert(e.touches[0].screenX);
//            s.setValue(10000);
//
//alert("re");
////            try to set the slider on the touch spot
//            var boundSize = s.getMaximum() - s.getMinimum();
//            var size, pos, reset;
//
//alert()
            if (s._orientation == "horizontal") {
//                size = s.element.offsetWidth - s.handle.offsetWidth;
//                pos=e.touches[0].screenX-((Slider.eventHandlers.getHandle(e))?(Slider.eventHandlers.getElementPosition(e).left-s.handle.offsetLeft):Slider.eventHandlers.getElementPosition(e).left);
//                reset = Math.abs(e.touches[0].screenY - e.touches[0].screenY) > 100;
                s.setValue(s.getMinimum() + (s.getMaximum() - s.getMinimum()) * (e.touches[0].screenX-((Slider.eventHandlers.getHandle(e))?(Slider.eventHandlers.getElementPosition(e).left-s.handle.offsetLeft):Slider.eventHandlers.getElementPosition(e).left)) / (s.element.offsetWidth - s.handle.offsetWidth));
//
            }
//            if (window.DocumentTouch && document instanceof DocumentTouch) {

//                }
//            alert(size+' '+pos+' '+reset);
//            else {
//                size = s.element.offsetHeight - s.handle.offsetHeight;
//                pos = s.element.offsetHeight - s.handle.offsetHeight -
//                    (e.touches[0].screenY - Slider._sliderDragData.dy);
//                reset = Math.abs(e.touches[0].screenX - Slider._sliderDragData.screenX) > 100;
//            }
//alert(reset ? Slider._sliderDragData.startValue :s.getMinimum() + boundSize * pos / size);



//                        dx:            e.touches[0].screenX - s.handle.offsetLeft,
//                dx2:        e.touches[0].screenX - s.line2.offsetLeft,
//                dy:            e.touches[0].screenY - s.handle.offsetTop,

//alert(e.touches[0].screenX+' - '+s.handle.offsetLeft);



            Slider._sliderDragData = {
                screenX:    e.touches[0].screenX,
                screenY:    e.touches[0].screenY,
                dx:            e.touches[0].screenX - s.handle.offsetLeft,
                dx2:        e.touches[0].screenX - s.line2.offsetLeft,
                dy:            e.touches[0].screenY - s.handle.offsetTop,
                startValue:    s.getValue(),
                slider:        s
            };
//        }
//        else {
//            var lineEl = Slider.eventHandlers.getLine(e);
////            for(var key in e.touches[0]){
////                alert(key+ ' = ' +e.touches[0][key]);
////            }
////            alert(e.offsetX);
//            s._mouseX = e.offsetX + (lineEl ? s.line.offsetLeft : 0);
//            s._mouseY = e.offsetY + (lineEl ? s.line.offsetTop : 0);
//            s._increasing = null;
//            s.ontimer();
//        }
    },

    ontouchmove:    function (e) {
//        document.ontouchmove = function(event) {
                            e.preventDefault();
//                      }
        e = Slider.eventHandlers.getEvent(e, this);

        if (Slider._sliderDragData) {    // drag
            var s = Slider._sliderDragData.slider;

            var boundSize = s.getMaximum() - s.getMinimum();
            var size, pos, reset;

            if (s._orientation == "horizontal") {
                size = s.element.offsetWidth - s.handle.offsetWidth;
                pos = e.touches[0].screenX - Slider._sliderDragData.dx;
                reset = Math.abs(e.touches[0].screenY - Slider._sliderDragData.screenY) > 100;
//                s.setValue(s.getMinimum() + (s.getMaximum() - s.getMinimum()) * (e.touches[0].screenX-((Slider.eventHandlers.getHandle(e))?(Slider.eventHandlers.getElementPosition(e).left-s.handle.offsetLeft):Slider.eventHandlers.getElementPosition(e).left)) / (s.element.offsetWidth - s.handle.offsetWidth));
            }
            else {
                size = s.element.offsetHeight - s.handle.offsetHeight;
                pos = s.element.offsetHeight - s.handle.offsetHeight -
                    (e.touches[0].screenY - Slider._sliderDragData.dy);
                reset = Math.abs(e.touches[0].screenX - Slider._sliderDragData.screenX) > 100;

            }
            s.setValue(reset ? Slider._sliderDragData.startValue :
                        s.getMinimum() + boundSize * pos / size);

            return false;
        }
        else {
            var s = Slider._currentInstance;
            if (s != null) {
                var lineEl = Slider.eventHandlers.getLine(e);
                s._mouseX = e.offsetX + (lineEl ? s.line.offsetLeft : 0);
                s._mouseY = e.offsetY + (lineEl ? s.line.offsetTop : 0);
            }
        }

    },

    ontouchup:    function (e) {
        e = Slider.eventHandlers.getEvent(e, this);
        var s = Slider._currentInstance;
        var doc = s.document;
        if (doc.removeEventListener) {
//            alert(1);
            doc.removeEventListener("touchmove", Slider.eventHandlers.ontouchmove, true);
            doc.removeEventListener("touchend", Slider.eventHandlers.ontouchup, true);
            doc.removeEventListener("touchcancel", Slider.eventHandlers.ontouchup, true);
        }
        else if (doc.detachEvent) {
//            alert(3);
            doc.detachEvent("onmousemove", Slider.eventHandlers.onmousemove);
            doc.detachEvent("onmouseup", Slider.eventHandlers.onmouseup);
            doc.detachEvent("onlosecapture", Slider.eventHandlers.onmouseup);
            s.element.releaseCapture();
        }

        if (Slider._sliderDragData) {    // end drag
            Slider._sliderDragData = null;
        }
        else {
            s._timer.stop();
            s._increasing = null;
        }
        Slider._currentInstance = null;
    },

    onkeydown:    function (e) {
        e = Slider.eventHandlers.getEvent(e, this);
        //var s = Slider.eventHandlers.getSlider(e);
        var s = this.slider;
        var kc = e.keyCode;
        switch (kc) {
            case 33:    // page up
                s.setValue(s.getValue() + s.getBlockIncrement());
                break;
            case 34:    // page down
                s.setValue(s.getValue() - s.getBlockIncrement());
                break;
            case 35:    // end
                s.setValue(s.getOrientation() == "horizontal" ?
                    s.getMaximum() :
                    s.getMinimum());
                break;
            case 36:    // home
                s.setValue(s.getOrientation() == "horizontal" ?
                    s.getMinimum() :
                    s.getMaximum());
                break;
            case 38:    // up
            case 39:    // right
                s.setValue(s.getValue() + s.getUnitIncrement());
                break;

            case 37:    // left
            case 40:    // down
                s.setValue(s.getValue() - s.getUnitIncrement());
                break;
        }

        if (kc >= 33 && kc <= 40) {
            return false;
        }
    },

    onkeypress:    function (e) {
        e = Slider.eventHandlers.getEvent(e, this);
        var kc = e.keyCode;
        if (kc >= 33 && kc <= 40) {
            return false;
        }
    },

    onmousewheel:    function (e) {
        e = Slider.eventHandlers.getEvent(e, this);
        var s = this.slider;
        if (s._focused) {
            s.setValue(s.getValue() + e.wheelDelta / 120 * s.getUnitIncrement());
            // windows inverts this on horizontal sliders. That does not
            // make sense to me
            return false;
        }
    }
};



Slider.prototype.classNameTag = "dynamic-slider-control",

Slider.prototype.setValue = function (v) {
//    this._range.setValue(v);
    this._range.setValue2(v);
    this.input.value = this.getValue();
    this.setValue2();
};
Slider.prototype.setValue2 = function () {
    var v = this.handle.style.left;

    if(v<this._range.getCminimum()){v=this._range.getCminimum();}
    if(v>this._range.getCmaximum()){v=this._range.getCmaximum();}
    if(this._dir==0){
        this.line2.style.width=v;
    }else{
//        alert(v);
        this.line2.style.left = v;
//        this.line2.style.width=(this._range.getMaximum()-v);
//        alert(this._range.getMaximum());
    }
};
//Slider.prototype.setValue2 = function () {
//    var v = this.handle.style.left;
//
//    if(v<this._range.getMinimum()){v=this._range.getMinimum()}
//    if(v>this._range.getMaximum()){v=this._range.getMaximum()}
//    this.line2.style.width=v;
//}
//Slider.prototype.setValue3 = function (v) {
//
//    c=this.handle.style.left;
//    this.line2.style.width=c;
//
//}
Slider.prototype.getValue = function () {
    return this._range.getValue();
};

Slider.prototype.setMinimum = function (v) {
    this._range.setMinimum(v);
    this.input.value = this.getValue();
};

Slider.prototype.getMinimum = function () {
    return this._range.getMinimum();
};

Slider.prototype.setMaximum = function (v) {
    this._range.setMaximum(v);
    this.input.value = this.getValue();
};

Slider.prototype.getMaximum = function () {
    return this._range.getMaximum();
};
Slider.prototype.setCminimum = function (v) {
    this._range.setCminimum(v);
    this.input.value = this.getValue();
};

Slider.prototype.getCminimum = function () {
    return this._range.getCminimum();
};

Slider.prototype.setCmaximum = function (v) {
    this._range.setCmaximum(v);
    this.input.value = this.getValue();
};

Slider.prototype.getCmaximum = function () {
    return this._range.getCmaximum();
};

Slider.prototype.setUnitIncrement = function (v) {
    this._unitIncrement = v;
};

Slider.prototype.getUnitIncrement = function () {
    return this._unitIncrement;
};

Slider.prototype.setBlockIncrement = function (v) {
    this._blockIncrement = v;
};

Slider.prototype.getBlockIncrement = function () {
    return this._blockIncrement;
};

Slider.prototype.setDirection = function (v) {
    this._dir = v;
};

Slider.prototype.getDirection = function () {
    return this._dir;
};

Slider.prototype.getOrientation = function () {
    return this._orientation;
};

Slider.prototype.setOrientation = function (sOrientation) {
    if (sOrientation != this._orientation) {
        if (Slider.isSupported && this.element) {
            // add class name tag to class name
            this.element.className = this.element.className.replace(this._orientation,
                                    sOrientation);
        }
        this._orientation = sOrientation;
        this.recalculate();

    }
};

Slider.prototype.recalculate = function() {
    if (!Slider.isSupported || !this.element) return;

    var w = this.element.offsetWidth;
    if(w == 0){w = this.element.clientWidth;}
    if(w == 0){w = this.element.scrollWidth;}
    if(w == 0){w = this._elWidth;}
    var h = this.element.offsetHeight;
    if(h == 0){h = this.element.clientHeight;}
    if(h == 0){h = this.element.scrollHeight;}
    var hw = this.handle.offsetWidth;
    if(hw == 0){hw = this.handle.clientWidth;}
    if(hw == 0){hw = this.handle.scrollWidth;}
    if(hw == 0){hw = this._handWidth;}
    var hh = this.handle.offsetHeight;
    if(hh == 0){hh = this.handle.clientHeight;}
    if(hh == 0){hh = this.handle.scrollHeight;}
    if(hh == 0){hh = this.handle.style.height;}
    var lw = this.line.offsetWidth;
    if(lw == 0){lw = this.line.clientWidth;}
    if(lw == 0){lw = this.line.scrollWidth;}
    var lh = this.line.offsetHeight;
    if(lh == 0){lh = this.line.clientHeight;}
    if(lh == 0){lh = this.line.scrollHeight;}


    // this assumes a border-box layout

    if (this._orientation == "horizontal") {
//        this.handle.style.left = (w - hw) * (this.getValue() - this.getCminimum()) /
//            (this.getCmaximum() - this.getCminimum()) + "px";
//        this.handle.style.top = (h - hh) / 2 + "px";
//        this.line2.style.width = (w - hw) * (this.getValue() - this.getCminimum()) /
//            (this.getCmaximum() - this.getCminimum()) + "px";
//
//        this.line.style.top = (h - lh) / 2 + "px";
//        this.line.style.left = hw / 2 + "px";
//
//        //this.line.style.right = hw / 2 + "px";
//        this.line.style.width = Math.max(0, w - hw - 2)+ "px";
//        this.line.firstChild.style.width = Math.max(0, w - hw - 4)+ "px";

//        alert(this.getValue() + " "+this.getMinimum());
//        alert("("+w+" - "+hw+") * ("+this.getValue()+" - "+this.getMinimum()+") /("+this.getMaximum()+" - "+this.getMinimum()+") + px");
        if(this.getMaximum()-this.getMinimum() != 0){
            this.handle.style.left = (w - hw) * (this.getValue() - this.getMinimum()) /
            (this.getMaximum() - this.getMinimum()) + "px";
        }else{
            this.handle.style.left="0px";
        }
        this.handle.style.top = (h - hh) / 2 + "px";



        if(this._dir==0){
            if(this.getMaximum()-this.getMinimum() != 0){
                this.line2.style.width = (w - hw) * (this.getValue() - this.getMinimum()) /
                (this.getMaximum() - this.getMinimum()) + "px";
            }else{
                this.line2.style.width = "0px";
            }
        }else{
            this.line2.style.cssFloat = this.line2.style.styleFloat = "right"
                if(this.getMaximum()-this.getMinimum() != 0){
            this.line2.style.left = (w - hw) * (this.getValue() - this.getMinimum()) /
                (this.getMaximum() - this.getMinimum()) + "px";
            this.line2.style.width = ((w) - ((w - hw) * (this.getValue() - this.getMinimum()) /
            (this.getMaximum() - this.getMinimum()))) + "px";
                }else{
                    this.line2.style.left = '0px';
                    this.line2.style.width = '0px';

                }
        }

        this.line.style.top = (h - lh) / 2 + "px";
        this.line.style.left = hw / 2 + "px";

        //this.line.style.right = hw / 2 + "px";
        this.line.style.width = Math.max(0, w - hw - 2)+ "px";
        this.line.firstChild.style.width = Math.max(0, w - hw - 4)+ "px";

//        alert(this.handle.style.left);
    }
    else {
        this.handle.style.left = (w - hw) / 2 + "px";
        this.handle.style.top = h - hh - (h - hh) * (this.getValue() - this.getMinimum()) /
            (this.getMaximum() - this.getMinimum()) + "px";

        this.line.style.left = (w - lw) / 2 + "px";
        this.line.style.top = hh / 2 + "px";
        this.line.style.height = Math.max(0, h - hh - 2) + "px";    //hard coded border width
        //this.line.style.bottom = hh / 2 + "px";
        this.line.firstChild.style.height = Math.max(0, h - hh - 4) + "px";    //hard coded border width
    }
};

Slider.prototype.ontimer = function () {
    var hw = this.handle.offsetWidth;
    var hh = this.handle.offsetHeight;
    var hl = this.handle.offsetLeft;
    var ht = this.handle.offsetTop;

    if (this._orientation == "horizontal") {
        if (this._mouseX > hl + hw &&
            (this._increasing == null || this._increasing)) {
            this.setValue(this.getValue() + this.getBlockIncrement());
            this._increasing = true;
        }
        else if (this._mouseX < hl &&
            (this._increasing == null || !this._increasing)) {
            this.setValue(this.getValue() - this.getBlockIncrement());
            this._increasing = false;
        }
    }
    else {
        if (this._mouseY > ht + hh &&
            (this._increasing == null || !this._increasing)) {
            this.setValue(this.getValue() - this.getBlockIncrement());
            this._increasing = false;
        }
        else if (this._mouseY < ht &&
            (this._increasing == null || this._increasing)) {
            this.setValue(this.getValue() + this.getBlockIncrement());
            this._increasing = true;
        }
    }

    this._timer.start();
};

var slideWidth=1;
var defHandleWidth=1;
var baseValue=1;
var maxValue=1;
var slideMin=1;
var slideMax=1;
