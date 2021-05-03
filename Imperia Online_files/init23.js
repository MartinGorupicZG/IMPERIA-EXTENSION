var noCheck=false;
var moveFlashCheck=2;
var containersStuff={
    divNum: 0,
    parentContainerStart: "dragDiv",
    parentContainerClass: "contParent",
    messageIdStart: 'messagebox',
    closeIdStart: 'closeMe',
    windowInfoStart: 'window_info',
    windowFeedbackLinkStart: 'feedback_link',
    messageTextStart: 'Loading......',
    iconsWebdir: 'BASE_ICONS_DIR',
    iconsImgText: '<img src="imgDefText">',
    iconsImgReplaceText: 'imgDefText',
    iconsImageClass: 'iconImage',
    iconsTitleClass: 'dragTitle',
    handleSelectedClass:'handleSelected',
    handleDeselectedClass:'',
    handleId:'handle',
    defDragmeClassName : 'dragme',
    args: '',
    currentSettings:new Array(),
    savedContainers:new Array(),
    savedContainersNums:new Array(),
    savedContainersTemplates:new Array(),
    positionedContainers:new Array(),
    modalTitle:'modal',
    openOrder:[],
    playSounds: false,
    playEffects: true,
    playWindowOpen: true,
    playNoticeSound: true,

    isIE : document.all?true:false,
    _heScreenHeight: function () {
        if (window.innerHeight) {
            return window.innerHeight - 18;
        }else if (document.documentElement && document.documentElement.clientHeight) {
            return document.documentElement.clientHeight;
        }else if (document.body && document.body.clientHeight) {
            return document.body.clientHeight;
        }else{return 0;}
    },
    _heScreenWidth: function(){
        if (window.innerWidth) {return window.innerWidth - 18;}
        else if (document.documentElement && document.documentElement.clientWidth) {
            return document.documentElement.clientWidth;
        }else if (document.body && document.body.clientWidth) {
            return document.body.clientWidth;
        }else{
            return 0;
        }
    },
    offX: 200,
    offY: 200,
    loadDefSettings: function(){
        /*
        # - positionVisibleScreen (true/false) - make All calculation base on visible part of page / Work only when 'positionElementId' is blank /
        # - positionVisible (true/false) - make the window visible after all position calculations
        # - positionElementId - Position the created window at the location of a given elemnt ID
        # /if blank based on Body Element when positionVisibleScreen is false/
        #
        # - positionTop - The top step from given element (0 - if blank, if 'center' will put it in visible center)
        # - positionLeft - The left step from given element (0 - if blank, if 'center' will put it in visible center)
        # - dragable (true/false) - set created element to dragable on/off
        # - saveName (string) - set a name to the drag that is returned if already set shows it and return the number
        # if saveName set to 'modal' will activate the overlay and put all the current drags inder it
        # - resetPosition (true/false) - on used saveName and the drag is still visible this parameter set on true will position the element again
        */
        dragObj.handleSelectedClass=this.handleSelectedClass;
        dragObj.handleDeselectedClass=this.handleDeselectedClass;
        dragObj.handleId=this.handleId;
        dragObj.parentContainerStart=this.parentContainerStart;
        dragObj.parentContainerClass=this.parentContainerClass;
        this.currentSettings['positionVisibleScreen']=false;
        this.currentSettings['positionVisible']=true;
        this.currentSettings['positionElementId']='cuirass';
        this.currentSettings['positionTop']=15;
        if(this._heScreenHeight()<=685)this.currentSettings['positionTop']=-72;
        this.currentSettings['dragable']=true;
        this.currentSettings['saveName']='';
        this.currentSettings['resetPosition']=false;
        this.currentSettings['icon']='';
        this.currentSettings['title']='';
        this.currentSettings['debug']=false;
        this.currentSettings['template']='tabbed';
        this.savedContainers['tutorial']='dTutorial';
        this.savedContainers['tutorial2']='dTutorial2';
        this.savedContainers['notification']='Notification0';
    },
    findContaner: function(){
        this.playWindowOpen = true;
        this.loadDefSettings();
        this.args = '';

        tmpContainer=this.currentSettings['positionElementId'];
        if (arguments.length > 0) {
            this.args = eval(arguments[0]);
            for(var key in this.args){
                if(typeof this.currentSettings[key] != 'undefined'){
                    this.currentSettings[key]=this.args[key];
                }
            }
        }
        if(this.currentSettings['positionElementId']!=tmpContainer){
            if(typeof arguments['positionLeft']=='undefined'){
                if(this._heScreenHeight()<=685)this.currentSettings['positionLeft']=0;
            }
        }
        dragObj.debug=this.currentSettings['debug'];
        $('.'+this.parentContainerClass).css('zIndex','900');
        for(var k in containersStuff.openOrder){
            document.getElementById(containersStuff.parentContainerStart+containersStuff.openOrder[k]).style.zIndex=
            eval(document.getElementById(containersStuff.parentContainerStart+containersStuff.openOrder[k]).style.zIndex+"+"+k);
        }
        if(this.currentSettings['positionVisible']==true){
            $('.'+this.handleSelectedClass+'.'+this.defDragmeClassName).attr('class',this.handleDeselectedClass+' '+this.defDragmeClassName);
            $('.'+this.parentContainerClass).attr('class',containersStuff.handleDeselectedClass+' '+this.parentContainerClass);
        }
        if(this.currentSettings['saveName']==this.modalTitle){
            $("#overlay").css('height',$(document).height()).css('display','block');
        }

        if(this.currentSettings['saveName']!=''){
            if(!isNaN(parseInt(this.savedContainers[this.currentSettings['saveName']]))){
                id=parseInt(this.savedContainers[this.currentSettings['saveName']]);
                if(this.currentSettings['saveName']=='tutorial'){
                    id='dragDivdTutorial';
                }
                if(this.currentSettings['saveName']=='tutorial2'){
                    id='dragDivdTutorial2';
                }
                if(this.currentSettings['saveName']=='notification'){
                    id='dragDivNotification0';
                }

                this.switchTemplate(id);
                this.showDrag(id);
                this.modalContainer(id);
//                if(this.currentSettings['saveName']=='notification'){
//                    this.afterPositioning();
//                }
                return id;
            }
        }
        if(this.currentSettings['saveName']=='tutorial'){
            this.playSounds = true;
            id=this.savedContainers['tutorial'];
            $('#messageboxdTutorial').slideDown(1000,function(){
                $('#dragDivdTutorial').css('visibility','visible');
                $('#dragDivdTutorial').css('zIndex','1000');
            });
            dragObj.init('dragDivdTutorial');
            this.tryFlashContainer('dragDivdTutorial');
            return id;
        }
        if(this.currentSettings['saveName']=='tutorial2'){
            this.playSounds = true;
            id=this.savedContainers['tutorial2'];
            $('#messageboxdTutorial2').slideDown(1000,function(){
                $('#dragDivdTutorial2').css('visibility','visible');
                $('#dragDivdTutorial2').css('zIndex','1000');
            });
            dragObj.init('dragDivdTutorial2');
            this.tryFlashContainer('dragDivdTutorial2');
            return id;
        }
        if(this.currentSettings['saveName']=='notification'){
            this.playSounds = true;
            id=this.savedContainers['notification'];
            $('#messageboxNotification').slideDown(1000,function(){
                $('#dragDivNotification0').css('visibility','visible');
                $('#dragDivNotification0').css('zIndex','1000');
            });
            this.showDrag(id);
            this.afterPositioning();
            this.tryFlashContainer('dragDivNotification0');
            return id;
        }
        if(this.divNum>0){
            for(var i=1;i<=this.divNum;i++){
                if (document.getElementById(this.parentContainerStart+i).style.visibility == 'hidden') {
                    checkNext=0;
                    for(var key in this.savedContainers){
                        if(this.savedContainers[key]==i){
                            checkNext=1;
                        }
                    }
                    if(checkNext==0){
                        this.showDrag(i);
                        if(this.currentSettings['saveName']!=''){
                            this.savedContainers[this.currentSettings['saveName']]=i;
                            this.savedContainersNums[i]=this.currentSettings['saveName'];
                        }
                        this.modalContainer(i);
                        return i;
                    }
                }
            }
        }
        id=this.create();
        containersStuff.positionedContainers[id]=false;

        this.showDrag(id);
        if(this.currentSettings['saveName']!=''){
            this.savedContainers[this.currentSettings['saveName']]=id;
            this.savedContainersNums[id]=this.currentSettings['saveName'];
        }
        this.modalContainer(id);

        ie6SuxAlot();

        return id;
    },
    modalContainer: function(divNum){
        if(this.currentSettings['saveName']==this.modalTitle){
            $('.'+this.parentContainerClass).css('zIndex',eval($('#overlay').css('zIndex') +'-'+1 ));
            idToShow=this.parentContainerStart+divNum;
            $('#'+idToShow).css('zIndex',eval($('#overlay').css('zIndex') +'+'+1 ));
        }
    },
    switchTemplate: function(id){
        showit=false;
        if(arguments[1]){if(arguments[1]!=''){this.currentSettings['template']=arguments[1];showit=true;}}
        if((this.savedContainersTemplates[id]!=this.currentSettings['template'])&&(this.savedContainersTemplates[id]!='')&&(this.currentSettings['template']!='')){
//            alert("Change from "+this.savedContainersTemplates[id]+" to "+this.currentSettings['template']);
//            containerToChange=$('#'+this.parentContainerStart+id);
            if(document.getElementById(this.parentContainerStart+id)!=null){
                messageTitle=$('#'+this.parentContainerStart+id).find('#'+this.handleTitleClass).html();
                messageBox=document.getElementById(this.messageIdStart+id).innerHTML;

                this.currentSettings['positionElementId']='';
                this.currentSettings['positionVisibleScreen']=false;
                this.currentSettings['positionLeft']=parseFloat(document.getElementById(this.parentContainerStart+id).style.left);
                this.currentSettings['positionTop']=parseFloat(document.getElementById(this.parentContainerStart+id).style.top);
                if(document.getElementById(this.parentContainerStart+id).parentNode!=null){
                    document.getElementById(this.parentContainerStart+id).parentNode.removeChild(document.getElementById(this.parentContainerStart+id));
                }else{
                    document.body.removeChild(document.getElementById(this.parentContainerStart+id));
                }
                containerCopy=$('[template="'+this.currentSettings['template']+'"]').clone().removeAttr('template');
                this.savedContainersTemplates[id]=this.currentSettings['template'];
                containerCopy.attr('id',containerCopy.attr('id')+id);
                containerCopy.find('#'+this.messageIdStart).html(messageBox);
                containerCopy.find('#'+this.messageIdStart).attr('id',containerCopy.find('#'+this.messageIdStart).attr('id')+id);
                containerCopy.find('#'+this.closeIdStart).attr('id',containerCopy.find('#'+this.closeIdStart).attr('id')+id).data('windowId', id);
                containerCopy.find('#'+this.windowInfoStart).attr('id',containerCopy.find('#'+this.windowInfoStart).attr('id')+this.divNum);
                containerCopy.find('#'+this.windowFeedbackLinkStart).attr('href', 'javascript:void(xajax_feedbackPanel(containersStuff.findContaner({saveName:\'feedback\',template:\'untabbed\'}), xajax.getFormValues(\''+this.windowInfoStart+this.divNum+'\')));');
                containerCopy.find('#'+this.windowFeedbackLinkStart).attr('id', containerCopy.find('#'+this.windowFeedbackLinkStart).attr('id')+this.divNum);

                if(this.currentSettings['icon']!=''){
                    containerCopy.find('#'+this.iconsImageClass).html(this.iconsImgText.replace(this.iconsImgReplaceText,this.iconsWebdir+this.currentSettings['icon']));
                }else{
                    containerCopy.find('#'+this.iconsImageClass).html('');
                }
                containerCopy.find('#'+this.handleTitleClass).html(messageTitle);
                $('body').append(containerCopy);
//                alert(document.getElementById(this.parentContainerStart+id).style.left);
//                document.getElementById(this.parentContainerStart+id).style.left=positionThisleft;
//                document.getElementById(this.parentContainerStart+id).style.top=positionThistop;
//                alert(document.getElementById(this.parentCont ainerStart+id).style.left);
                positionThisleft='';positionThistop='';
                messageBox='';
                messageTitle='';
                delete messageTitle;
                delete messageBox;
            }
            if(showit){
                this.showDrag(id);
                this.modalContainer(id);
            }
//            alert(messageTitle);
//            alert(messageBox);
        }
    },
    create: function() {
        this.divNum=this.divNum+1;
//        alert(this.currentSettings['template']);
//        alert($('#'+this.parentContainerStart).attr('template',this.currentSettings['template']))
//        containerCopy=$('#'+this.parentContainerStart).clone();
        // containerCopy=$('template["'+this.currentSettings['template']+'"]').clone();
        containerCopy=$('[template="'+this.currentSettings['template']+'"]').clone().removeAttr('template');
        this.savedContainersTemplates[this.divNum]=this.currentSettings['template'];
//        alert(uneval(containerCopy));

        containerCopy.attr('id',containerCopy.attr('id')+this.divNum);
        containerCopy.find('#'+this.messageIdStart).html(this.messageTextStart);
        containerCopy.find('#'+this.messageIdStart).attr('id',containerCopy.find('#'+this.messageIdStart).attr('id')+this.divNum);
        containerCopy.find('#'+this.closeIdStart).attr('id',containerCopy.find('#'+this.closeIdStart).attr('id')+this.divNum).data('windowId', this.divNum);
        containerCopy.find('#'+this.windowInfoStart).attr('id',containerCopy.find('#'+this.windowInfoStart).attr('id')+this.divNum);
        containerCopy.find('#'+this.windowFeedbackLinkStart).attr('href', 'javascript:void(xajax_feedbackPanel(containersStuff.findContaner({saveName:\'feedback\',template:\'untabbed\'}), xajax.getFormValues(\''+this.windowInfoStart+this.divNum+'\')));');
        containerCopy.find('#'+this.windowFeedbackLinkStart).attr('id', containerCopy.find('#'+this.windowFeedbackLinkStart).attr('id')+this.divNum);

        if(this.currentSettings['icon']!=''){
            containerCopy.find('#'+this.iconsImageClass).html(this.iconsImgText.replace(this.iconsImgReplaceText,this.iconsWebdir+this.currentSettings['icon']));
        }else{
            containerCopy.find('#'+this.iconsImageClass).html('');
        }
        containerCopy.find('#'+this.handleTitleClass).html(this.currentSettings['title']);
        $('body').append(containerCopy);
        return this.divNum;
    },
    showDrag: function(divNum){
        idToShow=this.parentContainerStart+divNum;
        if(this.currentSettings['dragable']==true){
            dragObj.init(idToShow);
            $('#'+this.parentContainerStart+divNum).find('#'+this.handleId).attr('class',this.handleSelectedClass+' '+this.defDragmeClassName);
        }else{
            $('#'+this.parentContainerStart+divNum).find('#'+this.handleId).attr('class',this.handleSelectedClass+' dragmeNo');
        }
        if(this.currentSettings['icon']!=''){
            $('#'+this.parentContainerStart+divNum).find('#'+this.iconsImageClass).html(this.iconsImgText.replace(this.iconsImgReplaceText,this.iconsWebdir+this.currentSettings['icon']));
        }else{
            $('#'+this.parentContainerStart+divNum).find('#'+this.iconsImageClass).html('');
        }
        document.getElementById(idToShow).className=this.parentContainerClass;
        $('#'+this.parentContainerStart+divNum).find('#'+this.handleTitleClass).html(this.currentSettings['title']);

        var noPosition=false;
        this.playSounds = true;
        if((this.currentSettings['saveName']!='')&&(this.currentSettings['resetPosition']==false)&&(document.getElementById(idToShow).style.visibility == "visible")){
            this.playSounds = false;
            noPosition=true;
        }
        if(this.currentSettings['saveName']==this.modalTitle){
            noPosition=false;
        }

        this.show(idToShow);
        if(noPosition==false){
                if(typeof containersStuff.positionedContainers[divNum] != 'undefined'){
                    containersStuff.positionedContainers[divNum]=false;
                }
            this.PosDrag(idToShow);
        }
        for(var k in containersStuff.openOrder){
            if(containersStuff.openOrder[k]==divNum){
                containersStuff.openOrder.splice(k,1);
            }
        }

        containersStuff.openOrder.push(divNum);
        dw_event.add( document, "keydown", this.checkKey,  true );
    },
    scrollTop: function(){
        var STop = 0;
        if( typeof( window.pageYOffset ) == 'number' ) {
            STop = window.pageYOffset;
        } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
            STop = document.body.scrollTop;
        } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
            STop = document.documentElement.scrollTop;
        }
        return STop;
    },
    PosDrag: function(divId){
        el=divId;
        div=document.getElementById(el);
        if(this.currentSettings['positionElementId']==''){
            if(this.currentSettings['positionLeft']=='center'){
                middleX=Math.round(this._heScreenWidth()/2);
                div.style.left=(eval(middleX+'-'+this.offX))+'px';
            }else{
                div.style.left=((isNaN(parseFloat(this.currentSettings['positionLeft'])))?0:parseFloat(this.currentSettings['positionLeft']))+'px';
            }
            if(this.currentSettings['positionTop']=='center'){
                middleY=Math.round(this._heScreenHeight()/2);
                div.style.top=(eval(middleY+'-'+this.offY))+'px';
            }else{

                div.style.top=((isNaN(parseFloat(this.currentSettings['positionTop'])))?0:parseFloat(this.currentSettings['positionTop']))+'px';
            }
            if(this.currentSettings['positionVisibleScreen']==true){
                z=div.style.top;
                tmp=z.split("px");
                div.style.top=eval(tmp[0]+"+"+this.scrollTop())+'px';
            }
        }else{
            if(document.getElementById(this.currentSettings['positionElementId']) != null){
                var customElementPossition=$('#'+this.currentSettings['positionElementId']).offset();
                customElementPossition.left=customElementPossition.left+((isNaN(parseFloat(this.currentSettings['positionLeft'])))?0:parseFloat(this.currentSettings['positionLeft']));
                customElementPossition.top=customElementPossition.top+((isNaN(parseFloat(this.currentSettings['positionTop'])))?0:parseFloat(this.currentSettings['positionTop']));

                div.style.left=customElementPossition.left+"px";
                div.style.top=customElementPossition.top+"px";
                if(this.currentSettings['positionElementId']=='cuirass'){
                    if(this.currentSettings['positionLeft']=='center'){
                        middleX=Math.round($('#'+this.currentSettings['positionElementId']).width()/2);
                        middleX=middleX+customElementPossition.left;
                        div.style.left=(eval(middleX+'-'+this.offX))+'px';
                    }
                    if(this.currentSettings['positionTop']=='center'){
                        middleY=Math.round(this._heScreenHeight()/2);
                        div.style.top=(eval(middleY+'-'+this.offY))+'px';
                        if(this.currentSettings['positionVisibleScreen']==true){
                            z=div.style.top;
                            tmp=z.split("px");
                            div.style.top=eval(tmp[0]+"+"+this.scrollTop())+'px';
                        }
                    }
                }
                if(this.currentSettings['positionVisibleScreen']==true){
                    z=div.style.top;
                    tmp=z.split("px");
                    div.style.top=eval(tmp[0]+"+"+this.scrollTop())+'px';
                }
            }
//            if()
        }

    },
    afterPositioning: function(){
//        if(typeof arguments[0]!='undefined'){
//            forceMove=arguments[0];
//        }

        testSee=containersStuff.findCurrentActive();
        if(testSee == 'notification'){
            containersStuff.positionedContainers[containersStuff.savedContainers[testSee]]=false;
        }
//        alert(containersStuff.positionedContainers[containersStuff.savedContainers[testSee]]);
//        alert(containersStuff.savedContainers[testSee]);
//alert(uneval(this.positionedContainers[testSee]));
        if(containersStuff.positionedContainers[containersStuff.savedContainers[testSee]] == false){
//.height()
            elWidth=$('#'+containersStuff.parentContainerStart+containersStuff.savedContainers[testSee]).width();
            elHeight=$('#'+containersStuff.parentContainerStart+containersStuff.savedContainers[testSee]).height();

            if(containersStuff._heScreenHeight()>elHeight){
                moveTopTo=((eval((661/2)-(elHeight/2))>101)?101:eval((661/2)-(elHeight/2)));
                if(moveTopTo<5){
                    moveTopTo=5;
                }
                moveTopTo=moveTopTo+parseInt(containersStuff.scrollTop());
                document.getElementById(containersStuff.parentContainerStart+containersStuff.savedContainers[testSee]).style.top=moveTopTo+'px';
            }
            if(containersStuff._heScreenWidth()>elWidth){
                document.getElementById(containersStuff.parentContainerStart+containersStuff.savedContainers[testSee]).style.left=eval((containersStuff._heScreenWidth()/2)-(elWidth/2))+'px';
            }
        }
        containersStuff.positionedContainers[containersStuff.savedContainers[testSee]]=true;

//        $('#'+containersStuff.parentContainerStart+containersStuff.savedContainers[idCont]).css('visibility')

    },
    checkKey: function(e) { // check for esc key
        e = e? e: window.event;  if ( e.keyCode == 27 ) {
            var testSee=containersStuff.findCurrentActive();

//            alert(parentContainerStart+containersStuff.savedContainers[testSee]);
            if(testSee!=''){


//                containersStuff.openOrder.push(divId);
                containersStuff.hideContainer(containersStuff.savedContainers[testSee]);
//                var found = false;
//                for(idCont in containersStuff.savedContainers){
//                    if(found==false){
//                        if(($('#'+containersStuff.parentContainerStart+containersStuff.savedContainers[idCont]).css('visibility')=='visible')&&(($('#'+containersStuff.parentContainerStart+containersStuff.savedContainers[idCont]).css('display')=='block'))){
////                            this.currentSettings['title']
//                            containersStuff.currentSettings['title']=$('#'+containersStuff.parentContainerStart+containersStuff.savedContainers[idCont]).find('#'+containersStuff.handleTitleClass).html();
//                            containersStuff.showDrag(containersStuff.savedContainers[idCont]);
//                            found=true;
//                        }
//                    }
//                }
            }
            else{containersStuff.hide();}

        }

//        e = e? e: window.event;  if ( e.keyCode == 27 ) {containersStuff.hide();}
    },
    hide: function() {
        if(typeof arguments[0]!='undefined'){
            noHideId=arguments[0];
        }else{
            noHideId=0;
        }

        $('#dragDivdTutorial').removeAttr('class');
        $('#dragDivdTutorial2').removeAttr('class');
        $('#dragDivNotification0').removeAttr('class');

        $('.'+containersStuff.handleDeselectedClass+'.'+this.parentContainerClass).attr('class',this.parentContainerClass);

        notHide = '#' + containersStuff.parentContainerStart + noHideId;
        $.each(this.savedContainersNums, function(key, value) {
            if(typeof value !='undefined' && value.toString().indexOf("activeChat") != -1) {
                notHide = notHide + ', #'+containersStuff.parentContainerStart+key
            }
        });

        $dragDivX = $('.'+this.parentContainerClass + ':not('+ notHide +')');
        $dragDivX.css('visibility','hidden');

        $("#overlay").css('display','none');
//        $('#dragDivdTutorial').attr('class',this.parentContainerClass);
        $('.messageboxClass', $dragDivX).html(this.messageTextStart);

        containersStuff.openOrder=[];
        if(noHideId>0){
            containersStuff.openOrder.push(noHideId);
        }
    },
    hideContainer: function(divId){
        if(parseInt(divId)>0){
            // remove global map reload sound
            if (this.savedContainersNums[divId] == "global_map") {
                if ($('#village').hasClass('play-music')) {
                    getFlashMovieObject("village").reloadSounds();
                }
                typeof map !== 'undefined' && map.close();
            }

            if (this.savedContainersNums[divId] == "chl_reg") {
                if ($('#village').hasClass('play-music')) {
                    getFlashMovieObject("village").playPause(1);
                }
            }
            $('#'+this.parentContainerStart+parseInt(divId)).css('visibility','hidden');
            $('#'+this.parentContainerStart+parseInt(divId)).find(".messageboxClass").html(containersStuff.messageTextStart);
            if(!isNaN(parseInt(containersStuff.savedContainers['modal']))){
                if(this.parentContainerStart+parseInt(containersStuff.savedContainers['modal']) == (this.parentContainerStart+parseInt(divId))){
                    $("#overlay").css('display','none');
                }
            }
            for(var k in containersStuff.openOrder){
                if(containersStuff.openOrder[k]==divId){
                    containersStuff.openOrder.splice(k,1);
                }
            }

//            var found = false;

            if(containersStuff.openOrder.length>0){
                idToshow=containersStuff.openOrder.pop();
                if(($('#'+containersStuff.parentContainerStart+idToshow).css('visibility')=='visible')&&(($('#'+containersStuff.parentContainerStart+idToshow).css('display')=='block'))){
                    this.currentSettings['positionVisibleScreen']=false;
                    containersStuff.currentSettings['title']=$('#'+containersStuff.parentContainerStart+idToshow).find('#'+containersStuff.handleTitleClass).html();
                    this.currentSettings['saveName']    = this.savedContainersNums[idToshow];
                    containersStuff.showDrag(idToshow);
                }
            }

//                for(idCont in containersStuff.savedContainers){
//                    if(found==false){
//                        if(($('#'+containersStuff.parentContainerStart+containersStuff.savedContainers[idCont]).css('visibility')=='visible')&&(($('#'+containersStuff.parentContainerStart+containersStuff.savedContainers[idCont]).css('display')=='block'))){
////                            this.currentSettings['title']
//                            containersStuff.currentSettings['title']=$('#'+containersStuff.parentContainerStart+containersStuff.savedContainers[idCont]).find('#'+containersStuff.handleTitleClass).html();
//                            alert(containersStuff.savedContainers[idCont]);
//                            this.currentSettings['positionVisibleScreen']=false;
//                            containersStuff.showDrag(containersStuff.savedContainers[idCont]);
//                            found=true;
//                        }
//                    }
//                }
        }else{
            if(divId=='dTutorial'){
                    $('#'+this.parentContainerStart+divId).css('visibility','hidden');
                    $('#'+this.parentContainerStart+divId).find("#messageboxdTutorial").html(containersStuff.messageTextStart);
            }
            if(divId=='dTutorial2'){
                    $('#'+this.parentContainerStart+divId).css('visibility','hidden');
                    $('#'+this.parentContainerStart+divId).find("#messageboxdTutorial2").html(containersStuff.messageTextStart);
            }
            if(divId=='Notification0'){
                $('#'+this.parentContainerStart+divId).css('visibility','hidden');
                $('#'+this.parentContainerStart+divId).find("#messageboxNotification").html(containersStuff.messageTextStart);
            }
            if(containersStuff.openOrder.length>0){
                idToshow=containersStuff.openOrder.pop();
                if(($('#'+containersStuff.parentContainerStart+idToshow).css('visibility')=='visible')&&(($('#'+containersStuff.parentContainerStart+idToshow).css('display')=='block'))){
                    this.currentSettings['positionVisibleScreen']=false;
                    containersStuff.currentSettings['title']=$('#'+containersStuff.parentContainerStart+idToshow).find('#'+containersStuff.handleTitleClass).html();
                    containersStuff.showDrag(idToshow);
                }
            }
        }

        /* IO-1794
         * var $sounds = $.parseJSON($('#village').attr('rel'));
        getFlashMovieObject("village").playSound($sounds['closeSound']);*/
    },
    show: function(divId){

        if(divId=='dTutorial'){
            $('#'+this.parentContainerStart+divId).find("#messageboxdTutorial").html(containersStuff.messageTextStart);
        }
        if(divId=='dTutorial2'){
            $('#'+this.parentContainerStart+divId).find("#messageboxdTutorial2").html(containersStuff.messageTextStart);
        }
        if(divId=='Notification0'){
            $('#'+this.parentContainerStart+divId).find("#messageboxNotification").html(containersStuff.messageTextStart);
        }
        if(this.currentSettings['positionVisible']==true){
            document.getElementById(divId).style.visibility = "visible";

            document.getElementById(divId).style.zIndex=1000;
            containersStuff.tryFlashContainer(divId);
            $('ul.ui-autocomplete').css('zIndex','901');
            $('ul.parentContainer'+divId.match(/[0-9]+/).toString()).css('zIndex','1001');
        }
    },
    trySelectWindow: function(e){
        // check for esc key
//        e = e? e: window.event;

        var re = new RegExp(containersStuff.parentContainerStart,"g");
        var re3 = new RegExp("shortcut","g");
        var noChange=false;
        e = dw_event.DOMit(e);
        if((e.tgt.nodeName!='A')&&(noCheck!=true)){

                if(e.tgt.id.match(re3)){
                    noChange=true;
                }else{
                    var stopLoop=false;
                    if(e.tgt.parentNode!=null){
                        var parEl=e.tgt.parentNode;
                        while((stopLoop==false)||(parEl == null)){
                            if(parEl.parentNode!=null){
                                parEl=parEl.parentNode;
                                if((parEl.id!='')&&(typeof parEl.id!='undefined')){
                                    if(parEl.id.match(re3)){
                                        noChange=true;
                                        stopLoop=true;
                                    }
                                }
                            }else{
                                stopLoop=true;
                            }
                        }
                    }
                }

                if(noChange==false){
                    $('.'+containersStuff.handleSelectedClass+'.'+containersStuff.defDragmeClassName).attr('class',containersStuff.handleDeselectedClass+' '+containersStuff.defDragmeClassName);
                    $('.'+containersStuff.parentContainerClass).attr('class',containersStuff.handleDeselectedClass+' '+containersStuff.parentContainerClass);
                    if(e.tgt.id==containersStuff.handleId){
                        e.tgt.className=containersStuff.handleSelectedClass+' '+containersStuff.defDragmeClassName;
                    }else{
                        if(e.tgt.id.match(re)){
                            $('#'+e.tgt.id).find('#'+containersStuff.handleId).attr('class',containersStuff.handleSelectedClass+' '+containersStuff.defDragmeClassName);
                        }else{
                            var stopLoop=false;
                            if(e.tgt.parentNode!=null){
                                var parEl=e.tgt.parentNode;
                                while((stopLoop==false)||(parEl == null)){
                                    if(parEl.parentNode!=null){
                                        parEl=parEl.parentNode;
                                        if((parEl.id!='')&&(typeof parEl.id!='undefined')){
                                            if(parEl.id.match(re)){
                                                $('#'+parEl.id).find('#'+containersStuff.handleId).attr('class',containersStuff.handleSelectedClass+' '+containersStuff.defDragmeClassName);
                                                $('#'+parEl.id).attr('class',containersStuff.parentContainerClass);
                                                $('.'+containersStuff.parentContainerClass).css('zIndex','900');
                                                $('ul.ui-autocomplete').css('zIndex','901');
                                                parEl.style.zIndex=dragObj.zOrder;
                                                if(parEl.id.match(/[0-9]+/)!=null){
                                                    $('ul.parentContainer'+parEl.id.match(/[0-9]+/).toString()).css('zIndex',parEl.style.zIndex+1);
                                                }
                                                stopLoop=true;
                                                for(var k in containersStuff.openOrder){
                                                    if(containersStuff.parentContainerStart+containersStuff.openOrder[k]==parEl.id){
                                                        containersStuff.openOrder.splice(k,1);
                                                    }
                                                }

                                                containersStuff.openOrder.push(parEl.id.substr(containersStuff.parentContainerStart.length));
                                                for(var k in containersStuff.openOrder){
                                                    document.getElementById(containersStuff.parentContainerStart+containersStuff.openOrder[k]).style.zIndex=
                                                    eval(document.getElementById(containersStuff.parentContainerStart+containersStuff.openOrder[k]).style.zIndex+"+"+k);
                                                }
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
        }

    },
    tryFlashContainer: function(tryId){
        if (typeof containersStuff.savedContainers['global_map'] != 'undefined') {
            if(document.getElementById(containersStuff.parentContainerStart+''+containersStuff.savedContainers['global_map']).style.visibility == 'visible') {
                if(tryId == containersStuff.parentContainerStart+''+containersStuff.savedContainers['global_map']){
                  if (document.getElementById(MAP_FLASH_NAME)!=null){
//                      document.getElementById(MAP_FLASH_NAME).style.display='block';
//                      document.getElementById(MAP_FLASH_NAME_SNAP).style.visibility='hidden';
                      document.getElementById(MAP_FLASH_NAME).parentNode.style.top='5px';
                      document.getElementById(MAP_FLASH_NAME_SNAP).parentNode.style.top='10000px';
                  }
                }else{
                  if (document.getElementById(MAP_FLASH_NAME)!=null){
                      moveFlashCheck=1;
                      setTimeout(function(){getFlashMovieObject(MAP_FLASH_NAME).setInvisible();},0);
                  }
                }
            }
        }
    },
    switchMapsToInvis: function(){
        if (typeof containersStuff.savedContainers['global_map'] != 'undefined') {
            if(document.getElementById(containersStuff.parentContainerStart+''+containersStuff.savedContainers['global_map']).style.visibility == 'visible') {
                if (document.getElementById(MAP_FLASH_NAME)!=null){
                    if(moveFlashCheck==1){
//                        document.getElementById(MAP_FLASH_NAME).style.display='none';
//                        document.getElementById('map_snap').style.visibility='visible';
//                        document.getElementById(MAP_FLASH_NAME_SNAP).style.visibility='visible';
                        document.getElementById(MAP_FLASH_NAME).parentNode.style.top='10000px';
                        document.getElementById(MAP_FLASH_NAME_SNAP).parentNode.style.top='5px';
                    }
                    moveFlashCheck=2;
                }
            }
        }
    },
    findCurrentActive:function(){
//        if(typeof $('.'+this.handleSelectedClass+'.'+this.defDragmeClassName).parents('.'+this.parentContainerClass).attr('id') == 'undefined'){
////            alert(this.handleSelectedClass+'.'+this.defDragmeClassName);
//            return '';
//        }
//alert(typeof $('[class='+containersStuff.parentContainerClass+"]").attr('id'));

        if(typeof $('[class='+containersStuff.parentContainerClass+"]").attr('id') == 'undefined'){
            return "";
        }
//        alert($('[class='+containersStuff.parentContainerClass+"]").attr('id'));
        if($('[class='+containersStuff.parentContainerClass+"]").attr('id').replace(containersStuff.parentContainerStart,'') == containersStuff.savedContainers['notification']){
            return 'notification';
        }else{
            return this.savedContainersNums[parseInt($('[class='+containersStuff.parentContainerClass+"]").attr('id').replace(this.parentContainerStart,''))];
        }
//         var test=$('.'+this.handleSelectedClass+'.'+this.defDragmeClassName).parents('.'+this.parentContainerClass).attr('id');
//         alert(test);
//         var test=$('.'+this.handleSelectedClass+'.'+this.defDragmeClassName).parents('.'+this.parentContainerClass).attr('id').replace(this.parentContainerStart,'');
        return this.savedContainersNums[parseInt($('.'+this.handleSelectedClass+'.'+this.defDragmeClassName).parents('.'+this.parentContainerClass).attr('id').replace(this.parentContainerStart,''))];
    }
};
function switchMapsToInvis(){
    containersStuff.switchMapsToInvis();
}
// on the homepage we do not have dw stuff
if (typeof dw_event != 'undefined') {
    if (window.DocumentTouch && document instanceof DocumentTouch) {
        dw_event.add( document, "touchstart", containersStuff.trySelectWindow, false );
    }else{
        dw_event.add( document, "mousedown", containersStuff.trySelectWindow,  false );
    }
}
var isIE = document.all?true:false;
var _x;
var _y;
var _heElTop;
var _heElLeft;
//function getMousePosition(mp){
//if (!isIE) {
//    _x = mp.pageX;
//    _y = mp.pageY;
//    _heElTop = window.innerHeight;
//    _heElLeft = window.innerWidth;
//} else {
//    _x = event.clientX + document.body.scrollLeft;
//    _y = event.clientY + document.body.scrollTop;
//    _heElTop = document.body.offsetHeight;
//    _heElLeft = document.body.offsetWidth;
//}
//return true;
//}
//function getMousePositionTouch(mp){
//if (!isIE) {
//    _x = mp.touches[0].pageX;
//    _y = mp.touches[0].pageY;
//    _heElTop = window.innerHeight;
//    _heElLeft = window.innerWidth;
//} else {
//    _x = event.clientX + document.body.scrollLeft;
//    _y = event.clientY + document.body.scrollTop;
//    _heElTop = document.body.offsetHeight;
//    _heElLeft = document.body.offsetWidth;
//}
//return true;
//}
//if (window.DocumentTouch && document instanceof DocumentTouch) {
//    document.ontouchmove = getMousePositionTouch;
//}else{
//    document.onmousemove = getMousePosition;
//}


function addTextToBox(container,text){
    document.getElementById(container).innerHTML=text;
}
function getScroll(){
    var scrollTop=0;
    if( typeof( window.pageYOffset ) == 'number' ) {
        scrollTop = window.pageYOffset;
    } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
        scrollTop = document.body.scrollTop;
    } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
        scrollTop = document.documentElement.scrollTop;
    }
    return scrollTop;
}
function heightTopLeft(){
    if (!isIE) {
        _heElTop = window.innerHeight;
        _heElLeft = window.innerWidth;
    }
    if (isIE) {
        _heElTop = document.body.offsetHeight;
        _heElLeft = document.body.offsetWidth;
    }
}
function showHideDiv(id){
    if (document.getElementById(id).style.display == 'none'){
        document.getElementById(id).style.display='block';
    }else{
        document.getElementById(id).style.display='none';
    }
}
function SetFocusTop(){
    self.scrollTo(0, 0);
    return true;
}
function checkOpen(id){
    if(document.getElementById('dragDiv'+id).style.visibility == 'hidden'){
        return 1;
    }
    return 0;
}
function loadVillage(){
    if(typeof $.fn.maphilight == 'function'){
        var args;
//        alert(args);
        if (arguments.length > 1) {
            args = arguments[0];
        }
        if(typeof args == 'undefined'){
            args='';
        }
        if((args=='')||(args=='map')){
//            $('.map.on').html('');
            $('.map.on').empty();
//            $('.map.on').remove();
//            document.getElementById('mapHolder').innerHTML='&nbsp;';
//            alert(args);
        }
//        alert(args);

//        setTimeout(
//            function(){
//                xajax_loadVillage();
//                setTimeout(
//                    function(){
//                        $('.mapBKG').maphilight({fillColor: 'FFFFFF'});
//                    }
//                ,5);
//            },5
//        );
        setTimeout("xajax_loadVillage("+args+");",5);
//
    }
}
function loadMap(){
    document.getElementById('testvamsi').style.width=(parseInt(document.getElementById('testvamsi').style.width)+1)+'px';
    $('.mapBKGClass').maphilight({fillColor: 'FFFFFF'});
    document.getElementById('testvamsi').style.width=(parseInt(document.getElementById('testvamsi').style.width)+1)+'px';
}
function textLimitCheck(field, maxlen) {
//    if (field.value.length > maxlen + 1)
    if (field.value.length > maxlen)
    field.value = field.value.substring(0, maxlen);
}
function IsNumericInit(sText){
    var ValidChars = "0123456789";
    // var IsFirst=true;
    var Char;
    var h1=0;
    var z='';

    for (var i = 0; i < sText.length; i++){
        Char = sText.charAt(i);

        if (ValidChars.indexOf(Char) == -1){

        }else{
            if((sText.charAt(i)!=0)||(h1==1)){
                z=z + sText.charAt(i);
                h1=1;
            }
        }
    }
    if(z == '') {
        z = '';
    } else {
        z = parseInt(z, 10);
    }
    return z;
}
function inputhr(el,el2,t){
    z=document.getElementById(el).innerHTML;
    if(t=='in'){
        p=document.getElementById('ost').innerHTML;

        if(el2!='irt'){
            i=document.getElementById('irt').value;
        }else{i='0';}
        if(el2!='iwt'){
            w=document.getElementById('iwt').value;
        }else{w='0';}
        if(el2!='ist'){
            s=document.getElementById('ist').value;
        }else{s='0';}
        if(el2!='igt'){
            g=document.getElementById('igt').value;
        }else{g='0';}
        h=eval(i+'+'+w+'+'+s+'+'+g);
        m=eval(p+'-'+h);
        if(z>m){document.getElementById(el2).value=m;}
        else{document.getElementById(el2).value=z;}

    }else{
        document.getElementById(el2).value=z;
    }
}
function switchMenu(el){
    if(document.getElementById(el).style.display=='none'){
        document.getElementById(el).style.display='block';
    }else{
        document.getElementById(el).style.display='none';
    }
}
function updateAttrById(id, attribute, value)
{
    $('#' + id).attr(attribute, value);
}
function updateTextById(id, value)
{
    $('#' + id).text(value);
}
function updateHtmlById(id, value)
{
    $('#' + id).html(value);
}
function prependToAttrById(id, attribute, prefix)
{
    var currentContent = $('#' + id).attr(attribute);
    $('#' + id).attr(attribute, prefix + currentContent);
}
function prependToTextById(id, prefix)
{
    var currentContent = $('#' + id).text();
    $('#' + id).text(prefix + currentContent);
}
function prependToHtmlById(id, prefix)
{
    var currentContent = $('#' + id).text();
    $('#' + id).html(prefix + currentContent);
}
function appendToAttrById(id, attribute, appendix)
{
    var currentContent = $('#' + id).attr(attribute);
    $('#' + id).attr(attribute, currentContent + appendix);
}
function appendToTextById(id, appendix)
{
    var currentContent = $('#' + id).text();
    $('#' + id).text(currentContent + appendix);
}
function appendToHtmlById(id, appendix)
{
    var currentContent = $('#' + id).text();
    $('#' + id).html(currentContent + appendix);
}
function limitText(limitField, limitCount, limitNum) {
    if (limitField.value.length > limitNum) {
        limitField.value = limitField.value.substring(0, limitNum);
    } else {
        limitCount.value = limitNum - limitField.value.length;
    }
}
function limitText2(limitField, limitCount, limitNum) {
    if (limitField.value.length > limitNum) {
        limitField.value = limitField.value.substring(0, limitNum);
    } else {
        limitCount.innerHTML = limitNum - limitField.value.length;
    }
}
function checkForEnterSubmit( user_event ){
    var charCode = (user_event.which) ? user_event.which : window.event.keyCode;

    if (charCode == 13){
        return 1;
    }
    return 0;
}
function checkUncheckAll(theElement, theName) {
    if(typeof theName!='undefined'){
        theName += "[]";
        var theForm = theElement.form;
        var z = 0;

        for(z=0; z<theForm.length;z++){
            if(theForm[z].type == 'checkbox' && theForm[z].name != 'checkall' && theForm[z].name == theName){
                theForm[z].checked = theElement.checked;
            }
        }
    } else {
        var theForm = theElement.form;
        var z = 0;

        for(z=0; z<theForm.length;z++){
            if(theForm[z].type == 'checkbox' && theForm[z].name != 'checkall'){
                theForm[z].checked = theElement.checked;
            }
        }
    }
}
/*
function checkUncheckAll(theElement) {
    var theForm = theElement.form, z = 0;
    for(z=0; z<theForm.length;z++){
        if(theForm[z].type == 'checkbox' && theForm[z].name != 'checkall'){
            theForm[z].checked = theElement.checked;
        }
    }
}
*/
function checkboxTogleElement ( theCheckbox, theElement ){
    if(typeof document.getElementById(theCheckbox) != 'undefined' ){
        if(typeof document.getElementById(theElement) != 'undefined' ){
            var    checkbox_status    = document.getElementById(theCheckbox).checked;
            if(!checkbox_status){
                document.getElementById(theElement).checked    = checkbox_status;
            }
        }
    }
}

function feedbackEmoticons( group_num, element_to_select, text_to_show ){
    var hidden_element        = 'feedback_opinion'+group_num;
    var negative_element    = 'giveFeedbackNegative';
    var neutral_element        = 'giveFeedbackNeutral';
    var positive_element    = 'giveFeedbackPositive';
    var    activeClassName        = 'Active';
    var label_element        = 'feedback_opinion_text'+group_num;

    document.getElementById(hidden_element).value        = element_to_select;
    document.getElementById(label_element).innerHTML    = text_to_show;

    if( element_to_select == 1 ){
        document.getElementById(negative_element+'_'+group_num).className    = negative_element+activeClassName;
        document.getElementById(neutral_element+'_'+group_num).className    = neutral_element;
        document.getElementById(positive_element+'_'+group_num).className    = positive_element;
    }

    if( element_to_select == 2 ){
        document.getElementById(negative_element+'_'+group_num).className    = negative_element;
        document.getElementById(neutral_element+'_'+group_num).className    = neutral_element+activeClassName;
        document.getElementById(positive_element+'_'+group_num).className    = positive_element;
    }

    if( element_to_select == 3 ){
        document.getElementById(negative_element+'_'+group_num).className    = negative_element;
        document.getElementById(neutral_element+'_'+group_num).className    = neutral_element;
        document.getElementById(positive_element+'_'+group_num).className    = positive_element+activeClassName;
    }
}

//
function getFlashMovieObject(movieName)
{
    return $("#"+movieName).get(0);
}

function displayMap() {
    map.init.apply(map, arguments);
}

function displayFlash(contId,width,height,source,name,flashvar,wmodeTrans,bgcolor,append,styleAdd)
{
    /*
    add='';
    if (bgcolor == '' || ) {
        bgcolor = '#ffffff';
    }

    text='';
    text=text+'<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="'+width+'" height="'+height+'" id="'+name+'" align="middle">' + "\n";
    text=text+'     <param name="allowScriptAccess" value="always">' + "\n";
    text=text+'     <param name="movie" value="'+source+'.swf">' + "\n";
    text=text+'     <param name="menu" value="false">' + "\n";
    text=text+'     <param name="quality" value="high">' + "\n";
    text=text+'     <param name="scale" value="showall">' + "\n";
    text=text+'     <param name="bgcolor" value="'+bgcolor+'">' + "\n";
    if (wmodeTrans == 1) {
        text=text+'     <param name="wmode" value="transparent">' + "\n";
        add=' wmode="transparent"';
    } else {
        text=text+'     <param name="wmode" value="opaque">' + "\n";
        add=' wmode="opaque"';
    }
    text=text+'     <param name="flashVars" value="'+flashvar+'">' + "\n";
    text=text+'     <embed src="'+source+'.swf" menu="false"'+add+' quality="high" scale="showAll" bgcolor="'+bgcolor+'" width="'+width+'" height="'+height+'" name="'+name+'" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+flashvar+'"></embed>' + "\n";
    text=text+'</object>' + "\n";

    document.getElementById(contId).innerHTML= text;
    */

    if (typeof bgcolor == 'undefined' || bgcolor == '') {
        bgcolor = '#c3b18b';
    }

    if(typeof append == 'undefined' || append == '' || append == '0') {
        append=0;
    } else {
        append=1
    }
    if(typeof styleAdd == 'undefined' || styleAdd == '') {
        styleAdd='';
    }
    if(typeof wmodeTrans == 'undefined' || wmodeTrans == '' || wmodeTrans == '0') {
        wmode = 'opaque';
    } else if (wmodeTrans == 1) {
        wmode = 'transparent';
    } else{
        wmode = wmodeTrans;
    }

    text='';
    text += '<object type="application/x-shockwave-flash" data="'+source+'.swf" width="'+width+'" height="'+height+'" id="'+name+'" align="middle">' + "\n";
    text += '     <param name="allowScriptAccess" value="always">' + "\n";
    text += '     <param name="movie" value="'+source+'.swf">' + "\n";
    text += '     <param name="menu" value="false">' + "\n";
    text += '     <param name="quality" value="high">' + "\n";
    text += '     <param name="scale" value="showAll">' + "\n";
    text += '     <param name="bgcolor" value="'+bgcolor+'">' + "\n";

    text +='     <param name="wmode" value="'+wmode+'">' + "\n";
    add=' wmode="'+wmode+'"';

    text += '     <param name="flashVars" value="'+flashvar+'">' + "\n";
    //text += '     <embed src="'+source+'.swf" menu="false"'+add+' quality="high" scale="showAll" bgcolor="'+bgcolor+'" width="'+width+'" height="'+height+'" name="'+name+'" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+flashvar+'"></embed>' + "\n";
    text += '</object>' + "\n";

    if (append==1) {
        document.getElementById(contId).innerHTML += text;
    } else {
       document.getElementById(contId).innerHTML = text;
    }
}

function displayFlash_window(contId,width,height,source,name,flashvar,wmodeTrans,bgcolor){
    add='';
//    alert(source);
//    alert(name);
//    alert(flashvar);
    if( bgcolor == '' ){
        bgcolor = '#c3b18b';
    }
    text='';
    text=text+'<object type="application/x-shockwave-flash" width="'+width+'" height="'+height+'" id="'+name+'" align="middle">' + "\n";
    text=text+'     <param name="allowScriptAccess" value="always">' + "\n";
    text=text+'     <param name="movie" value="'+source+'.swf">' + "\n";
    text=text+'     <param name="menu" value="false">' + "\n";
    text=text+'     <param name="quality" value="high">' + "\n";
    text=text+'     <param name="scale" value="showAll">' + "\n";
    text=text+'     <param name="bgcolor" value="'+bgcolor+'">' + "\n";

    text=text+'     <param name="wmode" value="window">' + "\n";
    add=' wmode="window"';

    text=text+'     <param name="flashVars" value="'+flashvar+'">' + "\n";
    //text=text+'     <embed src="'+source+'.swf" menu="false"'+add+' quality="high" scale="showAll" bgcolor="'+bgcolor+'" width="'+width+'" height="'+height+'" name="'+name+'" align="middle" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+flashvar+'"></embed>' + "\n";
    text=text+'</object>' + "\n";
//    alert(text);
    document.getElementById(contId).innerHTML= text;
}

function exitGame(){
    xajax_casinoTabs(containersStuff.findContaner({saveName:'casino'}), 2);
}

/**
 * Pretty Select jQuery Plugin
 *
 * @author stoyan
 */
(function()
{
    jQuery.fn.prettySelect = function(settings)
    {
        var config = {
            toggleClass: 'opened'
        };

        if (settings !== null) {
            jQuery.extend(config, settings);
        }

        var $target = this;

        var Select = {

            show: function($target)
            {
                jQuery('ul', $target).slideToggle('fast', function()
                {
                    jQuery('em', $target).toggleClass(config.toggleClass);
                    Select._save($target);
                });
            },


            hide: function($target)
            {
                jQuery('ul', $target).slideToggle('fast', function()
                {
                    jQuery('em', $target).removeClass(config.toggleClass);
                    Select._save($target);
                });
            },


            _save: function($target)
            {
                jQuery($target).data('__opened__', jQuery('ul', $target).is(':visible'));
            }
        };


        this.each(function(index)
        {
            var $this = $(this);

            jQuery($this).data('__opened__', false);

            jQuery('a:first', $this).live('click', function()
            {
                if (jQuery($this).data('__opened__')) {
                    Select.hide($target);
                } else {
                    Select.show($this);
                }

                return false;
            });


            jQuery('body').click(function()
            {
                if (jQuery($this).data('__opened__')) {
                    Select.hide($this);
                }
            });

        });

        return this;
    };
})(jQuery);


function closeAvatarWizard(type, saveName)
{
    containersStuff.hideContainer(containersStuff.findContaner({'saveName':saveName}));
    xajax_avatar_refresh(type);
}

function ie6SuxAlot()
{
    if (
        typeof DD_belatedPNG == 'object'
        &&
        typeof DD_belatedPNG.fix == 'function'
    ) {
        DD_belatedPNG.fix('.fix');
    }
}
var focusAssing = {
    checkForKey: function(e){
        e = e?e:window.event;
        if ( e.keyCode == 13 ) {
            focusAssing.customResponce();
        }
        if ( e.keyCode == 27 ) {
            objItem.value='0';
        }
    },
    customResponce: function (){
        eval(customExec);
        return false;
    },
add: function(obj, etype, fp, cap) {
    cap = cap || false;
    if (obj.addEventListener) obj.addEventListener(etype, fp, cap);
    else if (obj.attachEvent) obj.attachEvent("on" + etype, fp);
},
remove: function(obj, etype, fp, cap) {
    cap = cap || false;
    if (obj.removeEventListener) obj.removeEventListener(etype, fp, cap);
    else if (obj.detachEvent) obj.detachEvent("on" + etype, fp);
},
addAction:function(obj,customCode){
    objItem=obj;
    customExec=customCode;
    focusAssing.add( document, "keyup", focusAssing.checkForKey,  true );
}
};

function calcToMaxLevel(id,val,maxLvl) {
    if (val > maxLvl) {
        document.getElementById(id).value=maxLvl;
    }
}
function showFormacion(name,num,curent){
//    alert(name);

//    alert(curent);

    for (var i=1;i<=num;i++){

        if(i == curent){
            document.getElementById(name+i).style.display="block";
        }else{
            document.getElementById(name+i).style.display="none";
        }
    }
}


function calc_transport(prov_id, tip, kolichestvo) {
    kolichestvo = IsNumeric(" " + kolichestvo);
    kolichestvo = parseInt(kolichestvo,10);

    var woodProvValue = parseInt(document.getElementById('wood' + prov_id).value, 10);
    if (isNaN(woodProvValue)) {
        woodProvValue = 0;
    }
    var ironProvValue = parseInt(document.getElementById('iron' + prov_id).value, 10);
    if (isNaN(ironProvValue)) {
        ironProvValue = 0;
    }
    var stoneProvValue = parseInt(document.getElementById('stone' + prov_id).value, 10);
    if (isNaN(stoneProvValue)) {
        stoneProvValue = 0;
    }
    var tipValue = parseInt(document.getElementById(tip).value, 10);
    if (isNaN(tipValue)) {
        tipValue = 0;
    }
    max_tovar = document.getElementById('max_tovar'+prov_id).value;
    total_tovar = woodProvValue + ironProvValue + stoneProvValue;

    free_tovar = max_tovar - total_tovar + tipValue;
    new_stoinost = 0;
    if (free_tovar >= kolichestvo) {
        new_stoinost = kolichestvo;
    }
    if (free_tovar < kolichestvo && free_tovar > 0) {
        new_stoinost = free_tovar;
    }

    new_stoinost = parseInt(new_stoinost,10);

    document.getElementById(tip).value = new_stoinost;
    document.getElementById(tip+'_sub').value = new_stoinost;
    if(document.getElementById('woodTotalText') != null){
    document.getElementById('woodTotalText').innerHTML=0;
    }
    if(document.getElementById('ironTotalText') != null){
    document.getElementById('ironTotalText').innerHTML=0;
    }
    if(document.getElementById('stoneTotalText') != null){
    document.getElementById('stoneTotalText').innerHTML=0;
    }
    dataForm=getFormValues('transport');
    for(k in dataForm) {
        var re = /(wood\d+_sub)/i;
        var re2 = /(iron\d+_sub)/i;
        var re3 = /(stone\d+_sub)/i;
        if(k.match( re )){
            if(document.getElementById('woodTotalText') != null){
                document.getElementById('woodTotalText').innerHTML = number_format(parseInt(document.getElementById('woodTotalText').innerHTML.replace(/ /g,'').replace(/&nbsp;/g,'')) + parseInt(dataForm[k]), 0, '', '&nbsp;');
            }
        }
        if(k.match( re2 )){
            if(document.getElementById('ironTotalText') != null){
                document.getElementById('ironTotalText').innerHTML = number_format(parseInt(document.getElementById('ironTotalText').innerHTML.replace(/ /g,'').replace(/&nbsp;/g,'')) + parseInt(dataForm[k]), 0, '', '&nbsp;');
            }
        }
        if(k.match( re3 )){
            if(document.getElementById('stoneTotalText') != null){
                document.getElementById('stoneTotalText').innerHTML = number_format(parseInt(document.getElementById('stoneTotalText').innerHTML.replace(/ /g,'').replace(/&nbsp;/g,'')) + parseInt(dataForm[k]), 0, '', '&nbsp;');
            }
        }
    }
}
getFormValues = function(parent){
    var submitDisabledElements = false;
    if (arguments.length > 1 && arguments[1] == true){submitDisabledElements = true;}
    var prefix = '';
    if(arguments.length > 2)
        prefix = arguments[2];
    if ('string' == typeof parent){parent = document.getElementById(parent);}
    var aFormValues = {};
    if (parent){if (parent.childNodes){    _getFormValues(aFormValues, parent.childNodes, submitDisabledElements, prefix);}}
    return aFormValues;
};
_getFormValues = function(aFormValues, children, submitDisabledElements, prefix){
    var iLen = children.length;
    for (var i = 0; i < iLen; ++i) {
        var child = children[i];
        if ('undefined' != typeof child.childNodes)
            _getFormValues(aFormValues, child.childNodes, submitDisabledElements, prefix);
        _getFormValue(aFormValues, child, submitDisabledElements, prefix);
    }
};
_getFormValue = function(aFormValues, child, submitDisabledElements, prefix){
    if (!child.name){return;}
    if (child.disabled)
        if (true == child.disabled){if (false == submitDisabledElements){return;}}
    if (prefix != child.name.substring(0, prefix.length)){return;}
    if (child.type)
        if (child.type == 'radio' || child.type == 'checkbox'){
            if (false == child.checked){return;}
        }
    var name = child.name;
    var values = [];
    if ('select-multiple' == child.type) {
        var jLen = child.length;
        for (var j = 0; j < jLen; ++j) {
            var option = child.options[j];
            if (true == option.selected){values.push(option.value);}
        }
    } else {values = child.value;}
    var keyBegin = name.indexOf('[');
    if (0 <= keyBegin) {
        var n = name;
        var k = n.substr(0, n.indexOf('['));
        var a = n.substr(n.indexOf('['));
        if (typeof aFormValues[k] == 'undefined')
            aFormValues[k] = [];
        var p = aFormValues;while (a.length != 0) {
            var sa = a.substr(0, a.indexOf(']')+1);
            var lk = k;var lp = p;
            a = a.substr(a.indexOf(']')+1);
            p = p[k];
            k = sa.substr(1, sa.length-2);
            if (k == '') {
                if ('select-multiple' == child.type) {
                    k = lk;p = lp;
                } else {k = p.length;}
            }
            if (typeof p[k] == 'undefined'){p[k] = [];}
        }
        p[k] = values;
    } else {
        aFormValues[name] = values;
    }
};
function calc_transport2(prov_id, tip, kolichestvo) {
    kolichestvo = parseInt(kolichestvo, 10);
    max_tovar = document.getElementById('max_tovar' + prov_id).value;

    var woodProvValue = parseInt(document.getElementById('wood' + prov_id).value, 10);
    if (isNaN(woodProvValue)) {
        woodProvValue = 0;
    }
    var ironProvValue = parseInt(document.getElementById('iron' + prov_id).value, 10);
    if (isNaN(ironProvValue)) {
        ironProvValue = 0;
    }
    var stoneProvValue = parseInt(document.getElementById('stone' + prov_id).value, 10);
    if (isNaN(stoneProvValue)) {
        stoneProvValue = 0;
    }
    var goldProvValue = parseInt(document.getElementById('gold' + prov_id).value, 10);
    if (isNaN(goldProvValue)) {
        goldProvValue = 0;
    }
    var tipValue = parseInt(document.getElementById(tip).value, 10);
    if (isNaN(tipValue)) {
        tipValue = 0;
    }
    total_tovar = woodProvValue + ironProvValue + stoneProvValue + goldProvValue;

    free_tovar = max_tovar - total_tovar + tipValue;
    new_stoinost = 0;
    if (free_tovar >= kolichestvo) {
        new_stoinost = kolichestvo;
    }
    if (free_tovar < kolichestvo && free_tovar > 0) {
        new_stoinost = free_tovar;
    }

    new_stoinost = parseInt(new_stoinost);

    document.getElementById(tip).value = new_stoinost;
    document.getElementById(tip + '_sub').value = new_stoinost;
}

function calc_gold_transport(kolichestvo) {
    // var momentno = document.getElementById(tip+'_sub').value;
    var tip = 'gold1';
    kolichestvo = parseInt(kolichestvo);

    //if (kolichestvo) {
        max_tovar = document.getElementById('max_tovar').value;

        free_tovar = eval(max_tovar+"+"+parseInt(document.getElementById(tip).value));

        new_stoinost = 0;
        if (free_tovar >= kolichestvo) {
            new_stoinost = kolichestvo;
        }
        if (free_tovar < kolichestvo && free_tovar > 0) {
            new_stoinost = free_tovar;
        }

        new_stoinost = parseInt(new_stoinost);

        document.getElementById(tip).value = new_stoinost;
        //document.getElementById(tip+'_sub').value = new_stoinost;
    //}
    //else {
        //document.getElementById(tip).value = document.getElementById(tip+'_sub').value;
    //}
}


function setTaxRate(rate)
{
    $('#tax').removeClass().addClass('tax-rate-' + rate);
}
function inc(filename){
    var body = document.getElementsByTagName('body').item(0);
    script = document.createElement('script');
    script.src = filename;
    script.type = 'text/javascript';
    body.appendChild(script);
}
/*caxo temp will be removed or fixed*/
var payImg2='../payments/cifri2.jpg';
var payImg1='../payments/cifri1.jpg';
var payString1='str_current_payment_step2';
var payString2='str_current_payment_step1';
var setToVisible2=0;
function showStepTarifs(id){

    if (document.getElementById(id).style.display == 'none'){
        document.getElementById('stepPic').src=payImg2;
        document.getElementById('stepPicDesc').innerHTML=payString2;
        document.getElementById('stepPicDesc').className='premSt2';
    }else{
        var checkExpand = checkPicWhat(id);
        if (setToVisible2==1){
            checkExpand=2;
        }
        if(checkExpand > 0){
            document.getElementById('stepPic').src=payImg2;
            document.getElementById('stepPicDesc').innerHTML=payString2;
            document.getElementById('stepPicDesc').className='premSt2';
        }else{
            document.getElementById('stepPic').src=payImg1;
            document.getElementById('stepPicDesc').innerHTML=payString1;
            document.getElementById('stepPicDesc').className='premSt1';
        }
        setToVisible2=0;
    }
}
        function checkPicWhat(id){
            var idsArr = new Array('pPal_id','creditCard_id','tr_sms','PayByCodeTr_id','es_sms','pl_sms','hr_sms','ro_sms','ch_sms','at_sms','de_sms','it_sms','mx_sms','co_sms','ar_sms','ve_sms','pe_sms','cl_sms','gr_sms','ru_sms','ua_sms','bg_sms','ePay_id','b_Pay_id','easy_Pay_id','Wallie_id','PayByCash_id','PayByCodeNoTr_id','ro_sms2','PayByPhone_id','PayByPhoneIt_id','br_sms');
            var returbValue = 0;
            for(var i=0;i<idsArr.length;i++){
                if((document.getElementById(idsArr[i])!=null)&&(idsArr[i]!=id)){
                    if(document.getElementById(idsArr[i]).style.display == 'block'){
                    returbValue++;
                    }
                }
            }
            return returbValue;
        }
        function showOpenArr(){
            var idsArr = new Array('pPal_id','creditCard_id','tr_sms','PayByCodeTr_id','es_sms','pl_sms','hr_sms','ro_sms','ch_sms','at_sms','de_sms','it_sms','mx_sms','co_sms','ar_sms','ve_sms','pe_sms','cl_sms','gr_sms','ru_sms','ua_sms','bg_sms','ePay_id','b_Pay_id','easy_Pay_id','Wallie_id','PayByCash_id','PayByCodeNoTr_id','ro_sms2','PayByPhone_id','PayByPhoneIt_id','br_sms');
            var returnArray = new Array();
            var j=0;
            for(var i=0;i<idsArr.length;i++){
                if((document.getElementById(idsArr[i])!=null)){
                    if(document.getElementById(idsArr[i]).style.display == 'block'){
                        returnArray[j]=idsArr[i];
                        j++;
                    }
                }
            }
            if(returnArray.length == 0){
                returnArray[0]=1;
            }
            return returnArray;
        }
        function openDivs(arrToOpen2){
//            alert(arrToOpen2);
            arrToOpen = new Array();
            arrToOpen = arrToOpen2.split(",");
            for(var i=0;i<arrToOpen.length;i++){
//                alert(arrToOpen[i]);
                if(document.getElementById(arrToOpen[i])!=null){
                    setToVisible2=1;
                    setTimeout("showStepTarifs('"+arrToOpen[i]+"')",100);
                    document.getElementById(arrToOpen[i]).style.display="block";
                }
            }
        }


    /**
     * @author stoyan, oye!
     */
    updateResources = function(update)
    {
        for (element in update) {

            var fly = '<span class="resource-update ' + update[element].operation + '"></span>';

            jQuery(fly).appendTo('#'+ element).animate(
                {
                    "opacity": .1,
                    "top": "-=40"
                },
                3000,
                function()
                {
                    $(this).remove();
                }
            );
        }
    };

    /**
     * Pick color function from IOv4a
     * @param id    Id of the element
     */
    var perline = 9;
    var divSet = false;
    var colorLevels = Array('0', '3', '6', '9', 'C', 'F');
    var colorArray = Array();
    var ie = false;
    var curId;

    function getObj(id) {
        if (ie) {
            return document.all[id];
        }
        else {
            return document.getElementById(id);
        }
    }

    function addColor(r, g, b) {
        var red = colorLevels[r];
        var green = colorLevels[g];
        var blue = colorLevels[b];
        addColorValue(red, green, blue);
    }

    function addColorValue(r, g, b) {
        colorArray[colorArray.length] = '#' + r + r + g + g + b + b;
    }

    function setColor(color) {
        var link = getObj(curId);
        var field = getObj(curId + 'field');
        var picker = getObj('colorpicker');
        field.value = color;
        if (color == '') {
            link.style.background = nocolor;
            link.style.color = nocolor;
            color = nocolor;
        } else {
            link.style.background = color;
            link.style.color = color;
        }
        picker.style.display = 'none';
        eval(getObj(curId + 'field').title);
    }

    function setDiv() {
        if (!document.createElement) { return; }
        var elemDiv = document.createElement('div');
        if (typeof(elemDiv.innerHTML) != 'string') { return; }
        genColors();
        elemDiv.id = 'colorpicker';
        elemDiv.style.position = 'absolute';
        elemDiv.style.display = 'none';
        elemDiv.style.border = '#000000 1px solid';
        elemDiv.style.background = '#ffffff';
        elemDiv.style.zIndex = 1002;
        elemDiv.innerHTML = '<span style="font-family:Verdana; font-size:11px;">'
            + getColorTable()
            + '</span>';

        document.body.appendChild(elemDiv);
        divSet = true;
    }

    function pickColor(id) {
        if (!divSet) { setDiv(); }
        var picker = getObj('colorpicker');
        if (id == curId && picker.style.display == 'block') {
            picker.style.display = 'none';
            return;
        }
        curId = id;
        var thelink = getObj(id);
        picker.style.top = getAbsoluteOffsetTop(thelink) + 20+"px";
        picker.style.left = getAbsoluteOffsetLeft(thelink)+"px";
        picker.style.display = 'block';
    }

    function genColors() {
        addColorValue('0','0','0');
        addColorValue('3','3','3');
        addColorValue('6','6','6');
        addColorValue('8','8','8');
        addColorValue('9','9','9');
        addColorValue('A','A','A');
        addColorValue('C','C','C');
        addColorValue('E','E','E');
        addColorValue('F','F','F');

        for (var a = 1; a < colorLevels.length; a++)
            addColor(0,0,a);
        for (var a = 1; a < colorLevels.length - 1; a++)
            addColor(a,a,5);

        for (var a = 1; a < colorLevels.length; a++)
            addColor(0,a,0);
        for (var a = 1; a < colorLevels.length - 1; a++)
            addColor(a,5,a);

        for (var a = 1; a < colorLevels.length; a++)
            addColor(a,0,0);
        for (var a = 1; a < colorLevels.length - 1; a++)
            addColor(5,a,a);


        for (var a = 1; a < colorLevels.length; a++)
            addColor(a,a,0);
        for (var a = 1; a < colorLevels.length - 1; a++)
            addColor(5,5,a);

        for (var a = 1; a < colorLevels.length; a++)
            addColor(0,a,a);
        for (var a = 1; a < colorLevels.length - 1; a++)
            addColor(a,5,5);

        for (var a = 1; a < colorLevels.length; a++)
            addColor(a,0,a);
        for (var a = 1; a < colorLevels.length - 1; a++)
            addColor(5,a,5);

            return colorArray;
    }
    function getColorTable() {
        var colors = colorArray;
        var tableCode = '';
        tableCode += '<table border="0" cellspacing="1" cellpadding="1">';
        for (var i = 0; i < colors.length; i++) {
            if (i % perline == 0) { tableCode += '<tr bgcolor="#A3947D">'; }
            tableCode += '<td bgcolor="#000000"><a style="outline: 1px solid #000000; color: '
                    + colors[i] + '; background: ' + colors[i] + ';font-size: 10px;" title="'
                    + colors[i] + '" href="javascript:setColor(\'' + colors[i] + '\');">&nbsp;&nbsp;&nbsp;</a></td>';
            if (i % perline == perline - 1) { tableCode += '</tr>'; }
        }
        if (i % perline != 0) { tableCode += '</tr>'; }
        tableCode += '</table>';
            return tableCode;
    }
    function relateColor(id, color) {
        var link = getObj(id);
        if (color == '') {
            link.style.background = nocolor;
            link.style.color = nocolor;
            color = nocolor;
        } else {
            link.style.background = color;
            link.style.color = color;
        }
        eval(getObj(id + 'field').title);
    }
    function getAbsoluteOffsetTop(obj) {
        var top = obj.offsetTop;
        var parent = obj.offsetParent;
        while (parent != document.body) {
            top += parent.offsetTop;
            parent = parent.offsetParent;
        }
        return top;
    }

    function getAbsoluteOffsetLeft(obj) {
        var left = obj.offsetLeft;
        var parent = obj.offsetParent;
        while (parent != document.body) {
            left += parent.offsetLeft;
            parent = parent.offsetParent;
        }
        return left;
    }
    function switchMenu(obj) {
        var el = document.getElementById(obj);
        if ( el.style.display != "none" ) {
            el.style.display = 'none';
        }
        else {
            el.style.display = '';
        }
    }
    function calcSoldiersPriceForHier(wood,iron,gold,num,idnum,idtype,action){

        if(parseInt(num) !=0 && num !=""){
            if(action == 2){
                wood = eval(wood/2);
                iron = eval(iron/2);
            }

            var w = number_format(eval(wood*num),0,"","&nbsp;");
            var ir = number_format(eval(iron*num),0,"","&nbsp;");;
//            var gl = eval(gold*num);
            for(var i=1;i<=5;i++){
                if(document.getElementById(idtype+i)!='undefined' && i!=idnum && document.getElementById(idtype+i)!=null){
                    document.getElementById(idtype+i).disabled=true;
                }
            }
            if(idtype == "M"){
                document.getElementById('slwood1').innerHTML = w;
                document.getElementById('sliron1').innerHTML = ir;
//                document.getElementById('slgold1').innerHTML = gl;
            }else{
                document.getElementById('slwood'+idtype).innerHTML = w;
                document.getElementById('sliron'+idtype).innerHTML = ir;
//                document.getElementById('slgold').innerHTML = gl;
            }
        }else{
            for(var i=1;i<=5;i++){
                if(document.getElementById(idtype+i)!='undefined' && document.getElementById(idtype+i)!=null){
                    document.getElementById(idtype+i).disabled=false;
                }
            }
            if(idtype == "M"){
                document.getElementById('slwood1').innerHTML = 0;
                document.getElementById('sliron1').innerHTML = 0;
//                document.getElementById('slgold1').innerHTML = 0;
            }else{
                document.getElementById('slwood'+idtype).innerHTML = 0;
                document.getElementById('sliron'+idtype).innerHTML = 0;
//                document.getElementById('slgold').innerHTML = 0;
            }
        }

    }
    function makePointArrow(){
        var eleft=0;
        var etop=0;
        var args = '';
        var id='arrowTutorial';
        var srcName="strelka_anime2.gif";
        if (arguments.length > 0) {
            args = eval(arguments[0]);
            for(var key in args){eval(key+'="'+args[key]+'"');}
        }
        if(document.getElementById(id)!=null){
            div=document.getElementById(id);
        }else{
            div=document.createElement('img');
            div.id=id;
            div.style.position="absolute";
            div.style.visibility="visible";
            div.style.left="0px";
            div.style.top="0px";
            div.style.z_index="800";
            div.style.zIndex="800";
            div.src=images_dir+srcName;
            if(document.getElementById(peId)!=null){
                if(document.getElementById(peId)!=null){
                    document.getElementById(peId).appendChild(div);
                }
            }else{
                document.body.appendChild(div);
            }
        }
        if(document.getElementById(peId) != null){
            var customElementPossition=$('#'+document.getElementById(peId).id).offset();
            var customElementPossition2=$('#'+div.id).offset();
            customElementPossition.left=customElementPossition.left-customElementPossition2.left;
            customElementPossition.top=customElementPossition.top-customElementPossition2.top;
            customElementPossition.left=customElementPossition.left+(((isNaN(parseFloat(eleft)))||(parseFloat(eleft)==0))?($('#'+peId).width()):parseFloat(eleft));
            customElementPossition.top=customElementPossition.top+(((isNaN(parseFloat(etop)))||(parseFloat(etop)==0))?0:parseFloat(etop));

            div.style.left=customElementPossition.left+"px";
            div.style.top=customElementPossition.top+"px";
        }
    }
    function hidePointArrow(id){
        var arrowobj = document.getElementById(id);
        if(arrowobj!=null){
        if(arrowobj.parentNode!=null){arrowobj.parentNode.removeChild(arrowobj);}
        else{document.body.removeChild(arrowobj);}}
    }


    function changediamond( diamondname, counter, speed ) {
        el = document.getElementById(diamondname);

        // var images_dir = '../static/gui';
        var my_diamond = 0;
        var diamond = new Array();
        diamond[1] = "url("+static_dir+"gui/buy-diamonds-special-offer.png)";
        diamond[2] = '';

        var new_speed = speed*1000;

        if (counter == 1) my_diamond = 2;
        if (counter == 2) my_diamond = 1;
        document.getElementById(diamondname).style.backgroundImage = diamond[my_diamond];

        window.setTimeout("changediamond('"+diamondname+"', "+my_diamond+", "+speed+");", new_speed);
    }
    function calcArmyCapacyty(race){

        var armyTypeArray1 =  new Array('P1','P2','P3','S1','S2','S3','M1','M2','M3','K1','K2','K3','C1','C2','C3','C4','CT');
        var armyTypeArray2 =  new Array('P1','P2','S1','S2','S3','M1','M2','K1','K2','K3','K4','K5','C1','C2','C3','C4','CT');

        var currentCapc = 0;
        var currentPil = 0;

        if(race == 2){
            for(var i=0;i<armyTypeArray2.length;i++){
                if(document.getElementById('M_'+armyTypeArray2[i])!= null){
                    if((parseInt(document.getElementById('M_'+armyTypeArray2[i]).value)>=0)){
                        currentCapc = eval(currentCapc+"+"+(parseInt(document.getElementById('M_'+armyTypeArray2[i]).value)+"*"+document.getElementById('C_'+armyTypeArray2[i]).value));
                        currentPil = eval(currentPil+"+"+(parseInt(document.getElementById('M_'+armyTypeArray2[i]).value)+"*"+document.getElementById('PIL_'+armyTypeArray2[i]).value));
                    }
                }
            }
        }else{
            for(i=0;i<armyTypeArray1.length;i++){
                if(document.getElementById('M_'+armyTypeArray1[i])!= null){
                    if((parseInt(document.getElementById('M_'+armyTypeArray1[i]).value)>=0)){
                        currentCapc = eval(currentCapc+"+"+(parseInt(document.getElementById('M_'+armyTypeArray1[i]).value)+"*"+document.getElementById('C_'+armyTypeArray1[i]).value));
                        currentPil = eval(currentPil+"+"+(parseInt(document.getElementById('M_'+armyTypeArray1[i]).value)+"*"+document.getElementById('PIL_'+armyTypeArray1[i]).value));
                    }
                }
            }
        }

        document.getElementById('infodivcapacyty').innerHTML = number_format(parseInt(currentCapc),0,"","&nbsp;");
        document.getElementById('infodivpillageforce').innerHTML = number_format(parseInt(currentPil), 0, "", "&nbsp;");
    }

    var progressTimers = [];
    /**
     * JavaScript accurate self-adjusting timer
     *
     * @author http://www.sitepoint.com/blogs/2010/06/23/creating-accurate-timers-in-javascript/
     * @fixes stoyan running on several non-conflicting timers simultaneously on a single page
     *
     * @param integer length
     * @param integer resolution
     * @param function oninstance callback
     * @param function oncomplete callback
     * @param string timerId unique timer name
     *
     * @return void
     */
    function timer(length, resolution, oninstance, oncomplete, timerGroup, timerId)
    {
        var steps = (length * resolution) / 1000;
        var speed = length / steps;
        var count = 0;
        var start = new Date().getTime();
        var timerName = '__' + timerId + '__';
        timerGroup = '__' + timerGroup + '__';

        if (typeof window[timerGroup] == "undefined") {
            window[timerGroup] = [];
        }

        function instance()
        {
            if (count++ == steps) {
                oncomplete(steps, count);
            } else {
                oninstance(steps, count);

                var diff = (new Date().getTime() - start) - (count * speed);
                window[timerGroup][timerName] = window.setTimeout(instance, (speed - diff));
            }
        }

        if (typeof window[timerGroup][timerName] == 'number') {
            window.clearTimeout(window[timerGroup][timerName]);
            delete window[timerGroup][timerName];
        }

        instance();
        window[timerGroup][timerName] = window.setTimeout(instance, speed);
    }


    function countdownTime(ticks)
    {
        s = ticks;
        m = h = d = 0;

        if (s > 59) {
            m = Math.floor(s / 60);
            s -= m * 60;
        }
        if(m > 59) {
            h = Math.floor(m / 60);
            m -= h * 60;
        }
        if (h > 23) {
            d = Math.floor(h / 24);
            h -= d * 24;
        }

        dayAdd = '';
        if (d > 0) {
            dayAdd += d + ' ' + str_days + ' ';
        }

        return dayAdd + leadingZero(h) + ':' + leadingZero(m) + ':' + leadingZero(s);
    }


    function leadingZero(integer)
    {
        if (integer < 10) {
            return '0' + integer;
        }

        return integer;
    }

var allTimersOnScreen=[];
var commandString = '';
function CountTime( timername, seconds ){
    v = new Date();
    el = document.getElementById(timername);
    if(!el){
        return false;
    }
    n = new Date();
    s = seconds-Math.round((n.getTime()-v.getTime())/1000.);
    m = 0;
    h = 0;
    d = 0;

    if( s>59 ){
        m=Math.floor( s/60 );
        s = s-m*60;
    }
    if( m>59 ){
        h = Math.floor( m/60 );
        m = m-h*60;
    }
    if(h>23){
        d = Math.floor( h/24 );
        h = h-d*24;
    }
    if( s<10 ){
        s = "0" + s;
    }
    if( m<10 ){
        m = "0" + m;
    }
    if( h<10 ){
        h = "0" + h;
    }
    dayAdd='';
    if(d>0){
        dayAdd+=d+' '+str_days+' ';
    }
    el.innerHTML = dayAdd+h+":"+m+":"+s;

    seconds = seconds - 1;
    if(seconds < 0){
        document.getElementById(''+timername+'').innerHTML='00:00:00';
        clearPageTimeout(timername);
    }else{
        if(typeof allTimersOnScreen[timername]!='undefined') {
            clearPageTimeout(timername);
        }
        allTimersOnScreen[timername]=setTimeout( "CountTime('"+timername+"',"+seconds+");", 999);
    }
}

function CountTimeCommand( timername, seconds){
    v = new Date();
    if(typeof document.getElementById(timername) == 'undefined'){
        return false;

    }

    el = document.getElementById(timername);
    if(!el){
        return false;
    }
    n = new Date();
    s = seconds-Math.round((n.getTime()-v.getTime())/1000.);
    m = 0;
    h = 0;
    d = 0;

    if(s>59){
        m=Math.floor(s/60);
        s = s-m*60;
    }
    if(m>59){
        h = Math.floor(m/60);
        m = m-h*60;
    }
    if(h>23){
        d = Math.floor( h/24 );
        h = h-d*24;
    }
    if(s<10){
        s = "0" + s;
    }
    if(m<10){
        m = "0" + m;
    }
    if(h<10){
        h = "0" + h;
    }
    dayAdd='';
    if(d>0){
        dayAdd+=d+' '+str_days+' ';
    }
    el.innerHTML = dayAdd+h+":"+m+":"+s;
    seconds = seconds - 1;

    if(seconds < 0){
        document.getElementById(''+timername+'').innerHTML='00:00:00';
        if(typeof commandString!='undefined'){
            eval(commandString);
        }
        clearPageTimeout(timername);
    }else{
        if(typeof document.getElementById(timername) != 'undefined'){
            if(typeof allTimersOnScreen[timername]) {
                clearPageTimeout(timername);
            }
            allTimersOnScreen[timername]=setTimeout( "CountTimeCommand('"+timername+"',"+seconds+");", 999);
        }
    }
}
function CountTimeCommandTutHelp( timername, seconds ){
    v = new Date();
    if(typeof document.getElementById(timername) == 'undefined'){
        return false;
    }

    el = document.getElementById(timername);
    if(!el){
        return false;
    }
    n = new Date();
    s = seconds-Math.round((n.getTime()-v.getTime())/1000.);
    m = 0;
    h = 0;
    d = 0;

    if(s>59){
        m=Math.floor(s/60);
        s = s-m*60;
    }
    if(m>59){
        h = Math.floor(m/60);
        m = m-h*60;
    }
    if(h>23){
        d = Math.floor( h/24 );
        h = h-d*24;
    }
    if(s<10){
        s = "0" + s;
    }
    if(m<10){
        m = "0" + m;
    }
    if(h<10){
        h = "0" + h;
    }
    dayAdd='';
    if(d>0){
        dayAdd+=d+' '+str_days+' ';
    }
    el.innerHTML = dayAdd+h+":"+m+":"+s;
    seconds = seconds - 1;
    if(seconds < 0){
        document.getElementById(''+timername+'').innerHTML='00:00:00';
        if(typeof commandStringTut!='undefined'){
            eval(commandStringTut);
        }
        clearPageTimeout(timername);
    }else{
        if(typeof document.getElementById(timername) != 'undefined'){
            if(typeof allTimersOnScreen[timername]) {
                clearPageTimeout(timername);
            }
            allTimersOnScreen[timername]=setTimeout("CountTimeCommandTutHelp('"+timername+"',"+seconds+");", 999);
        }
    }
}

function calc_bet_won (credits, coef) {
    var won = credits * coef;
    document.getElementById('won_value').innerHTML=Math.ceil(won);
}

function showGameProfileBattle(userId){
    xajax_showGameProfiles(containersStuff.findContaner({saveName:'profiles',title: str_profiles,positionVisibleScreen:true}),'NULL',userId);
}

function showAllianceInfoBattle(allianceName){
    xajax_showAllianceInfo(containersStuff.findContaner({saveName:'alliance',title:allianceName,template:'untabbed'}), 0, allianceName);
}

/**
 * $param val the amount of units that will be trained
 * $param res arrain wi from unit, to unit and middle unit data
 */
function upgradePriceChange(val,res,type){

    var output={
        "wood":0,
        "iron":0,
        "keep":0,
        "time":jQuery('#recruit-resource-time-' + type).attr('default'),
        "peep":0,
        "woodprice":null,
        "ironprice":null
    };

    if(val <= res.from.amount){
        output.wood=((res.to.wood-res.from.wood)*val);
        output.iron=((res.to.iron-res.from.iron)*val);

        output.woodprice=res.to.wood-res.from.wood;
        output.ironprice=res.to.iron-res.from.iron;
    }
    else if(val > res.from.amount){//The amount if more than the initial amount
        val=val-res.from.amount;

        output.wood=((res.to.wood-res.middle.wood)*val)+((res.to.wood-res.from.wood)*res.from.amount);
        output.iron=((res.to.iron-res.middle.iron)*val)+((res.to.iron-res.from.iron)*res.from.amount);

        output.woodprice=res.to.wood-res.middle.wood;
        output.ironprice=res.to.iron-res.middle.iron;
        //Set the time
    }

    if(val >0){
        output.time=res.to.time;
        output.keep=number_format((res.to.upkeep*val),1,'.','&nbsp;');
    }

    //Set to 0
    if(output.wood < 1){output.wood=0;}
    if(output.iron < 1){output.iron=0;}
    if(output.woodprice < 1){output.woodprice=0;}
    if(output.ironprice < 1){output.ironprice=0;}

    //Update resources and time ...
    jQuery('#recruit-resource-wood-'+type).html(number_format(output.wood,0,'','&nbsp'));
    jQuery('#recruit-resource-iron-'+type).html(number_format(output.iron,0,'','&nbsp'));
    jQuery('#recruit-resource-keep-'+type).html(number_format(output.keep,0,'','&nbsp'));
    jQuery('#recruit-resource-time-'+type).html(output.time);
    //Update the unit price
    jQuery('#wood_req_for_upgrade_'+type).html(number_format(output.woodprice,0,'','&nbsp'));
    jQuery('#iron_req_for_upgrade_'+type).html(number_format(output.ironprice,0,'','&nbsp'));
}

function recruitmentPrice(count, resources, action, type){
    var wood = parseInt(resources.wood,10);
    var iron = parseInt(resources.iron,10);
    count = parseInt(count,10);

    var output = {
        "wood": 0,
        "iron": 0,
        "keep": 0,
        "time": $('#recruit-resource-time-' + type).attr('default'),
        "peep": 0
    };

    if (count > 0 && !isNaN(count)) {
        if (action == 2) {
            wood = Math.round(wood / 2);
            iron = Math.round(iron / 2);
        }

        wood *= count;
        iron *= count;

        output.wood = formatQuantity(wood, 1, 8);
        output.iron = formatQuantity(iron, 1, 8);
        output.keep = number_format(resources.keep * count, 1, '.', '&nbsp;');
        output.time = resources.time;
        output.peep = formatQuantity(resources.peep * count, 1, 8);
    }

    jQuery('#recruit-resource-wood-' + type).html(output.wood);
    jQuery('#recruit-resource-iron-' + type).html(output.iron);
    jQuery('#recruit-resource-keep-' + type).html(output.keep);
    jQuery('#recruit-resource-time-' + type).html(output.time);
    jQuery('#recruit-resource-peep-' + type).html(output.peep);
}


var sliderNames = null;
function resetOtherSliders(skip)
{
    temp='';
    for (name in sliderNames) {
        if(sliderNames[name]!=null){
            if (skip == sliderNames[name]) {
                continue;
            }
            type = sliderNames[name].substr(-2);
            if(type!='CT'&&type!='KS'){
                type=type.substr(0,1);
            }
            if(temp!=type){
                recruitmentPrice(0,{'wood':0,'iron':0},0,type);
                temp=type;
            }
            $('#' + sliderNames[name] + 'h-value2').val(0).change();
            $('#' + sliderNames[name]).val('').removeClass('negative');
        }
    }
}


function alliancePolls()
{

    $('.delete_option').live('click', function()
    {
        $(this).parent().remove();
        $('#add_new').css('visibility', 'visible');
    });

    $('#add_new').click(function()
    {
        var inputLength = $('.question_new_option').length;

        if (inputLength <= 10)
        {
            $('.question_new_option').last().after($('#template').html());
            $('.question_new_option').last().children().focus();
        }

        if (inputLength >= 10)
        {
            $('#add_new').css('visibility', 'hidden');
        }

        return false;
    });

    $('.question_new_option').find('input:last').live('keydown', function(e)
    {
        if (e.keyCode == 40)
        {
            $('#add_new').click();

            return false;
        }
    });
}


function clearPageTimeout(name)
{
    if (typeof allTimersOnScreen[name] != "undefined") {
        clearInterval(allTimersOnScreen[name]);
        allTimersOnScreen[name] = 0;
        allTimersOnScreen[name] = null;
        delete allTimersOnScreen[name];
    }
}


function clearProgressTimeout(id)
{
    var name = 'timer' + id;

    if (typeof progressTimers[name] != "undefined") {
        clearInterval(progressTimers[name]);
        progressTimers[name] = 0;
        progressTimers[name] = null;
        delete progressTimers[name];
    }
}


function clearProgressTimeouts()
{
    for (name in progressTimers) {
        clearInterval(progressTimers[name]);
        progressTimers[name] = 0;
        progressTimers[name] = null;
        delete progressTimers[name];
    }
}

/*
function progressbarRowsSwap($mother, $currentRow, rows_to_move)
{
    var speed = 50000;
    var height = $('.first-in-queue', $mother).addClass('move-one-down').height();

    $('.move-abl-e td', $mother).css({'border-top':'1px solid #000'});
    $('.move-abl-e td td', $mother).css({'border-top':'0 none transparent'});

    $('.move-to-top', $mother).css({position:'relative'}).stop(true).animate({top: '-=' + ((height * rows_to_move) - rows_to_move)}, speed, function()
    {
        eval($.data($currentRow, 'url'));
    });
    $('.move-one-down', $mother).css({position:'relative'}).stop(true).animate({top: '+=' + (height - 1)}, speed);
}
*/

var compensateDumbBrowsers = 0;
if (jQuery.browser.msie && jQuery.browser.version < 9) {
    compensateDumbBrowsers = -1;
}

function wrapSet($set)
{
    var html = '';
    $set.each(function()
    {
        html += '<tr>' + $(this).clone().html() + '</tr>';
    });

    return $('<table class="data-grid">' + html + '</table>');
}


function progressbarRowsSwap($mother, $currentRow, rows_to_move)
{
    var speed = 500;
    var height = $('.first-in-queue', $mother).addClass('move-one-down').height();

    // prepare soon-to-be first row to be pulled up
    $first = wrapSet($currentRow);
    $first.css({position: 'absolute', 'z-index': 120, left: 0, top: ($currentRow.position().top - (1 + compensateDumbBrowsers))}).prependTo($mother);
    $currentRow.addClass('move-dummy');

    // prepare rows above $first to be pushed down
    $down = $('.move-one-down', $mother);
    $moveOver = wrapSet($down);
    $moveOver.css({position: 'absolute', 'z-index': 100, left: 0, top: ($down.position().top - (1 + compensateDumbBrowsers))}).appendTo($mother);
    $down.addClass('move-dummy');

    $first.stop(true).animate({top: '-=' + (height * rows_to_move)}, speed, function()
    {
        eval($.data($currentRow, 'url'));
    });
    $moveOver.stop(true).animate({top: '+=' + height}, speed);
}

function operationsMoveAllFortress(formSelector){
    var elArray = $(formSelector).serializeArray();
    //var data = {"type":{}};
    var data = {};
    jQuery.each(elArray, function(i, field){
        //data["type"][field.name] = field.value;
        if ( IsNumericInit(field.value) )
            data[field.name] = field.value;
    });

    return data;
}

function doGetCaretPosition (ctrl) {
        var CaretPos = 0;    // IE Support
        if (document.selection) {
        ctrl.focus ();
            var Sel = document.selection.createRange ();
            Sel.moveStart ('character', -ctrl.value.length);
            CaretPos = Sel.text.length;
        }
        // Firefox support
        else if (ctrl.selectionStart || ctrl.selectionStart == '0')
            CaretPos = ctrl.selectionStart;
        return (CaretPos);
    }
    function setCaretPosition(ctrl, pos){

        if(ctrl.setSelectionRange)
        {
            ctrl.focus();

            ctrl.setSelectionRange(pos,pos);
        }
        else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();

        }
    }

function doAddTags(tag1,tag2,textareaElm)
{
    var textarea = document.getElementById(textareaElm);
    var $no = parseInt(doGetCaretPosition (textarea)+(tag1.length));
    // Code for IE
        if (document.selection)
            {
                textarea.focus();
                var sel = document.selection.createRange();
                //alert(sel.text);
                sel.text = tag1 + sel.text + tag2;
            }
else
    {  // Code for Mozilla Firefox
        var len = textarea.value.length;
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;


        var scrollTop = textarea.scrollTop;
        var scrollLeft = textarea.scrollLeft;


        var sel = textarea.value.substring(start, end);
        //alert(sel);
        var rep = tag1 + sel + tag2;
        textarea.value =  textarea.value.substring(0,start) + rep + textarea.value.substring(end,len);

        textarea.scrollTop = scrollTop;
        textarea.scrollLeft = scrollLeft;


    }


    var $curPos = document.getElementById(textareaElm);
    setCaretPosition($curPos,$no);
}

function textLimitCheckBBcode(field, maxlen) {

    fieldValue = field.value;

    //fieldValue = fieldValue.replace(/\[\/?(color|player|alliance|i|b|u|url(=[^\]]+)?|list|li)[\]\[]*\]/ig,'');

    if (fieldValue.length > maxlen)
        field.value = field.value.substring(0, maxlen);
    return fieldValue.length;
}


/**
 * copied from homepage2_html for switch realms
 */
function activate(id)
{
    var form = getElement(['form', id]);
    form.className = 'realm-form active';

    var tab = getElement(['tab', id]);
    tab.className = 'active';
}

function deactivate(id)
{
    var form = getElement(['form', id]);
    form.className = 'realm-form inactive';

    var tab = getElement(['tab', id]);
    tab.className = 'inactive';
}

function getElement(parts)
{
    return document.getElementById(parts.join('-'));
}

function toggle_login_tab(json)
{
    var tabs = eval(json);

    activate(tabs.show);

    for (x in tabs.hide) {
        deactivate(tabs.hide[x]);
    }
}


/**
 * Visual xajax Loading jQuery Plugin
 *
 * @author stoyan
 */
(function()
{
    jQuery.fn.visualLoading = function(settings)
    {
        var config = {
        };

        if (settings !== null) {
            jQuery.extend(config, settings);
        }

        var $target = this;
        var Loading = {
            fire: function(child)
            {
                // half the background width and span margins
                var compensate_html_structure = 12 - 6;

                // filter oun parents by current child
                var $parent = $(child).parents($target.selector);
                if($parent.offset()!=null){
                    // link or button, they have different HTML structure
                    var position = $(child).parent().offset();

                    position = $(child).offset();
                    // no span margin
                    compensate_html_structure += 6;

                    var offsetLeft = parseInt(((position.left - $parent.offset().left) + child.offsetWidth / 2) - compensate_html_structure);

                    $parent.css({'background-position': + offsetLeft  + 'px 50%'});
                    $parent.toggleClass('visual-loading-active');
                }
            },

            clear: function()
            {
                $('.visual-loading-active').removeClass('visual-loading-active');
            }
        };

        this.each(function(index)
        {
            var $this = $(this);
            var $electors;

            if ($.browser.msie  && parseInt($.browser.version, 10) <= 8) {
                $selectors = 'a.button, a.large-button, button';
            } else {
                $selectors = 'a.button, a.large-button, button, input';
            }

            jQuery($selectors, $this).each(function() {
                jQuery(this).unbind('click').click(function() {
                                    if (jQuery(this).hasClass('inactive') === false) {
                                        Loading.fire(this);
                                    }
                });
            });
        });

        Loading.clear();

        return this;
    };
})(jQuery);

function castleSiegeArchersCavalryOnly(button_link, button_link_castle_siege_only_cavalry_or_archers)
{
    var anchersOrCavalry = false;
    var anchersAndCavalryOnly = true;
    jQuery("form#sendAttackForm input[id^='M_']").each(function(index) {
        if(jQuery(this).attr("id").search(/M_(S|CT|K)/)>-1 && jQuery(this).val()!='' && jQuery(this).val()>0)
        {
            anchersOrCavalry = true;
        }
        else if(jQuery(this).val()!='' && jQuery(this).val()>0)
        {
            anchersAndCavalryOnly = false;
            return;
        }
    });
    if(anchersAndCavalryOnly && anchersOrCavalry)
    {
        eval(button_link_castle_siege_only_cavalry_or_archers);
        return false;
    }
    eval(button_link);
    return true;
}

(function()
{
    jQuery('.faq-categories th').live('click', function()
    {
        jQuery('.faq-categories td:visible').slideUp('fast');
        jQuery('td:hidden', $(this).parents('.faq-categories')).slideDown('fast');
    });
})(jQuery);

/**
 * Positions the list with currently owned provinces or colonies
 *
 * @param type provinces or colonies
 */
function position_province_info(type, count)
{
    if ($('#fast-' + type).is(':visible')) {
        $('#fast-' + type).hide('fast');
    } else {
        // hide all without the current element
        $('.fast-container:not(#fast-' + type +')').hide('fast');

        $('#fast-' + type).removeClass('two-rows');
        if (count > 10) {
            $('#fast-' + type).addClass('two-rows');
        }

        // position the list content
        var position = {"top": $('.item-' + type).offset().top + 'px', "left": 62 + 'px'};
        $('#fast-' + type).css(position).show('fast');;
    }
}

/**
 *
 * @param timername
 * @param seconds
 * @returns {Boolean}
 */
function CountTimeNoDayAdd(timername, seconds)
{
    v = new Date();
    el = document.getElementById(timername);
    if(!el){
        return false;
    }
    n = new Date();
    s = seconds-Math.round((n.getTime()-v.getTime())/1000.);
    m = 0;
    h = 0;
    d = 0;

    if( s>59 ){
        m=Math.floor( s/60 );
        s = s-m*60;
    }
    if( m>59 ){
        h = Math.floor( m/60 );
        m = m-h*60;
    }
    if( s<10 ){
        s = "0" + s;
    }
    if( m<10 ){
        m = "0" + m;
    }
    if( h<10 ){
        h = "0" + h;
    }

    el.innerHTML = h + ':' + m + ':' + s;

    seconds = seconds - 1;
    if(seconds < 0){
        document.getElementById(timername).innerHTML = '00:00:00';
        clearPageTimeout(timername);
    }else{
        if (typeof allTimersOnScreen[timername] != 'undefined') {
            clearPageTimeout(timername);
        }
        allTimersOnScreen[timername]=setTimeout( "CountTimeNoDayAdd('"+timername+"',"+seconds+");", 999);
    }
}


function ReloadFlash(id, num)
{
    getFlashMovieObject(id).reload(num);
//    xajax_reload();
}


function ReloadFlashGm(id)
{
    getFlashMovieObject(id).reload();
//    xajax_reload();
}

$(document).delegate("input.autoComplete, input.autoCompleteUser", "focus", function() {
    var tmpFocus = "";
    $( ".autoCompleteUser, .autoComplete" ).autocomplete({
        source: function(request, response) {
            if (this.element.hasClass("autoCompleteUser")) {
                $.getJSON("searchByName.php", { name: this.element.val() },    response);
            } else {
                $.getJSON("searchByName.php", { "name": this.element.val(), "type": "alliance" },
                    response);
            }
        },
        open: function () {
            var index_highest = 0;
            $("div[id^=dragDiv]").each(function() {
                $(this).addClass('handleDeselected');
                var index_current = parseInt($(this).css("zIndex"), 10);
                if(index_current > index_highest) {
                    index_highest = index_current;
                }
            });
            $(this).autocomplete('widget').css('z-index', index_highest + 1);
            tmpFocus = "ljuswhfliuhluiwhuiehlifskjfdikljhsdhj"; // emulate first focus
            var $newClass = $(this).parents("div[id^=dragDiv]").attr("id").match(/[0-9]+/);
            $(this).data("autocomplete").menu.element.addClass("parentContainer"+$newClass);
        },
        focus: function(event, ui) {
            $(this).val(ui.item.value);
            tmpFocus = ui.item.value;
        },
        close: function (event,ui) {
            if (tmpFocus==$(this).val() || tmpFocus=="") {
                $(this).next().click();
            }
        },
        minLength: 2,
        delay:500
    }).data("autocomplete")._renderItem = function( ul, item ) {
        ul.appendTo('body');
        return $( "<li></li>" )
        .data( "item.autocomplete", item )
        .append( "<a>"+ item.label + "</a>" )
        .appendTo( ul );
    };
});

/**
 * Method to handle operations menu in the users ranking and alliance's members listing
 *
 * @param {String} type - Determines whether we are accessing this method from users rankings
 *                      or alliance's members listing
 */
jQuery('.operationsLink').live("click",function() {
    var $thisElm = $(this);
    jQuery('a:not(.operationsLink)').click(function() {
        jQuery('.operationsMenu').hide();
    });
    jQuery('.operationsMenu input').click(function() {
        jQuery('.operationsMenu').hide();
    });
    var bottomCorrectionFactor = -10;
    var topCorrectionFactor = -10;
    var correctionFactor = parseInt($(this).next('div.positionAbsolute').children().height(), 10)-20;

    var leftCorrectionFactor = 0;
    if (jQuery.browser.msie && parseInt(jQuery.browser.version, 10) === 7) {
        leftCorrectionFactor = -35;
        topCorrectionFactor = 30;
    }

    if ($('body').hasClass('right-to-left')) {
        var RTLElement = $(this).next('.positionAbsolute');
        RTLElement.css('left',550);
    }

    var showMenu = false;
    var thisElementMenu = jQuery(this).siblings('.positionAbsolute').find('table.operationsMenu');
    var operationsMenuWidth = parseInt(jQuery(thisElementMenu).width(),10);
    var operationsMenuHeight = parseInt(jQuery(thisElementMenu).height(), 10);
    var parentDiv = $(this).parents('div[id^=dragDiv]');
    var newZIndexMyElement = parseInt(parentDiv.css('zIndex'), 10) + 1;
    var parentsOffset = parentDiv.offset();
    var windowScrollTop = jQuery(window).scrollTop();
    var windowBottomPosition = parseInt(windowScrollTop, 10) + parseInt(jQuery(window).height(), 10);
    var elementsBottomPosition = parseInt(parentsOffset['top'], 10) - operationsMenuHeight;
    var currentOffset = $(this).offset();
    var parentsBottomPosition = parseInt(currentOffset.top, 10);
    parentsBottomPosition = parentsBottomPosition + 30;

    jQuery(thisElementMenu).css('zIndex', newZIndexMyElement);
    jQuery(thisElementMenu).css('left', (-operationsMenuWidth + parseInt(leftCorrectionFactor, 10)));
    if (parseInt(elementsBottomPosition, 10) + correctionFactor <= windowScrollTop && elementsBottomPosition > 0) {
        jQuery(thisElementMenu).css('bottom', (topCorrectionFactor));
    } else if (parentsBottomPosition + correctionFactor > windowBottomPosition) {
        jQuery(thisElementMenu).css('bottom', (-(operationsMenuHeight) + bottomCorrectionFactor));
    } else {
        jQuery(thisElementMenu).css('bottom', (-(operationsMenuHeight) + correctionFactor));
    }
    if (/Chrome|Safari/i.test(navigator.userAgent)) {
        jQuery(thisElementMenu).css('bottom', 0);
    }

    if (jQuery(thisElementMenu).is(':visible') === false) {
        showMenu = true;
    }
    jQuery('.operationsMenu').hide();
    if (showMenu === true) {
        var index_highest = 0;
        $("div[id^=dragDiv]").each(function() {
            $(this).addClass('handleDeselected');
            var index_current = parseInt($(this).css("zIndex"), 10);
            if(index_current > index_highest) {
                index_highest = index_current;
            }
        });
        if ($('#map_snap').length > 0) {
            containersStuff.tryFlashContainer(containersStuff.savedContainers['global_map']);
            switchMapsToInvis();
        }
        parentDiv.removeClass('handleDeselected').css('zIndex',index_highest+1);
        jQuery(thisElementMenu).css('zIndex',index_highest+2).show();
    }
});


jQuery(".optionsLink").live("click", function(e) {
    var parentElm = jQuery(this);
    var menu = jQuery(parentElm).next().children();
    var parentOffset = menu.prev().offset();
    var menuWidht = menu.outerWidth();
    var toShow = false;

    if (menu.is(":visible") === false) {
        toShow = true;
    }

    $(".optionsMenu").hide();

    if (toShow === true) {
        menu.show();
    }

    jQuery('div:not(.optionsMenuHolder)').click(function(e) {
        if ($(e.target).hasClass('optionsLink')) {
            return ;
        }
        var currentElm = jQuery(".optionsMenuHolder > .optionsMenu:visible");
        if ($(e.target).hasClass('rankings-options')) {
            jQuery('.optionsMenu').hide();
        }

        if (currentElm.length > 0) {
            currentElm.parents('.optionsLink:eq(0)').click();
        }

        if ($(e.target).parents('.optionsMenuHolder').length == 0) {
            jQuery('.optionsMenu').hide();
        }
    });
});

/**
 * Recalculate Free Garrison at any click or keyup that alters units to be inserted
 * in the Garrisons.
 *
 * @param {String} elementId                       - The unit type that is the ID of the field for the units to be inserted
 * @param {Integer} outsideCnt                     - Count of the Units that are outin the field.
 * @param {Integer} escort                         - The needed units to escort a war machine - for human units it is 1.
 * @param {Integer} initialFreeGarrison            - The free garrison at page/AJAX reload.
 * @param {Integer} maxFreeBalisti                 - All Balists in the field
 * @param {Integer} maxBalistiInGarrisonPlusTowers - All Balists that are in the fortress (including garrisones and towers)
 * @param {Integer} placesInTowers                 - The number of all places in towers for balists
 * @return void
 */
function recalculateFreeGarrison (elementId, outsideCnt, escort, initialFreeGarrison, maxFreeBalisti, maxBalistiInGarrisonPlusTowers, placesInTowers) {
    var freeGarrison = parseInt(initialFreeGarrison, 10);
    var unitEscort = 1; // The units escort. This variable will be used in the calculation of the free garrison places in the units cycle
    var thisUnitEscort = parseInt(escort, 10); // The escort for the particular unit we are trying to insert
    var garrisonToBeTaken = 0;
    maxFreeBalisti = parseInt(maxFreeBalisti, 10);
    placesInTowers = parseInt(placesInTowers, 10);
    var currentNumBalistsInTowers = 0;
    var freePlacesInTowers = placesInTowers - currentNumBalistsInTowers;
    if (maxBalistiInGarrisonPlusTowers >= placesInTowers) {
        currentNumBalistsInTowers = placesInTowers;
        freePlacesInTowers = 0;
    } else {
        currentNumBalistsInTowers = parseInt(maxBalistiInGarrisonPlusTowers, 10);
        freePlacesInTowers = placesInTowers - currentNumBalistsInTowers;
    }

    var balistsWouldGoInGarrisones = 0;

    // We get all the units that are selected to be inserted into the garrisons,
    // so we can take them out from the initial free garrisons count
    jQuery.each(jQuery('input.units-to-insert'), function () {
        garrisonToBeTaken = 0;
        var thisElementValue = 0;
        if (jQuery(this).val() != '') {
            thisElementValue = parseInt(jQuery(this).val(), 10);
        }
        if (jQuery(this).attr('id') != elementId && jQuery(this).attr('id') != 'C4') {
            unitEscort = parseInt(jQuery(this).siblings('.soldiers-escort').val(), 10);
            if (isNaN(unitEscort) === true) {
                unitEscort = 0;
            }
            garrisonToBeTaken = Math.floor(thisElementValue * unitEscort);
        } else if (jQuery(this).attr('id') == 'C4' && elementId != 'C4') {
            unitEscort = parseInt(jQuery(this).siblings('.soldiers-escort').val(), 10);
            if (isNaN(unitEscort) === true) {
                unitEscort = 0;
            }
            balistsWouldGoInGarrisones = (thisElementValue - freePlacesInTowers);
            if (balistsWouldGoInGarrisones < 0) {
                balistsWouldGoInGarrisones = 0;
            }

            garrisonToBeTaken = Math.floor(balistsWouldGoInGarrisones * unitEscort);
        }
        freeGarrison -= garrisonToBeTaken;
    });
    var unitsToInsert = parseInt(outsideCnt, 10);
    var placesWouldBeTaken = Math.floor(unitsToInsert * thisUnitEscort);
    if (elementId == 'C4') {
        balistsWouldGoInGarrisones = (parseInt(jQuery('.C4-link').attr('name'), 10) - freePlacesInTowers);
        if (balistsWouldGoInGarrisones > freeGarrison) {
            if (freeGarrison < thisUnitEscort) {
                placesWouldBeTaken = 0;
                unitsToInsert = 0;
            } else {
                placesWouldBeTaken = freeGarrison;
                unitsToInsert = Math.floor(freeGarrison / thisUnitEscort);
            }
        } else {
            placesWouldBeTaken = Math.floor(balistsWouldGoInGarrisones * thisUnitEscort);
            unitsToInsert = parseInt(outsideCnt, 10);
        }
    }

    // If the free garrison is empty or places that would be taken by the selected
    // units would exceed it and we still have free garrison we change the number to
    // the proper value.
    if (freeGarrison <= 0 || (placesWouldBeTaken > freeGarrison && freeGarrison > 0)) {
        if (freeGarrison > placesWouldBeTaken) {
            placesWouldBeTaken = outsideCnt;
            unitsToInsert = Math.floor(parseInt(outsideCnt, 10) / parseInt(escort, 10));
        } else if (freeGarrison > 0) {
            placesWouldBeTaken = freeGarrison;
            unitsToInsert = Math.floor((parseInt(freeGarrison, 10) / parseInt(escort, 10)));
        } else if (freeGarrison <= 0) {
            placesWouldBeTaken = 0;
            unitsToInsert = 0;
        }
    }
    if (elementId == 'C4') {
        unitsToInsert += freePlacesInTowers;
    }

    // If added units are more than those on the field set them to be as much as on the field.
    if (unitsToInsert > outsideCnt) {
        unitsToInsert = outsideCnt;
    }

    if (unitsToInsert > 0) {
        jQuery('#' + elementId).val(parseInt(unitsToInsert));
    }
    return;
}
$(".radio-16").live("click",function(){
    $(".radio-16").each(function(){
        $(this).removeClass("checked");
        if ($(this).children().is(":checked")){
            $(this).addClass("checked");
        } else {
            $(this).removeClass("checked");
        }
    });
    $(this).children().addClass("checked");
});

// start sounds
jQuery.extend({
    stringify  : function stringify(obj) {
        if ("JSON" in window) {
            return JSON.stringify(obj);
        }

        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';

            return String(obj);
        } else {
            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);

            for (n in obj) {
                v = obj[n];
                t = typeof(v);
                if (obj.hasOwnProperty(n)) {
                    if (t == "string") {
                        v = '"' + v + '"';
                    } else if (t == "object" && v !== null){
                        v = jQuery.stringify(v);
                    }

                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
            }

            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    }
});
var battleSimulatorSounds = {
    sounds: {}
};
$(window).load(function(){
    // fix for chrome (the new IE)

    $('input[name^=volumeSettings]','form#musicSettings').live('change',function(){
        if ($('#village').length > 0) {
            var $music = $('input[name^=volumeSettingsMusic]','form#musicSettings').val();
            var $sounds = $('input[name^=volumeSettingsNoises]','form#musicSettings').val();
            var $effects = $('input[name^=volumeSettingsEffects]','form#musicSettings').val();
            getFlashMovieObject("village").changeVolume($music,$sounds,$effects);
        }
    });
    $('a.input-soldiers').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            xajax_playSoundNoRequest('soldierSelectClick');
        }
    });
    $('a.dotted-links').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            xajax_playSoundNoRequest('btnClick');
        }
    });
    $('input#stats-search-button').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            xajax_playSoundNoRequest('btnSearch');
        }
    });
    $('input:checkbox').live('click',function(){
        if ($('#village').hasClass('play-music')) {
            var $sounds = $.parseJSON($('#village').attr('rel'));
            getFlashMovieObject("village").playSound($sounds['checkboxSound']);
        }
    });
    var clickingSlider = false;
    var playSliderSound = false;
    var $sounds = $.parseJSON($('#village').attr('rel'));
    var $stopOnBlur = 1;
    $("div.handle, div.handle > div",".slider-holder").live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            clickingSlider = true;
        }
    });

    $(document).mouseup(function(){
        if (clickingSlider == true) {
            clickingSlider = false;
            playSliderSound = false;
            getFlashMovieObject("village").changeSound($sounds['sliderSounds'], $sounds['sliderSoundsUp']);
        }
    })
    /* sounds for battle simulator start*/

    $('div.simulator-holder label.radio-16').live('change',function(){
        if ($('#village').hasClass('play-music')) {
                getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['radioBtn']);
        }
    });

    $('div.simulator-holder a.big-button').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['btnClick']);
        }
    });

    $('div.simulator-holder a.simulator-tab-first:not(".active")').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['armyTab']);
        }
    });

    $('div.simulator-holder a.simulator-tab-last:not(".active")').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['paramsTab']);
        }
    });

    $('div.simulator-holder a.sim-remove').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['simRemove']);
        }
    });

    $('div.simulator-holder a.sim-clear').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['simClear']);
        }
    });

    $('div.simulator-holder div.simulator-army-in:not(".sim-inactive")').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['btnAddUnit']);
        }
    });

    $('div.simulator-holder a.simulator-unit-close').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['btnUnitX']);
        }
    });

    $('div.simulator-swap > a.large-button').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['btnSwap']);
        }
    });

    $('table.simulator-footer a.large-button').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['btnClick']);
        }
    });

    $('div.simulator-holder div.custom-select').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            if ($('ul',$(this)).css('display') != "block") {
                getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['dropMenuOpen']);
            } else {
                getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['dropMenuClose']);
            }
        }
    });

    $('div.simulator-holder a.simulator-unit-expand').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            if ($(this).parents('div.simulator-unit-holder:eq(0):not(".sim-open")').length > 0) {
                getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['btnUnitExpand']);
            } else {
                getFlashMovieObject("village").playSound(battleSimulatorSounds.sounds['btnUnitUnExpand']);
            }
        }
    });

    /* sounds for battle simulator end*/
    $("div.handle, div.handle > div",".slider-holder").live('mousemove',function(){
        if ($('#village').hasClass('play-music')) {
            if(clickingSlider == false || playSliderSound == true) {
                return;
            }
            playSliderSound = true;
            getFlashMovieObject("village").playSound($sounds['sliderSounds']);
        }
    });
    $('.closeAjaxWindow').live('mousedown',function(){
        if ($('#village').hasClass('play-music')) {
            var $sounds = $.parseJSON($('#village').attr('rel'));
            getFlashMovieObject("village").playSound($sounds['closeSound']);
        }
    });
    $("#missions a.missionsFlagsHeader").live("click",function(){
        if ($('#village').hasClass('play-music')) {
            var $sounds = $.parseJSON($('#village').attr('rel'));
            getFlashMovieObject("village").playSound($sounds['missionSound']);
        }
    });
    var $blur = true;
    var $focus = true;
    var $countFocus = 0;
    if ($('#village').hasClass('play-music')) {
        if (/Chrome|Safari/i.test(navigator.userAgent)) {
              var _timer = setInterval(function(){
              if (/complete/.test(document.readyState)) {
                clearInterval(_timer)
                getFlashMovieObject("village").startSounds();
              }}, 500)
        } else {
            getFlashMovieObject("village").startSounds();
        }
    }

    function onBlur() {
        if (msie7) {
            var tempY = event.clientY + document.body.scrollTop;
            if (tempY > 0) {
                return;
            }
        }
        $focus = true;
        if ($blur == true && $('#village').hasClass('play-music')) {
            var $sounds = $.parseJSON($('#village').attr('rel'));
            var $stopOnBlur = $sounds['stopOnBlur'];
            $blur = false;
            if ($stopOnBlur == 1) {
                $countFocus++;
                getFlashMovieObject("village").playPause(0);
            }
        }
    }
    function onFocus(){
        if (msie7) {
            var tempY = event.clientY + document.body.scrollTop;
            if (tempY > 0) {
                return;
            }
        }
        $blur = true;
        if ($focus == true && $('#village').hasClass('play-music')) {
            var $sounds = $.parseJSON($('#village').attr('rel'));
            var $stopOnBlur = $sounds['stopOnBlur'];
            if ($stopOnBlur == 1) {
                if ($countFocus == 3) {
                    $countFocus++;
                    if ($sounds['showBlurNotification'] != 1) {
                        xajax_soundBlurNotification();
                    }
                }
                getFlashMovieObject("village").playPause(1);
            }
            $focus = false;
        }
    }
    var msie7 = false;
    if ($.browser.msie  && parseInt($.browser.version, 10) < 8) { // check for Internet Explorer
        msie7 = true;
        document.onfocusin = onFocus;
        document.onfocusout = onBlur;
    } else {
        window.onfocus = onFocus;
        window.onblur = onBlur;
    }


// end sounds

// functions_html -> customSelect Javascript
var inMenu = 0;
$(".custom-select-selected > a").live("click",function(e){
    $(this).parents('.custom-select').find('ul').toggle();
});

$('.custom-select-selected > a').live("blur",function(){
    if(inMenu==0) {
        $(this).parents('.custom-select').find('ul').hide();
    }
});

$(".custom-select").find("li").live("click",function(e){
    $(this).parents('.custom-select').find('.custom-select-selected > a').text($(this).children('a').text());
    $(this).parents('.custom-select').find('input').val($(this).children('a').attr("rel"));
    $(this).parents("ul").hide();
});

$('.custom-select').find('ul').live("mouseenter",function(){
    inMenu = 1;
});
$('.custom-select').find('ul').live("mouseleave",function(){
    inMenu = 0;
});
});

/**
 * Formats a given quantity value, ported from PHP by CaXo
 * @param integer quantity
 * @param integer precision
 * @param integer over_ten_m
 *
 * @return string
 *
 * @author stoyan
 */
function formatQuantity(quantity, precision, activate_over_delimer)
{

    var prefix = suffix = '';

    if (quantity < 0) {
        prefix = '-';
        quantity = Math.abs(quantity);
    }

    if (quantity > Math.pow(10, activate_over_delimer)) {
        m = Math.pow(10, 6);
        if (quantity >= m) {
            suffix = 'M';
        } else {
            m = Math.pow(10, 3);
            suffix = 'K';
        }

        thousantsDelimiter    = '&nbsp;';
        quantity = number_format(quantity / m, precision, ',', '#')
        quantity = quantity.replace('#', thousantsDelimiter);
    } else {
        quantity = number_format(quantity, 0, "", "&nbsp;");
    }

    return prefix + quantity + suffix;
}



/**
 * Move Army
 */
function checkButtons()
{
    var sumArmy = $('input.unit-value').filter(function() { return this.value != '' && this.value != '0'; }).length;
    var freeGarrisonArmy = $('#free-all-garrison').text();
    var balistiSpace = $('div.destination label.current').filter(function(){
                        if ($('input#balisti' + $(this).attr('for')).val() > 0 && $('#C4').val() > 0){
                            return true;
                        }
                        return false;
                    });
    var balisti = 0;
    balistiSpace.each(function(){
        balisti += parseInt($('input#balisti' + $(this).attr('for')).val());
    });

    if ($('div.destination input:checked').length == 0 || sumArmy == 0) {
        $('.move-button').attr('readonly',true).addClass('disabled');
        $('#move-army-loader').removeClass('visual-loading');
    } else {
        $('.move-button').attr('readonly',false).removeClass('disabled');

        if(freeGarrisonArmy == 0 && balisti == 0) {
            $('#move-in-garrison-button').attr('readonly',true).addClass('disabled');
        }
    }
    garrnisonCheck();
}

function checkFreeGarrison()
{
    var freeGarrisonArmy = 0;
    $('div.destination input:checked').each(function(){
        freeGarrisonArmy += parseInt($(this).attr('rel'));
    });
    $('#free-all-garrison').text(freeGarrisonArmy);
}

function garrnisonCheck()
{
    if ($('div.destination label.current').length == 0) {
        $('#free-garrison').css('visibility','hidden');
        $('#free-balisti').css('visibility','hidden');
    } else {
        var balistiSpace = $('div.destination label.current').filter(function(){
                    if ($('input#balisti' + $(this).attr('for')).val() > 0 && $('#C4').val() > 0){
                        return true;
                    }
                    return false;
                });
        var balisti = 0;
        balistiSpace.each(function(){
            balisti += parseInt($('input#balisti' + $(this).attr('for')).val());
        });

        if (balisti > 0) {
            $('#free-balisti').css('visibility','visible').children().text(balisti);
        } else {
            $('#free-balisti').css('visibility','hidden');
        }
        $('#free-garrison').css('visibility','visible');
    }
}

/**
 * Toggle class with delay
 * @param varchar element
 * @param varchar tclass
 * @param integer delay
 *
 * @author philip
 */
function toggleClass(element, tclass, delay)
{
    allTimersOnScreen[element] = setInterval(function()
    {
        $(element).toggleClass(tclass);
    }, delay);
}
