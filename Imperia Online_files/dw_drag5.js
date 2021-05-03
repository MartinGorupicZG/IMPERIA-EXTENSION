/*******************************************************************************************

dw_drag.js
version date Nov 2003

This code is from Dynamic Web Coding at http://www.dyn-web.com/
See Terms of Use at http://www.dyn-web.com/bus/terms.html
regarding conditions under which you may use this code.
This notice must be retained in the code as is!

This code borrows heavily from Aaron Boodman's dom drag at www.youngpup.net

********************************************************************************************/

var dragObj = {
    supported: document.getElementById && (document.addEventListener || document.attachEvent),
    obj: null,
    movedObjData: null,
    zOrder: 1000,
    // a class can be attached to close box (or other elements) so mousedown on it won't trigger drag
    skipClass: "xBox",
    handleSelectedClass:'handleSelected',
    handleDeselectedClass:'',
    handleId:'',
    parentContainerStart:'',
    parentContainerClass:'',
    defDragmeClassName : 'dragme',
    regular1: false,
    regular2: false,
    debug:false,
    // id is that of object you mousedown on when you want to drag,
    // which may or may not be inside another element (rootID) which gets dragged
    init: function(id, rootID, x, y, minX, maxX, minY, maxY) {
        if (this.supported) {
            miX=0;
            minY=0;
            this.regular1= new RegExp(dragObj.parentContainerStart,"g");
            this.regular2= new RegExp(dragObj.defDragmeClassName,"g");
            var o = document.getElementById(id);
            o.root = rootID? document.getElementById(rootID): o;
            o.idx = id; // used for checking in start
            //  pass x/y, set left/top inline or via script, or it gets set to 0,0
            if ( isNaN( parseInt(o.root.style.left) ) ) o.root.style.left = x? x + "px": 0 + "px";
            if ( isNaN( parseInt(o.root.style.top) ) )  o.root.style.top =  y? y + "px": 0 + "px";
            o.minX = minX; o.maxX = maxX; o.minY = minY; o.maxY = maxY;
            o.root.on_drag_start = function() {}
            o.root.on_drag = function() {}
            o.root.on_drag_end = function() {}
            if (window.DocumentTouch && document instanceof DocumentTouch) { // iphone method see http://cubiq.org/remove-onclick-delay-on-webkit-for-iphone/9 or http://www.nimblekit.com/tutorials.html for clues...
//                CaXo : DO NOT REMOVE UNDER DEVELOPMENT
//                o.ontouchstart = function(e) {
//                    dragObj.start();
//                };
//                dw_event.add( o, "touchstart", dragObj.touchStart, false );
            }else{
                dw_event.add( o, "mousedown", dragObj.start, false );
            }
        }
    },
touchStart: function(e) {

    var o;
    e = dw_event.DOMitTouch(e);

    var re=dragObj.regular1;
    var re2=dragObj.regular2;
        if(e.tgt.nodeName!='A'){
            $('.'+dragObj.handleSelectedClass+'.'+dragObj.defDragmeClassName).attr('class',dragObj.handleDeselectedClass+' '+dragObj.defDragmeClassName);
            if(e.tgt.id==containersStuff.handleId){
                e.tgt.className=dragObj.handleSelectedClass+' '+dragObj.defDragmeClassName;
            }else{
                if(e.tgt.id.match(re)){
                    $('#'+e.tgt.id).find('#'+dragObj.handleId).attr('class',dragObj.handleSelectedClass+' '+dragObj.defDragmeClassName);
                }else{
                    var stopLoop=false;
                    if(e.tgt.parentNode!=null){
                        var parEl=e.tgt.parentNode;
                        while((stopLoop==false)||(parEl == null)){
                            if(parEl.parentNode!=null){
                                parEl=parEl.parentNode;
                                if((parEl.id!='')&&(typeof parEl.id!='undefined')){
                                    if(parEl.id.match(re)){
                                        $('#'+parEl.id).find('#'+dragObj.handleId).attr('class',dragObj.handleSelectedClass+' '+dragObj.defDragmeClassName);
                                        $('#'+parEl.id).attr('class','.'+dragObj.parentContainerClass);
                                        $('.'+dragObj.parentContainerClass).css('zIndex','900');
                                        for(var k in containersStuff.openOrder){
                                            document.getElementById(containersStuff.parentContainerStart+containersStuff.openOrder[k]).style.zIndex=
                                            eval(document.getElementById(containersStuff.parentContainerStart+containersStuff.openOrder[k]).style.zIndex+"+"+k);
                                        }
                                        parEl.style.zIndex=dragObj.zOrder;
                                        stopLoop=true;
                                    }
                                }
                            }else{
                                stopLoop=true;
                            }
                        }
                    }
                }
            }
        }
    // Check if moused down on an object that shouldn't trigger drag (close box, for example)
    if (e.tgt.nodeType && e.tgt.nodeType == 3) e.tgt = e.tgt.parentNode;  // text node?


    if(!e.tgt.className.match(re2)) {
        if (window.event) window.event.cancelBubble = true;
        return true;
    }


    if (this.idx) o = dragObj.obj = this;
    else {  // o != this for ie when using attachEvent
    while (!e.tgt.idx) e.tgt = e.tgt.parentNode;

    o = dragObj.obj = e.tgt;
    }
e.preventDefault();
danni={
    downX:        e.touches[0].clientX,
    downY:        e.touches[0].clientY,
    startY:        parseInt(o.root.style.top),
    startX:        parseInt(o.root.style.left),
    boxWidth:    o.root.offsetWidth,
    boxHeight:    o.root.offsetHeight,
    ElementId:    this.idx,
    zOrder:        dragObj.zOrder
};
alert(parseInt(o.root.style.left));
o.root.style.opacity = 0.7;
moveBox.start(danni);
},
touchDrag: function(e) {

    e.preventDefault();
    var nx = movedObjData.startX + e.touches[0].clientX - movedObjData.downX;
    var ny = movedObjData.startY + e.touches[0].clientY - dragObj.obj.downY;
    document.getElementById(movedObjData.id).style.left = nx + "px"; document.getElementById(movedObjData.id).style.top  = ny + "px";
    return false;
},

touchEnd: function(e) {
    dw_event.remove( document, "touchmove", dragObj.touchDrag, true );
    dw_event.remove( document, "touchend",   dragObj.touchEnd,  true );
    if ( !dragObj.obj ) return; // avoid errors in ie if inappropriate selections
    dragObj.obj = null;
},
start: function(e) {
    var o;
    e = dw_event.DOMit(e);
    var re=dragObj.regular1;
    var re2=dragObj.regular2;
        e = dw_event.DOMit(e);
        if(e.tgt.nodeName!='A'){
            $('.'+dragObj.handleSelectedClass+'.'+dragObj.defDragmeClassName).attr('class',dragObj.handleDeselectedClass+' '+dragObj.defDragmeClassName);
            if(e.tgt.id==containersStuff.handleId){
                e.tgt.className=dragObj.handleSelectedClass+' '+dragObj.defDragmeClassName;
            }else{
                if(e.tgt.id.match(re)){
                    $('#'+e.tgt.id).find('#'+dragObj.handleId).attr('class',dragObj.handleSelectedClass+' '+dragObj.defDragmeClassName);
                }else{
                    var stopLoop=false;
                    if(e.tgt.parentNode!=null){
                        var parEl=e.tgt.parentNode;
                        while((stopLoop==false)||(parEl == null)){
                            if(parEl.parentNode!=null){
                                parEl=parEl.parentNode;
                                if((parEl.id!='')&&(typeof parEl.id!='undefined')){
                                    if(parEl.id.match(re)){
                                        $('#'+parEl.id).find('#'+dragObj.handleId).attr('class',dragObj.handleSelectedClass+' '+dragObj.defDragmeClassName);
                                        $('#'+parEl.id).attr('class','.'+dragObj.parentContainerClass);
                                        $('.'+dragObj.parentContainerClass).css('zIndex','900');
                                        for(var k in containersStuff.openOrder){
                                            document.getElementById(containersStuff.parentContainerStart+containersStuff.openOrder[k]).style.zIndex=
                                            eval(document.getElementById(containersStuff.parentContainerStart+containersStuff.openOrder[k]).style.zIndex+"+"+k);
                                        }
                                        parEl.style.zIndex=dragObj.zOrder;
                                        stopLoop=true;
                                        containersStuff.tryFlashContainer(parEl.id);
                                    }
                                }
                            }else{
                                stopLoop=true;
                            }
                        }
                    }
                }
            }
        }
    // Check if moused down on an object that shouldn't trigger drag (close box, for example)
    if (e.tgt.nodeType && e.tgt.nodeType == 3) e.tgt = e.tgt.parentNode;  // text node?


    if(!e.tgt.className.match(re2)) return;


    if (this.idx) o = dragObj.obj = this;
    else {  // o != this for ie when using attachEvent
    while (!e.tgt.idx) e.tgt = e.tgt.parentNode;
    o = dragObj.obj = e.tgt;
    }
    if (typeof containersStuff.savedContainers['global_map'] != 'undefined') {
        if(dragObj.obj.id == containersStuff.parentContainerStart+''+containersStuff.savedContainers['global_map']){
            moveFlashCheck=1;
            containersStuff.tryFlashContainer('');
        }
    }
    o.root.style.zIndex = dragObj.zOrder++;
    o.downX = e.clientX; o.downY = e.clientY;
    o.startX = parseInt(o.root.style.left);
    o.startY = parseInt(o.root.style.top);
    o.root.on_drag_start(o.startX, o.startY);
    dw_event.add( document, "mousemove", dragObj.drag, true );
    dw_event.add( document, "mouseup",   dragObj.end,  true );
    e.preventDefault();
},
drag: function(e) {
    e = e? e: window.event;

    if (dragObj.obj.id === undefined) {
        dragObj.obj = e.tgt;
        o.startX = 0;
        o.startX = 0;
    }
    var o = dragObj.obj;
    // calculate new x/y values
    var nx = o.startX + e.clientX - o.downX;
    var ny = o.startY + e.clientY - o.downY;
    if ( o.minX != null ) nx = Math.max( o.minX, nx );
    if ( o.maxX != null ) nx = Math.min( o.maxX, nx );
    if ( o.minY != null ) ny = Math.max( o.minY, ny );
    if ( o.maxY != null ) ny = Math.min( o.maxY, ny );
    o.root.style.left = nx + "px"; o.root.style.top  = ny + "px";
    o.root.on_drag(nx,ny);
    return false;
},

end: function() {

    var parentContainerNumber = currentActive = $("div.contParent").not(".handleDeselected").attr('id').match(/[0-9]+/).toString();

    if (parentContainerNumber != undefined) {
        $('ul.parentContainer' + parentContainerNumber).each(function(){
            var $input = $('input.autoComplete, input.autoCompleteUser','#dragDiv' + parentContainerNumber);
            if ($input != undefined) {
                var $inputOffsets = $input.offset();
                if ($(this).css("display") == "none") {
                    //$(this).remove();
                } else {
                    $(this).offset({ top: $inputOffsets.top+22, left: $inputOffsets.left });
                }
            }
        });
    }

    dw_event.remove( document, "mousemove", dragObj.drag, true );
    dw_event.remove( document, "mouseup",   dragObj.end,  true );
    if ( !dragObj.obj ) return; // avoid errors in ie if inappropriate selections
    containersStuff.tryFlashContainer(containersStuff.parentContainerStart+parentContainerNumber);
    if(parentContainerNumber == containersStuff.parentContainerStart+''+containersStuff.savedContainers['global_map']){
       moveFlashCheck=2;
    }
    dragObj.obj.root.on_drag_end( parseInt(dragObj.obj.root.style.left), parseInt(dragObj.obj.root.style.top) );
    dragObj.obj = null;
}

}
var moveBox = {
    startX: 0,
    startY: 0,
    downX: 0,
    downY: 0,
    boxWidth: 0,
    boxHeight: 0,
    zOrder: 0,
    ElementId: null,
    boxId: 'dragBox',
    start: function (danni){
        this.startX =danni.startX;
        this.startY =danni.startY;
        this.downX =danni.downX;
        this.downY =danni.downY;
        this.boxWidth =danni.boxWidth;
        this.boxHeight =danni.boxHeight;
        this.ElementId =danni.ElementId;
        this.zOrder =danni.zOrder;
        div=document.createElement('div');
        div.id=this.boxId;
        div.style.position="absolute";
        div.style.visibility="visible";
        div.style.left=this.startX+'px';
        div.style.top=this.startY+'px';
        div.style.width=this.boxWidth+"px";
        div.style.height=this.boxHeight+"px";
        div.style.zIndex=this.zOrder++;
        div.style.border="3px solid #bb0000";

        document.body.appendChild(div);

        dw_event.add( document, "touchmove", moveBox.drag, true );
        dw_event.add( document, "touchend",  moveBox.dragEnd,  true );
    },
    drag: function (e){
        var nx = moveBox.startX + e.touches[0].clientX - moveBox.downX;
        var ny = moveBox.startY + e.touches[0].clientY - moveBox.downY;
        document.getElementById(moveBox.boxId).style.left = nx + "px"; document.getElementById(moveBox.boxId).style.top  = ny + "px";
        return false;
    },
    dragEnd: function (e){
        e.preventDefault();
        document.getElementById(moveBox.ElementId).style.left = document.getElementById(moveBox.boxId).style.left;
        document.getElementById(moveBox.ElementId).style.top  = document.getElementById(moveBox.boxId).style.top;
        document.getElementById(moveBox.ElementId).style.opacity = 1;
        document.body.removeChild(document.getElementById(moveBox.boxId));

        delete(moveBox);
        return false;
    }
}
