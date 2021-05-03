// init data
var clearParamObjects   = true;                             // flag setting, whether to clear param objects or not, used as false when switching sides

var units               = new Object();                        // loaded via xajax
var simType             = 1;                            // shows if the simulator is own or alliance (defaults to own)

var topParams           = new Object();                        // used for parameters switch
var bottomParams        = new Object();                        // used for parameters switch

var userParams          = new Array();                        // used to keep user parameters input   
userParams["top"]       = {STRELCI:"",MELE:"",BRONI:""};    // if necessary when loading parameters
userParams["bottom"]    = {STRELCI:"",MELE:"",BRONI:""};    // according to army input

var paramsAutoCalcTip   = "";

// Unit requirements
var req                 = new Array();

// Tier 1
req['P1']               = {STRELCI:0,MELE:1,BRONI:0};
req['M1']               = {STRELCI:0,MELE:1,BRONI:0};
req['S1']               = {STRELCI:1,MELE:0,BRONI:0};
req['K1']               = {STRELCI:0,MELE:1,BRONI:0};
req['K4']               = {STRELCI:1,MELE:1,BRONI:0};
req['C1']               = {STRELCI:1,MELE:1,BRONI:1};
req['CT']               = {STRELCI:1,MELE:0,BRONI:0};

// Tier 2
req['P2']               = {STRELCI:1,MELE:1,BRONI:1};
req['M2']               = {STRELCI:0,MELE:8,BRONI:8};
req['S2']               = {STRELCI:8,MELE:0,BRONI:0};
req['K2']               = {STRELCI:1,MELE:8,BRONI:8};
req['C2']               = {STRELCI:8,MELE:1,BRONI:1};
req['C4']               = {STRELCI:8,MELE:1,BRONI:1};

// Tier 3
req['P3']               = {STRELCI:1,MELE:1,BRONI:14};
req['M3']               = {STRELCI:0,MELE:15,BRONI:15};
req['S3']               = {STRELCI:16,MELE:0,BRONI:0};
req['K3']               = {STRELCI:1,MELE:16,BRONI:16};
req['K5']               = {STRELCI:16,MELE:16,BRONI:14};
req['C3']               = {STRELCI:16,MELE:1,BRONI:1};

// fortification levels according to castle level {castle level: fortification level}
var fortification       = {1:0, 2:0, 3:0, 4:1, 5:1, 6:6, 7:6, 8:12, 9:12}

// max values
var maxes               = new Array();
maxes['STRELCI']        = 30;
maxes['MELE']           = 30;
maxes['BRONI']          = 30;
maxes['FORT']           = 99;
maxes['FIELD_FORT']     = 15;
// military medicine maxes {race: max level}
maxes['VMED']           = {1:28,2:23}

// trenches maxes {castle level: max trench level}
maxes['TRENCHES']       = {1:1, 2:2, 3:4, 4:6, 5:8, 6:10, 7:12, 8:16, 9:20, 10:24};

// towers maxes {castle level: max towers}
maxes['TOWERS']    = {
        1:{1:0, 2:0, 3:0, 4:2, 5:4, 6:6, 7:12, 8:18, 9:24},
        2:{1:5, 2:10, 3:20, 4:30, 5:40, 6:60, 7:100, 8:140, 9:180, 10:240},
        3:{1:5, 2:10, 3:20, 4:30, 5:40, 6:60, 7:100, 8:140, 9:180, 10:240}
}

maxes['ATTACK_PENALTY'] = 90;

// remove units
$(document).delegate(".simulator-unit-close","click",function(){
    // hide unit box
    $(this).parent().hide();
    $(this).parent().removeClass("unit-visible");
    $(this).parent().children("input").attr("disabled","disabled");
    
    // enable unit button
    var unitType = $(this).parent().children(".simulator-unit-image").children("a").attr("class").split(" ");
    var selector = "."+unitType[0]+"."+unitType[1]+"."+unitType[2];
    $(this).parents(".simulator-army-holder").prev().find(selector).parent().removeClass("sim-inactive");
    
    // recalculate gold, cargo and params
    recalculateGoldAndCargo(this);
    loadParamsForArmy(this);
});

// add units
$(document).delegate(".simulator-army-in>a","click",function(){
    if($(this).parent().hasClass("sim-inactive")==false) {
        // disable unit button
        $(this).parent().addClass("sim-inactive");
        
        // show unit box
        var unitType = $(this).attr("class").split(" ");
        var selector = "."+unitType[0]+"."+unitType[1]+"."+unitType[2];
        var unitBox     = $(this).parents(".simulator-army").next().find(selector).parents(".simulator-unit-holder")
        unitBox.show();
        unitBox.addClass("unit-visible");
        unitBox.children("input").removeAttr("disabled");
        
        // recalculate gold, cargo and params
        recalculateGoldAndCargo(unitBox);
        loadParamsForArmy(unitBox);
    }
});

// add garrison
$(document).delegate(".simulator-unit-expand","click",function(){
    $(this).parent().toggleClass("sim-open");
    if($(this).parent().hasClass("sim-open")) {
        $(this).parent().children(".sim-castle").removeAttr("disabled");
    } else {
        $(this).parent().children(".sim-castle").attr("disabled","disabled");
    }
    
    // recalculate gold and cargo
    recalculateGoldAndCargo(this);
});

// clear all army
$(".simulator-army-holder").find(".sim-clear").live("click",function(){
    // clear army values
    $(this).parents(".simulator-army-holder").find(".simulator-unit-holder").children("input").val("");
    
    // reset total resources
    $(this).parents(".simulator-info").find(".total-resources").html(0);
    
    // recalculate gold and cargo
    recalculateGoldAndCargo(this);
});

//clear all params
$(".simulator-parameters-holder").find(".sim-clear").live("click",function(){
    // clear param values
    $(this).parents(".simulator-parameters-holder").find(".simulator-unit-holder").children("input").val("");
    $(this).parents(".simulator-parameters-holder").find(".custom-select").each(function(){
        $(this).find("li").first().click();
    });
    $(this).parents(".simulator-parameters-holder").find(".custom-check-box").children(".checked").click();
    
    // clear stored data if any
    var side = $(this).parents(".simulator-parameters-holder").parent().attr("id").replace(/simulator-parameters-/g,"");
    if (clearParamObjects) {
        userParams[side] = {STRELCI:"",MELE:"",BRONI:""};
        window[side+"Params"] = {};
    }
});

// remove all units
$(document).delegate(".sim-remove","click",function(){
    $(this).parents(".simulator-army-holder").prev().find(".simulator-army-in").removeClass("sim-inactive");
    $(this).parents(".simulator-army-holder").find(".simulator-unit-holder").each(function(){
        $(this).removeClass("sim-open");
        $(this).children("input").val("");
        $(this).removeClass("unit-visible");
        $(this).hide();
    });
    
    // reset total resources
    $(this).parents(".simulator-info").find(".total-resources").html(0);
    
    // recalculate gold, cargo and params
    recalculateGoldAndCargo(this);
    loadParamsForArmy(this);
});

// recalculate gold equivalent and cargo capacity onkeyup of any input
$(document).delegate(".simulator-unit-holder > input","keyup",function(eventObj){
    var value = $(this).val().replace(".","");
    if (value=="" || value==" ") {
        value = 0;
    }
    if (isNaN(value)) {
        $(this).val(0);
    } else {
        $(this).val(parseFloat(value));
    }
    recalculateGoldAndCargo(this);
});

//top params keyup actions
$("#simulator-parameters-top").find("input").live("keyup",function(eventObj){
    var race = $(".simulator-user").find("input[name='race-top']:checked").val();

    // limit params to specified max levels
    switch ($(this).attr("class")) {
        case "VMED":
            if (maxes["VMED"][race] < $(this).val()) {
                $(this).val(maxes["VMED"][race]);
            }
            if (isNaN($(this).val()) || $(this).val() < 0) {
                $(this).val(0);
            }
        break;
        default:
            if (maxes[$(this).attr("class")] < $(this).val()) {
                $(this).val(maxes[$(this).attr("class")]);
            }
            if (isNaN($(this).val()) || $(this).val() < 0) {
                $(this).val(0);
            }
        break;
    }
    
    // store user input for params
    if (typeof userParams["top"][$(this).attr("class")] != "undefined") {
        userParams["top"][$(this).attr("class")] = $(this).val();
    }
    // removing tooltips
    if (typeof userParams["bottom"][$(this).attr("class")] != "undefined" || $(this).attr("class") == "FORT") {
        $(this).unbind("mouseenter");
    }
});

//bottom params keyup actions
$("#simulator-parameters-bottom").find("input").live("keyup",function(eventObj){
    var race = $(".simulator-user").find("input[name='race-bottom']:checked").val();
    
    // limit params to specified max levels
    switch ($(this).attr("class")) {
        case "VMED":
            if (maxes["VMED"][race] < $(this).val()) {
                $(this).val(maxes["VMED"][race]);
            }
            if (isNaN($(this).val()) || $(this).val() < 0) {
                $(this).val(0);
            }
        break;
        case "TOWERS":
            var castleLevel = $("#simulator-parameters-bottom").find("input[name='KREPOST']").val();
            if (maxes["TOWERS"][simType][castleLevel] < $(this).val()) {
                $(this).val(maxes["TOWERS"][simType][castleLevel]);
            }
            if (isNaN($(this).val()) || $(this).val() < 0) {
                $(this).val(0);
            }
        break;
        case "TRENCHES":
            var castleLevel = $("#simulator-parameters-bottom").find("input[name='KREPOST']").val();
            if (maxes["TRENCHES"][castleLevel] < $(this).val()) {
                $(this).val(maxes["TRENCHES"][castleLevel]);
            }
            if (isNaN($(this).val()) || $(this).val() < 0) {
                $(this).val(0);
            }
        break;
        default:
            if (maxes[$(this).attr("class")] < $(this).val()) {
                $(this).val(maxes[$(this).attr("class")]);
            }
            if (isNaN($(this).val()) || $(this).val() < 0) {
                $(this).val(0);
            }
        break;
    }
    
    // store user input for params
    if (typeof userParams["bottom"][$(this).attr("class")] != "undefined") {
        userParams["bottom"][$(this).attr("class")] = $(this).val();
    }
    // removing tooltips
    if (typeof userParams["bottom"][$(this).attr("class")] != "undefined" || $(this).attr("class") == "FORT") {
        $(this).unbind("mouseenter");
    }
});

//set tab indexes
function setTabIndexes() {
    var tabIndex = 1001;
    $(".simulator-wrap").find("#simulator-army-top").find("input[type!='radio']").each(function() {
        $(this).attr("tabIndex",tabIndex);
        tabIndex++;
    });
    $(".simulator-wrap").find("#simulator-army-bottom").find("input[type!='radio']").each(function() {
        $(this).attr("tabIndex",tabIndex);
        tabIndex++;
    });
}

// visualizes all units for the associated side
function addAllUnits(obj) {
    var armyContainer    = $(obj).parents(".simulator-army");
    var armyInfo        = armyContainer.parent().attr("id").split("-");
    var side            = armyInfo[1];
    var race            = armyInfo[2];
    
    armyContainer.find(".unit").click();
    
    if (side=="bottom") {
        armyContainer.parents("#army-"+side+"-"+race).find(".simulator-unit-expand").click();
    }
}

//recalculates: gold equivalent,cargo capacity,pillage power
function recalculateGoldAndCargo(obj) {
    var goldEquivalent    = 0;
    var cargoCapacity    = 0;
    var pillagePower    = 0;
    $(obj).parents(".simulator-army-holder").find(".simulator-unit-holder.unit-visible").find("input").each(function(){
        if(!isNaN($(this).val()) && $(this).val()>0){
            // get unit and race
            var unitInfo    = $(this).parents(".simulator-unit-holder").find(".unit").attr("class").split(" ");
            var race        = unitInfo[1].substring(unitInfo[1].length-1);
            var unit        = unitInfo[2].substring(unitInfo[2].length-2).toUpperCase();
            goldEquivalent    += $(this).val()*units[race][unit]["ge"];
            cargoCapacity    += $(this).val()*units[race][unit]["space"];
            pillagePower    += $(this).val()*units[race][unit]["pillage"];
        }
    })
    $(obj).parents(".simulator-army-holder").find(".gold").html(number_format(goldEquivalent,0,"","&nbsp;"));
    $(obj).parents(".simulator-army-holder").find(".cart").html(number_format(cargoCapacity,0,"","&nbsp;"));
    $(obj).parents(".simulator-army-holder").find(".pillage").html(number_format(pillagePower,0,"","&nbsp;"));
}

// used to switch between races
function switchRace(side,onRace,offRace) {
    // switch avatars
    $('#army-'+side+'-'+onRace).css("display","block");
    $('#army-'+side+'-'+offRace).css("display","none");
    
    // switch user details
    $('#user-'+side+'-'+onRace).css("display","block");
    $('#user-'+side+'-'+offRace).css("display","none");
    
    // switch fields
    $('#avatar-'+side+'-'+onRace).css("display","block");
    $('#avatar-'+side+'-'+offRace).css("display","none");
    
    // change param VMED to proper max level for race if required
    if ($("#simulator-parameters-"+side).find(".VMED").val() > maxes["VMED"][onRace]) {
        $("#simulator-parameters-"+side).find(".VMED").val(maxes["VMED"][onRace]);
    }
}

// switch between army and parameters
function switchTabs (obj) {
    // select proper tab
    if(!$(obj).hasClass("active")) {
        var objClass    = $(obj).attr("class");
        var parentClass    = $(obj).parent().attr("class");
        $("."+parentClass).children(".active").removeClass("active");
        $("."+parentClass).find("."+objClass).addClass("active");
        
        // switch tab contents
        $("#simulator-army-top").toggle();
        $("#simulator-parameters-top").toggle();
        
        $("#simulator-army-bottom").toggle();
        $("#simulator-parameters-bottom").toggle();
    }
}

// load corresponding params for selected army
function loadParamsForArmy(obj) {
    var currentParams    = {STRELCI:"",MELE:"",BRONI:""};
    var sideInfo        = $(obj).parents(".simulator-army-holder").parent().attr("id").split("-");
    var side            = sideInfo[1];
    
    $(obj).parents(".simulator-army-holder").find("input:visible").each(function(){
        var unitInfo        = $(this).parents(".simulator-unit-holder").find(".unit").attr("class").split(" ");
        var unit            = unitInfo[2].substring(unitInfo[2].length-2).toUpperCase();
        var unitReq            = req[unit];
        
        $.each(unitReq, function(index,value){
            if (typeof currentParams[index] == "undefined" || currentParams[index]<value) {
                currentParams[index] = value;
            }
        });
    });
    $.each(currentParams, function(index,value){
        if (typeof userParams[side][index] != "undefined") {
            if (userParams[side][index] > value) {
                value = userParams[side][index];
            } else if (userParams[side][index] < value) {
                // assinging tooltips
                $("#simulator-parameters-"+side).find("."+index).unbind("mouseenter");
                $("#simulator-parameters-"+side).find("."+index).mouseenter(function() {
                    Tip3(paramsAutoCalcTip);
                });
            }
            $("#simulator-parameters-"+side).find("."+index).val(value);
        }
    });
}

// update fortification according to the castle level
function updateFortification(obj) {
    if(simType == 2 || simType == 3) {
        return;
    }
    if(typeof obj == "object") {
        var castleLevel = $(obj).attr("rel");
    } else {
        var castleLevel = obj;
    }
    if ($("#simulator-parameters-bottom").find(".FORT").val() < fortification[castleLevel]) {
        $("#simulator-parameters-bottom").find(".FORT").val(fortification[castleLevel]);
        $("#simulator-parameters-bottom").find(".FORT").mouseenter(function() {
            Tip3(paramsAutoCalcTip);
        });
    }
}

// switch sides
function switchSides() {
    // get top and bottom races
    var topRace        = $(".attacker").find(".checked > input").val();
    var bottomRace    = $(".defender").find(".checked > input").val();
    
    switchAvatarsSides();
    switchUsersInfoSides();
    
    storeLoadedParams();
    
    // store loaded total resources
    var topResources    = $("#army-top-"+topRace).find(".total-resources").html();
    var bottomResources = $("#army-bottom-"+bottomRace).find(".total-resources").html();
    
    switchUnitsSides();
    
    // load store resources
    $("#army-top-"+bottomRace).find(".total-resources").html(bottomResources);
    $("#army-bottom-"+topRace).find(".total-resources").html(topResources);
    
    switchRacesSides();
    
    // recalculate gold and cargo for top side
    var unitBox = $("#army-top-"+bottomRace).find(".simulator-unit-holder").first();
    recalculateGoldAndCargo(unitBox);

    // recalculate gold and cargo for bottom side
    var unitBox = $("#army-bottom-"+topRace).find(".simulator-unit-holder").first();
    recalculateGoldAndCargo(unitBox);
    
    switchParamsSides();
}

// switch avatars sides
function switchAvatarsSides() {
    var newBottomAvatar    = $(".attacker").find(".simulator-avatar").html().replace(/top/g,"bottom");
    var newTopAvatar    = $(".defender").find(".simulator-avatar").html().replace(/bottom/g,"top");
    $(".attacker").find(".simulator-avatar").html(newTopAvatar);
    $(".defender").find(".simulator-avatar").html(newBottomAvatar);
}

// switch users info sides
function switchUsersInfoSides() {
    var newBottomUser    = $(".attacker").find("#user-top").html().replace(/top/g,"bottom")
    var newTopUser        = $(".defender").find("#user-bottom").html().replace(/bottom/g,"top")
    $(".attacker").find("#user-top").html(newTopUser);
    $(".defender").find("#user-bottom").html(newBottomUser);
}

// switch races sides
function switchRacesSides() {
    // get new top and bottom races
    var newBottomRace    = $(".attacker").find(".simulator-user").find(".checked").children("input").val();
    var newTopRace        = $(".defender").find(".simulator-user").find(".checked").children("input").val();
    
    // if they differ switch the radio buttons and armies
    if (newBottomRace!=newTopRace) {
        $("#radio-top-"+newTopRace).click();
        $("#radio-top-"+newBottomRace).parent().removeClass("checked");
        $("#radio-top-"+newTopRace).parent().addClass("checked");
        
        $("#radio-bottom-"+newBottomRace).click();
        $("#radio-bottom-"+newTopRace).parent().removeClass("checked");
        $("#radio-bottom-"+newBottomRace).parent().addClass("checked");
    }
}

// switch loaded units sides
function switchUnitsSides() {
    var topUnits    = new Object();
    var bottomUnits    = new Object();
    
    // get top units and add them to an object
    $("#simulator-army-top").find(".simulator-unit-holder.unit-visible").each(function(){
        var key = $(this).find(".unit").attr("class").replace(/ /g,".");
        if (!isNaN(parseInt($(this).find("input[class!='sim-castle']").val()))) {
            topUnits[key] = parseInt($(this).find("input[class!='sim-castle']").val())
        } else {
            topUnits[key] = "";
        }
    });
    // clear top side
    $("#simulator-army-top").find(".sim-remove").click();
    
    // get bottom units and add them to an object
    $("#simulator-army-bottom").find(".simulator-unit-holder.unit-visible").each(function(){
        var key = $(this).find(".unit").attr("class").replace(/ /g,".");
        if (!isNaN(parseInt($(this).find("input[class!='sim-castle']").val()))) {
            bottomUnits[key] = parseInt($(this).find("input[class!='sim-castle']").val())
        } else {
            bottomUnits[key] = "";
        }
        if (!isNaN(parseInt($(this).find("input.sim-castle").val()))) {
            bottomUnits[key] += parseInt($(this).find("input.sim-castle").val());
        } 
    });
    // clear bottom side
    $("#simulator-army-bottom").find(".sim-remove").click();
    
    // load bottom units to top side
    $.each(bottomUnits,function(index,value){
        $("#simulator-army-top").find(".simulator-army").find("."+index).click();
        $("#simulator-army-top").find("."+index).parents(".simulator-unit-holder").children("input[class!='sim-castle']").val(value);
    });
    
    // load top units to bottom side
    $.each(topUnits,function(index,value){
        $("#simulator-army-bottom").find(".simulator-army").find("."+index).click();
        $("#simulator-army-bottom").find("."+index).parents(".simulator-unit-holder").children("input[class!='sim-castle']").val(value);
    });
    
}

// store loaded parameter for both sides
function storeLoadedParams() {
    // store top parameters
    $("#simulator-parameters-top").find("input").each(function(){
        switch ($(this).attr("class")) {
            case "PREM":
                topParams[$(this).attr("class")] = $(this).attr("checked");
            break;
            default:
                topParams[$(this).attr("class")] = $(this).val();
            break;
        }
    });
    // store bottom parameters
    $("#simulator-parameters-bottom").find("input").each(function(){
        switch ($(this).attr("class")) {
            case "PREM":
            case "CAPITOL":
            case "VID_KREPOST":
                bottomParams[$(this).attr("class")] = $(this).attr("checked");
            break;
            default:
                bottomParams[$(this).attr("class")] = $(this).val();
            break;
        }
    });
}

// switch loaded params sides
function switchParamsSides() {
    // switch user define parameters
    var tmp                    = userParams["top"];
    userParams["top"]        = userParams["bottom"];
    userParams["bottom"]    = tmp;
    var handlers            = {"top":{},"bottom":{}};
    
    clearParamObjects = false;
    
    // clear top side
    $("#simulator-parameters-top").find(".sim-clear").click();
    
    // clear bottom side
    $("#simulator-parameters-bottom").find(".sim-clear").click();
    
    clearParamObjects = true;
    
    // load top params to bottom side
    $.each(topParams, function(index,value){
        if ($("#simulator-parameters-bottom").find("input."+index).length > 0) {
            switch (index) {
                case "FORMATION":
                case "KREPOST":
                case "RELEF":
                case "BONUS_KONE":
                case "BONUS_PEHOTA":
                case "BONUS_STRELCI":
                case "BONUS_WALLS":
                    $("#simulator-parameters-bottom").find("input."+index).parents(".custom-select").find("a[rel='"+value+"']").click();
                break;
                case "PREM":
                case "CAPITOL":
                case "VID_KREPOST":
                    if (value==true || value==1) {
                        $("#simulator-parameters-bottom").find("input."+index).prev().click();
                    }
                break;
                default:
                    $("#simulator-parameters-bottom").find("input."+index).val(value);
                break;
            }
            
            // if the field exists
            if ($("#simulator-parameters-top").find("input."+index).length > 0) {
                // if we have events
                if (typeof $("#simulator-parameters-top").find("input."+index).data().events != "undefined") {
                    if (typeof $("#simulator-parameters-top").find("input."+index).data().events.mouseenter != "undefined") {
                        // store bottom tooltips to object
                        handlers["bottom"][index] = $("#simulator-parameters-top").find("input."+index).data().events.mouseenter[0].handler;
                    }
                }
            }
        }
    });
    
    // load bottom params to top side
    $.each(bottomParams, function(index,value){
        if ($("#simulator-parameters-top").find("input."+index).length > 0) {
            switch (index) {
                case "FORMATION":
                case "BONUS_KONE":
                case "BONUS_PEHOTA":
                case "BONUS_STRELCI":
                    $("#simulator-parameters-top").find("input."+index).parents(".custom-select").find("a[rel='"+value+"']").click();
                break;
                case "PREM":
                    if (value) {
                        $("#simulator-parameters-top").find("input."+index).prev().click();
                    }
                break;
                default:
                    $("#simulator-parameters-top").find("input."+index).val(value);
                break;
            }
            
            if ($("#simulator-parameters-bottom").find("input."+index).length > 0) {
                // if we have events
                if (typeof $("#simulator-parameters-bottom").find("input."+index).data().events != "undefined") {
                    if (typeof $("#simulator-parameters-bottom").find("input."+index).data().events.mouseenter != "undefined") {
                        // store bottom tooltips to object
                        handlers["top"][index] = $("#simulator-parameters-bottom").find("input."+index).data().events.mouseenter[0].handler;
                    }
                }
            }
        }
    });
    
    // assing tooltips to appropriate sides
    $.each(handlers, function(side,obj){
        // remove all input tooltips for the appropriate side
        $("#simulator-parameters-"+side).find("input").unbind("mouseenter");
        $.each(obj, function(index,handler){
            $("#simulator-parameters-"+side).find("input."+index).mouseenter(handler);
        });
    });
    
    var tmpParams    = topParams;
    topParams        = bottomParams;
    bottomParams    = tmpParams;
}

// gather attacker data,defender data and battle type and send it for simulation
function postSimData(battleType) {
    // initialize storage arrays
    var data            = new Array();

    data.push({"name":"TIP_BITKA","value":battleType});
    
    // get races
    var topRace        = $(".attacker").find(".simulator-user").find(".checked > input").val();
    var bottomRace    = $(".defender").find(".simulator-user").find(".checked > input").val();
    
    data.push({"name":"topRace","value":topRace});
    data.push({"name":"bottomRace","value":bottomRace});
    
    // get armies
    $("#army-top-"+topRace).find(".unit-visible").find("input[class!='sim-castle']").each(function(index){
        if ($(this).val()!="") {
            var unitInfo    = $(this).parents(".simulator-unit-holder").find(".unit").attr("class").split(" ");
            var unit        = "S_"+unitInfo[2].substring(unitInfo[2].length-2).toUpperCase();
            data.push({"name":unit,"value":$(this).val()});
        }
    });
    $("#army-bottom-"+bottomRace).find(".unit-visible").find("input").each(function(index){
        if ($(this).val()!="") {
            var unitInfo    = $(this).parents(".simulator-unit-holder").find(".unit").attr("class").split(" ");
            if ($(this).hasClass("sim-castle")) {
                var unit        = "G_"+unitInfo[2].substring(unitInfo[2].length-2).toUpperCase();
            } else {
                var unit        = "D_"+unitInfo[2].substring(unitInfo[2].length-2).toUpperCase();
            }
            data.push({"name":unit,"value":$(this).val()});
        }
    });

    // get params
    $("#simulator-parameters-top").find("input").each(function(index){
        if ($(this).val()!="") {
            if ($(this).attr("type")=="checkbox") {
                var value = ($(this).attr("checked"))?"1":"0";
                data.push({"name":"S_"+$(this).attr("class"),"value":value});
            } else {
                data.push({"name":"S_"+$(this).attr("class"),"value":$(this).val()});
            }
        }
    });
    $("#simulator-parameters-bottom").find("input").each(function(index){
        if ($(this).val()!="") {
            if ($(this).attr("type")=="checkbox") {
                var value = ($(this).attr("checked"))?"1":"0";
                data.push({"name":"D_"+$(this).attr("class"),"value":value});
            } else {
                data.push({"name":"D_"+$(this).attr("class"),"value":$(this).val()});
            }
        }
    });
    
    var params = new Array();
    params['data']          = data;
    params['simulatorType'] = simType;
    
    xajax_doSimulation(1998,params);
}