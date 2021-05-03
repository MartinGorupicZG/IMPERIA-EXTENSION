//IO map ver 0.0.1 by CaXo
hex_to_decimal = function(hex) {
    return Math.max(0, Math.min(parseInt(hex, 16), 255));
};
css3color = function(color, opacity) {
    return 'rgba('+hex_to_decimal(color.substr(0,2))+','+hex_to_decimal(color.substr(2,2))+','+hex_to_decimal(color.substr(4,2))+','+opacity+')';
};
var noTip=false;
var noTipX=0;
var noTipY=0;
var bodyWidth=0;
var mapTypes=new Array();
var mapTypes={'holderProvinces':"Provincess",'holderMap':"Village"};

var mainHolderId='holderProvinces';
var allAdd='Provincess';
var allPolyzonesProvincess=new Array();
var allPolyActionsProvincess=new Array();
var allPolyzonesColorsProvincess=new Array();
var allPolyzonesVillage=new Array();
var allPolyActionsVillage=new Array();
var allPolyzonesColorsVillage=new Array();
var canvasProvincess=null;
var ctxProvincess=null;
var canvasVillage=null;
var ctxVillage=null;
var canvas=null;
var ctx=null;
var canvasText='';
var toolripW='';
var currentViz='';
var has_VML = document.namespaces;
var has_canvas = !!document.createElement('canvas').getContext;

document.deleteElementById=function(id){
    document.deleteElement(document.getElementById(id));
}
document.deleteElement=function(el){
    if(el!=null){
        if (window.DocumentTouch && document instanceof DocumentTouch) {
            el.ontouchstart = null;
            el.ontouchend = null;
            el.ontouchstart=function(){};
            el.ontouchend=function(){};
            delete el.ontouchstart;
            delete el.ontouchend;
        }else{
            el.onclick = null;
            el.onmouseover = null;
            el.onmouseout = null;
            el.onmousemove = null;
            el.onclick = function(){};
            el.onmouseover = function(){};
            el.onmouseout = function(){};
            el.onmousemove = function(){};
            delete el.onclick;
            delete el.onmouseover;
            delete el.onmouseout;
            delete el.onmousemove;
        }
    if(el.parentNode!=null){el.parentNode.removeChild(el);}
    else{document.body.removeChild(el);}}
}
document.getElementsByClassNameInCont = function(cl,cont) {
    var retnode = [];
    var myclass = new RegExp('\\b'+cl+'\\b');
    var elem = cont.getElementsByTagName('*');
    for (var i = 0; i < elem.length; i++) {
        var classes = elem[i].className;
        if (myclass.test(classes)) retnode.push(elem[i]);
    }
    return retnode;
};
function checkCanvas(mainHolder,winId){
    if(document.getElementById('canvas'+mapTypes[mainHolder])==null){
        if(has_canvas){
            canvasText='<canvas id="canvas'+mapTypes[mainHolder]+'" width="967" height="501" style="z-index:50;position:absolute;top:0;left:0;"></canvas>';

    //        canvastext='<canvas id="canvasProvincess" width="967" height="501" style="z-index:50;position:absolute;top:0;left:0;"></canvas>';
    //document.getElementById('holderProvinces').innerHTML+=canvastext;
    //var canvas = document.getElementById('canvasProvincess');
    //var ctx = canvas.getContext('2d');
    //canvas=assignEventHandles(canvas);


            document.getElementById(mainHolder).innerHTML+=canvasText;
            if(mainHolder=='holderMap'){
                canvasVillage = document.getElementById('canvas'+mapTypes[mainHolder]);
                ctxVillage = canvasVillage.getContext('2d');
                canvasVillage=assignEventHandles(canvasVillage);
                canvasText='';
    //            eval('canvas'+mapTypes[mainHolder])=document.getElementById('canvas'+mapTypes[mainHolder]);
    //            eval('ctx'+mapTypes[mainHolder])=eval('canvas'+mapTypes[mainHolder]).getContext('2d');

            }else{
                canvasProvincess = document.getElementById('canvasProvincess');
                ctxProvincess = canvasProvincess.getContext('2d');
                canvasProvincess=assignEventHandles(canvasProvincess);
                canvasText='';
            }
        }else{
//            alert("No Canvas :(");
//            canvasText='<var style="zoom:1;position:absolute;overflow:hidden;display:block;z-index:50;width:1000px;height:501px;top:0;left:0;border:1px solid red;" id="canvas'+mapTypes[mainHolder]+'"></var>';
//            document.getElementById(mainHolder).innerHTML+=canvasText;
//            document.getElementById("canvas"+mapTypes[mainHolder])=assignEventHandles(document.getElementById("canvas"+mapTypes[mainHolder]));
//            assignEventHandles(document.getElementById("canvas"+mapTypes[mainHolder]));

//            alert(typeof document.getElementById("canvas"+mapTypes[mainHolder]));

        }
    }
}
function removeImages(mainHolder,className){
    allEls=document.getElementsByClassNameInCont(className,document.getElementById(mainHolder));
    for(var i = 0; i<allEls.length;i++){
        if(allEls[i]!=null){
            if(allEls[i].parentNode.id==mainHolder){
                document.deleteElement(allEls[i]);
            }
//                        if(allEls[i].parentNode!=null){allEls[i].parentNode.removeChild(allEls[i]);}
//                        else{document.body.removeChild(allEls[i]);}
        }
    }
    delete allEls;
}
function removeContItems(containerName){
    container=document.getElementById(containerName);
    while(container.firstChild){
//        container.removeChild(container.firstChild);
        document.deleteElement(container.firstChild);
    }
//    removeContItems
}
 function makeCoord(e){
//     e.preventDefault();
// }
// function tmp(){
//     if (window.DocumentTouch && document instanceof DocumentTouch) {
//         e = e? e: window.event;
//         if (e.touches && e.touches.length) {

//             if(typeof mapTypes[(e.touches[0].srcElement?e.touches[0].srcElement:e.touches[0].target).parentNode.id] != 'undefined'){
//                mainHolderId=(e.touches[0].srcElement?e.touches[0].srcElement:e.touches[0].target).parentNode.id;
//                allAdd=mapTypes[(e.touches[0].srcElement?e.touches[0].srcElement:e.touches[0].target).parentNode.id];
//            }
//         }else{
//             if(typeof mapTypes[(e.srcElement? e.srcElement: e.target).parentNode.id] != 'undefined'){
//                mainHolderId=(e.srcElement? e.srcElement: e.target).parentNode.id;
//                allAdd=mapTypes[(e.srcElement? e.srcElement: e.target).parentNode.id];
//            }
//         }
//     }else{
//        e = e? e: window.event;
//        if(typeof mapTypes[(e.srcElement? e.srcElement: e.target).parentNode.id] != 'undefined'){
//            mainHolderId=(e.srcElement? e.srcElement: e.target).parentNode.id;
//            allAdd=mapTypes[(e.srcElement? e.srcElement: e.target).parentNode.id];
//        }
//     }

     mainHolder=((window.DocumentTouch && document instanceof DocumentTouch)?((e.touches && e.touches.length)?(e.touches[0].srcElement?e.touches[0].srcElement:e.touches[0].target).parentNode.id:((e.srcElement? e.srcElement: e.target).parentNode.id)):((e.srcElement? e.srcElement: e.target).parentNode.id));

     if(typeof mapTypes[mainHolder] !='undefined'){
         mainHolderId=mainHolder;
         allAdd=mapTypes[mainHolder];
     }


     basePositions=$('#'+document.getElementById(mainHolderId).id).offset();
     if (window.DocumentTouch && document instanceof DocumentTouch) {
         e = e? e: window.event;
//        if (!e.preventDefault) e.preventDefault = function () { return false; }
//        if (!e.stopPropagation) e.stopPropagation = function () { if (window.event) window.event.cancelBubble = true; }
//        thirgetPos=getOffset(e.srcElement? e.srcElement: e.target);
//        alert(thirgetPos.left + ' '+$(window).scrollLeft());
//        alert(thirgetPos.top+ ' '+thirgetPos.left);
        if (e.touches && e.touches.length) {
//            x = (e.touches[0].clientX-thirgetPos.left);
            x = ((e.touches[0].clientX+$(document).scrollLeft())-basePositions.left);
//            alert(x+" " +e.touches[0].clientX+ " " + basePositions.left+" "+$(document).scrollLeft());
//            alert((e.touches[0].clientX-(basePositions.left+$(window).scrollLeft())))
//            alert((e.touches[0].clientX-thirgetPos.left))
//alert(x+" " +e.touches[0].clientX+ " " + basePositions.left+" "+thirgetPos.left+ " " +$(window).scrollLeft());
        } else {
            x = (e.clientX-basePositions.left);
        }
        if (e.touches && e.touches.length) {
            y = ((e.touches[0].clientY+$(document).scrollTop())-basePositions.top);
//            alert(y+" " +e.touches[0].clientY+ " " + basePositions.top+" "+thirgetPos.top+" "+$(document).scrollTop());
//            alert(y+" " +e.touches[0].clientY+ " " + basePositions.top+" "+$(document).scrollTop());
        } else {
            y = ((e.clientY+$(document).scrollTop())-basePositions.top);
//            y = (e.clientY-basePositions.top);

        }
     }else{
         e = e? e: window.event;
        e.cancelBubble=true;
        x = (e.pageX-basePositions.left);
        y = (e.pageY-basePositions.top);
     }
     return {'x':x,'y':y,'act':''};
}
//function getOffset( el ) {
//    var _x = 0;
//    var _y = 0;
//    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
//        _x += el.offsetLeft - el.scrollLeft;
//        _y += el.offsetTop - el.scrollTop;
//        if ($.browser.webkit) {
//            el = el.parentNode;
//        } else {
//            el = el.offsetParent;
//        }
//    }
//    return { top: _y, left: _x };
//}

function nzFunct(el){
    return(el ? (el.offsetHeight || el.style.pixelHeight || 0) : 0);
}
function nzFunct2(el){
    return(el ? (el.offsetWidth || el.style.pixelWidth || 0) : 0);
}

makeTheTip=function(x,y){
    var inPoli=false;
    allPolyzones=eval('allPolyzones'+allAdd);
    for(var key in allPolyzones){
        if(inPoli==false){
            inPoli=isPointInPoly(allPolyzones[key],{'x':x,'y':y});
            if(inPoli==true){
                var poliCliked=key;
            }
        }
     }
     if(typeof currentViz=='undefined'){currentViz='';}
    if(currentViz!=poliCliked){
        if((currentViz!='')&&(typeof currentViz!='undefined')){

            if(typeof document.getElementById('TtDiV'+currentViz) != 'undefined'){
//                document.getElementById('TtDiV'+currentViz)
                if(document.getElementById('TtDiV'+currentViz) != null){
                    document.getElementById('TtDiV'+currentViz).style.visibility='hidden';
                }else{
                    currentViz='';
                }
            }else{
                currentViz='';
            }
            makeCanvasDrawing();
        }else{
            currentViz='';
        }
        if(typeof poliCliked!='undefined'){
            currentViz=poliCliked
            drawToPoly(poliCliked);
            document.getElementById('TtDiV'+poliCliked).style.visibility='visible';
            if(x+nzFunct2(document.getElementById('TtDiV'+poliCliked))>bodyWidth){
                document.getElementById('TtDiV'+poliCliked).style.left=eval(bodyWidth+'-'+nzFunct2(document.getElementById('TtDiV'+poliCliked)))+'px';
            }else{
                if(allAdd=='Village'){
                    document.getElementById('TtDiV'+poliCliked).style.left=eval(x+'+'+35)+'px';
                } else {
                    document.getElementById('TtDiV'+poliCliked).style.left=eval(x+'+'+15)+'px';
                }
            }
            if(allAdd=='Village'){
                document.getElementById('TtDiV'+poliCliked).style.top=eval(y+'+'+132)+'px';
            } else {
                document.getElementById('TtDiV'+poliCliked).style.top=eval(y+'+'+30)+'px';
            }
        }
    }else{
        if((poliCliked!='')&&(typeof poliCliked!='undefined')){

            currentViz=poliCliked;
            if(document.getElementById('TtDiV'+poliCliked).style.visibility=='hidden'){
                drawToPoly(poliCliked);
            }
            document.getElementById('TtDiV'+poliCliked).style.visibility='visible';
            if(x+nzFunct2(document.getElementById('TtDiV'+poliCliked))>bodyWidth){
                document.getElementById('TtDiV'+poliCliked).style.left=eval(bodyWidth+'-'+nzFunct2(document.getElementById('TtDiV'+poliCliked)))+'px';
            }else{
                if(allAdd=='Village'){
                    document.getElementById('TtDiV'+poliCliked).style.left=eval(x+'+'+35)+'px';
                } else {
                    document.getElementById('TtDiV'+poliCliked).style.left=eval(x+'+'+15)+'px';
                }
            }

            if(allAdd=='Village'){
                document.getElementById('TtDiV'+poliCliked).style.top=eval(y+'+'+132)+'px';
            } else {
                document.getElementById('TtDiV'+poliCliked).style.top=eval(y+'+'+30)+'px';
            }
        }else{
            poliCliked='';
        }
    }
    if(typeof currentViz == 'undefined'){currentViz='';}
};
function isPointInPoly(poly, pt){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}

function checkForTip(e){
    posData=makeCoord(e);
//    alert("..");
    makeTheTip(posData.x,posData.y);
}
drawToPoly=function(polyKey){
    if(has_canvas){
        var offset = 1000;
        var ctx = eval('ctx'+allAdd);
        var allPolyzones=eval('allPolyzones'+allAdd);

        for (var j = 0; j < 5; j++) {
            ctx.beginPath();
            ctx.moveTo(allPolyzones[polyKey][0].x - offset,allPolyzones[polyKey][0].y - offset);
            for(var i=1; i < allPolyzones[polyKey].length; i+=1) {ctx.lineTo(allPolyzones[polyKey][i].x - offset,allPolyzones[polyKey][i].y - offset);}
            ctx.closePath();
            ctx.strokeStyle = css3color('FFFFFF', 1);
            ctx.lineWidth = 1;
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = offset;
            ctx.shadowOffsetY = offset;
            ctx.stroke();
        }
    }else{
//        I hate IE
    }
};

makeEventStuff=function(x,y){
    var inPoli=false;
    allPolyzones=eval('allPolyzones'+allAdd);
    allPolyActions=eval('allPolyActions'+allAdd);
    allPolyzonesColors=eval('allPolyzonesColors'+allAdd);
    for(var key in allPolyzones){
        if(inPoli==false){
            inPoli=isPointInPoly(allPolyzones[key],{'x':x,'y':y});
            if(inPoli==true){
                var poliCliked=key;
            }
        }

     }
     if(typeof allPolyActions[poliCliked] != 'undefined'){
    if(allPolyActions[poliCliked]['action']!=''){
        if(allPolyActions[poliCliked]['action']!='show_menu'){
            document.getElementById('TtDiV'+poliCliked).style.visibility='hidden';
            if(document.getElementById('TtDiV'+allAdd).style.visibility != null){
                document.getElementById('TtDiV'+allAdd).style.visibility='hidden';
            }
            makeCanvasDrawing();
            noTip=true;
            noCheck=true;
            noTipX=x;
            noTipY=y;
            eval(allPolyActions[poliCliked]['action']+"('"+poliCliked+"')");
            setTimeout('noTip=false;noCheck=false;',1000);

        }else{
            document.getElementById('TtBoDyI'+allAdd).innerHTML=allPolyActions[poliCliked]['menu'];
            noTip=true;
            noTipX=x;
            noTipY=y;
            el=document.getElementById('TtDiV'+allAdd);
            if(eval(x+'-'+nzFunct2(el))<0){
                el.style.left='0px';

                document.getElementById('TtDiV'+poliCliked).style.left=eval(parseInt(el.style.left)+'+'+nzFunct2(el))+'px';
            }else{
                if(x+nzFunct2(document.getElementById('TtDiV'+poliCliked))>bodyWidth){
                    document.getElementById('TtDiV'+poliCliked).style.left=eval(bodyWidth+'-'+nzFunct2(document.getElementById('TtDiV'+poliCliked)))+'px';
                    el.style.left=eval(bodyWidth+'-'+nzFunct2(el)+'-'+nzFunct2(document.getElementById('TtDiV'+poliCliked)))+'px';
                }else{
                    el.style.left=eval(x+'-'+nzFunct2(el))+'px';
                }
//                el.style.left=eval(x+'-'+nzFunct2(el))+'px';

            }

            el.style.top=eval(y+'+'+30)+'px';
            el.style.visibility='visible';
        }
    }else{
        document.getElementById('TtBoDyI'+allAdd).innerHTML='';
        el=document.getElementById('TtDiV'+allAdd);
        el.style.visibility='hidden';
    }
     }else{
         document.getElementById('TtBoDyI'+allAdd).innerHTML='';
        el=document.getElementById('TtDiV'+allAdd);
        el.style.visibility='hidden';
     }
};
function checkMapType(elId){
//    mapTypes

}
function assignEventHandles(elem){

    if (window.DocumentTouch && document instanceof DocumentTouch) {
        var posData=[];
        elem.ontouchstart=function(e){

            posData=makeCoord(e);
            posData.act='touch';
        }
        elem.ontouchmove=function(e){

            posData=[];
//            posData=makeCoord(e);
//            posData.act='move'
        }
        elem.ontouchend=function(e){
//            posData=makeCoord(e);
//alert(posData.act+' '+posData.x+' '+posData.y);
            makeTheTip(posData.x,posData.y);
            makeEventStuff(posData.x,posData.y);
            posData=[];
        }
//        elem.ontouchend=function(e){
//            alert(e.touches[0].clientX);
//            posData=makeCoord(e);
//            alert(e.touches[0].clientX);
//        }
    }else{

        elem.onclick=function(e){
            posData=makeCoord(e);
            makeEventStuff(posData.x,posData.y);
        }
        elem.onmouseout=function(e){
            if(noTip==false){
                $('.TtDiVtOoLs').css('visibility','hidden');
                makeCanvasDrawing();
            }
        }
        elem.onmouseover=function(e){
            if(noTip==false){
                checkForTip(e);
            }
        }

        elem.onmousemove=function(e){
            if(noTip==false){
                checkForTip(e);
            }else{
                posData=makeCoord(e);
                if(Math.abs(posData.x-noTipX)>40){
                    noTip=false;
                }
                if(Math.abs(posData.y-noTipY)>40){
                    noTip=false;
                }
                if(noTip==false){
                    $('.TtDiVtOoLs').css('visibility','hidden');
                    makeCanvasDrawing();
                }
            }
        }

    }

    return elem;
}

makeCanvasDrawing=function(){
    if(has_canvas){
//    var canvas = document.getElementById('canvas'+allAdd);
//    var ctx = canvas.getContext('2d');
    canvas = eval('canvas'+allAdd);
    ctx = eval('ctx'+allAdd);
    ctx.clearRect(0,0,967,501);
    ctx.width = 1;
    ctx.width = 967;

    allPolyzones=eval('allPolyzones'+allAdd);
    allPolyActions=eval('allPolyActions'+allAdd);
    allPolyzonesColors=eval('allPolyzonesColors'+allAdd);
    for(var key in allPolyzones){

        ctx.beginPath();
        ctx.moveTo(allPolyzones[key][0].x, allPolyzones[key][0].y);
        for(var zoneKey in allPolyzones[key]) {if(zoneKey!=0){ctx.lineTo(allPolyzones[key][zoneKey].x,allPolyzones[key][zoneKey].y);}}
        ctx.closePath();
        if(allPolyzonesColors[key]['strokeColor']!=''){
            ctx.strokeStyle = css3color(allPolyzonesColors[key]['strokeColor'], 0.6);
            ctx.lineWidth = '4';
            ctx.stroke();
        }
        if(allPolyzonesColors[key]['fillColor']!=''){
            ctx.fillStyle = css3color(allPolyzonesColors[key]['fillColor'], 0.6);
            ctx.fill();
        }
    }
    }else{
//        I hate IE
    }

};
$(document).ready(function()
            {
if (window.DocumentTouch && document instanceof DocumentTouch) {

//                bodyWidth=window.innerWidth;
                bodyWidth=nzFunct2(document.body)-30;

//    document.body.ontouchstart=function(e){
//        checkForTip(e);
//        $('.TtDiVtOoLs').css('visibility','hidden');
//    }

}else{
    document.body.onmousemove=function(){
        if(noTip==false){
            $('.TtDiVtOoLs').css('visibility','hidden');
        }
    }
    bodyWidth=nzFunct2(document.body);

};
});
