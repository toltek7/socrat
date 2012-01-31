/***************************************************************
 *  JS-TrackBar
 *
 *   Copyright (C) 2008 by Alexander Burtsev - http://webew.ru/
 *   and abarmot - http://abarmot.habrahabr.ru/
 *      and 1602 - http://1602.habrahabr.ru/
 *   desing: Svetlana Solovieva - http://my.mail.ru/bk/concur/
 *
 *  This code is a public domain.
 ***************************************************************/

/***************************************************************
 *
 *    Code modifications by Mongoose - http://mongi.habrahabr.ru/     
 *    
 ***************************************************************/


$.fn.trackbar = function(op){
    op = $.extend({
        onMove: function(){
            if (this.createHiddenInputs)
            {
                this.jq.find("input[name="+this.leftInputName+"]").val(this.leftValue);
                if (this.dual)                
                    this.jq.find("input[name="+this.rightInputName+"]").val(this.rightValue);
            }
        },
        onMouseUpMove: function(){return {left: this.leftValue, right: this.rightValue}},
        onLeftLimitTextSet: function(){return this.leftLimit},        
        onRightLimitTextSet: function(){return this.rightLimit},        
        
        onLeftSliderTextSet: function(){ return this.leftValue},        
        onRightSliderTextSet: function(){return this.rightValue},        
        
        onBigTickText: function(value){return value},        
        
        
        dual: true,
        width: 250, // px
        leftLimit: 0, // unit of value
        leftValue: 500, // unit of value
        rightLimit: 5000, // unit of value
        rightValue: 1500, // unit of value
        //roundUp: 50, // unit of value
        jq: this
    },op);
    
    $.trackbar.getObject(op.id).init(op);
}

$.trackbar = { // NAMESPACE
    archive : [],
    getObject : function(id) {            
        if(typeof id == 'undefined')id = this.archive.length;
        if(typeof this.archive[id] == "undefined"){
            this.archive[id] = new this.hotSearch(id);
            return this.archive[id];
        }                                
        
        return this.archive[id];
    }
};

$.trackbar.hotSearch = function(id) { // Constructor
    
    // Vars
    this.id = id;
    
    this.leftWidth = 0; // px
    this.rightWidth = 0; // px
    this.width = 0; // px
    this.intervalWidth = 0; // px    
        
    
    this.leftLimit = 0;
    this.leftValue = 0;
    this.rightLimit = 0;
    this.rightValue = 0;
    this.valueInterval = 0;
    this.widthRem = 6;
    this.valueWidth = 0;
    this.roundUp = 0;
    
    this.maximumInterval = 0;
    
    this.tickRoundUp = this.roundUp;
    this.tickDivider = 5;
    
    this.x0 = 0; this.y0 = 0;
    this.blockX0 = 0; 
    this.rightX0 = 0; 
    this.leftX0 = 0;
    this.lastDragDirection = 0;
    this.lastDragValue = 0;
    
    this.leftInputName = this.id+'Left';
    this.rightInputName = this.id+'Right';
    
    // Flags
    this.dual = true;
    this.moveState = false;
    this.moveIntervalState = false;
    this.debugMode = false;
    this.clearLimits = false;
    this.clearValues = false;
    
    this.allowOverrideBorders = false;
    this.showSmallTicks = true;
    this.showBigTicks = true;
    this.showBigTicksText = true;
    this.precisePositioning = false;
    
    this.createHiddenInputs = false;
    
    
    // Handlers
    this.onMove = null;
    this.onMouseUpMove = null;

    this.onLeftLimitTextSet = null;
    this.onRightLimitTextSet = null;    
    this.onLeftSliderTextSet = null;
    this.onRightSliderTextSet = null;    
    this.onBigTickText = null;
    
    // Nodes
    this.leftBlock = null;
    this.rightBlock = null;
    this.leftBegun = null;
    this.rightBegun = null;
    this.centerBlock = null;
    this.itWasMove = false;
    
    this.intervalMove = false;
}

$.trackbar.hotSearch.prototype = {
// Const
    ERRORS : {
        1 : "Error while object initialization",
        2 : "Left slider not found",
        3 : "Right slider not found",
        4 : "Left resize area not found",
        5 : "Right resize area not found",
        6 : "Slider area width not set",
        7 : "Maximum value is not set",
        8 : "Call-back function is not defined",
        9 : "Click area isn't defined"
    },
    LEFT_BLOCK_PREFIX : "leftBlock",
    RIGHT_BLOCK_PREFIX : "rightBlock",
    LEFT_BEGUN_PREFIX : "leftBegun",
    RIGHT_BEGUN_PREFIX : "rightBegun",
    CENTER_BLOCK_PREFIX : "centerBlock",
// Methods
    // Default
    gebi : function(id) {
        return this.jq.find("."+id+"")[0];
    },
    addHandler : function(object, event, handler, useCapture) {
        if (object.addEventListener) {
            object.addEventListener(event, handler, useCapture ? useCapture : false);
        } else if (object.attachEvent) {
            object.attachEvent('on' + event, handler);
        } else alert(this.errorArray[9]);
    },
    defPosition : function(event) { 
        var x = y = 0; 
        if (document.attachEvent != null) {
            x = window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft; 
            y = window.event.clientY + document.documentElement.scrollTop + document.body.scrollTop; 
        } 
        if (!document.attachEvent && document.addEventListener) { // Gecko 
            x = event.clientX + window.scrollX; 
            y = event.clientY + window.scrollY; 
        } 
        return {x:x, y:y}; 
    },
    absPosition : function(obj) { 
        var x = y = 0; 
        while(obj) { 
            x += obj.offsetLeft; 
            y += obj.offsetTop; 
            obj = obj.offsetParent; 
        } 
        return {x:x, y:y}; 
    },
    // Common
    debug : function(keys) {
        if (!this.debugMode) return;
        var mes = "";
        for (var i = 0; i < keys.length; i++) mes += this.ERRORS[keys[i]] + " : ";
        mes = mes.substring(0, mes.length - 3);
        alert(mes);
    },
    init : function(hash) {
        try {
            this.dual = typeof hash.dual != "undefined" ? !!hash.dual : this.dual;
            this.leftLimit = hash.leftLimit || this.leftLimit;
            this.rightLimit = hash.rightLimit || this.rightLimit;
            this.width = hash.width || this.width;
            
            this.maximumInterval = hash.maximumInterval || this.maximumInterval;
            
            this.onMove = hash.onMove || this.onMove;
            this.onMouseUpMove = hash.onMouseUpMove || this.onMouseUpMove;

            this.onLeftLimitTextSet = hash.onLeftLimitTextSet || this.onLeftLimitTextSet;
            this.onRightLimitTextSet = hash.onRightLimitTextSet || this.onRightLimitTextSet;
            
            this.onLeftSliderTextSet = hash.onLeftSliderTextSet || this.onLeftSliderTextSet;
            this.onRightSliderTextSet = hash.onRightSliderTextSet || this.onRightSliderTextSet;
            
            this.onBigTickText = hash.onBigTickText || this.onBigTickText;
            
            this.clearLimits = hash.clearLimits || this.clearLimits;
            this.clearValues = hash.clearValues || this.clearValues;
            this.allowOverrideBorders = hash.allowOverrideBorders || this.allowOverrideBorders;
            this.precisePositioning = hash.precisePositioning || this.precisePositioning;
            this.createHiddenInputs = hash.createHiddenInputs || this.createHiddenInputs;
            
            this.showSmallTicks = typeof hash.showSmallTicks != "undefined" ? hash.showSmallTicks : this.showSmallTicks;
            this.showBigTicks = typeof hash.showBigTicks != "undefined" ? hash.showBigTicks : this.showBigTicks;
            this.showBigTicksText = typeof hash.showBigTicksText != "undefined" ? hash.showBigTicksText : this.showBigTicksText;
            
            this.leftInputName = typeof hash.leftInputName != "undefined" ? hash.leftInputName : this.leftInputName;
            this.rightInputName = typeof hash.rightInputName != "undefined" ? hash.rightInputName : this.rightInputName;
                
            this.roundUp = hash.roundUp || this.roundUp;
            
            this.tickRoundUp = hash.tickRoundUp || this.tickRoundUp;
            this.tickDivider = hash.tickDivider || this.tickDivider;
            this.jq = hash.jq;
            // HTML Write            
            var inputs = "";
            if (this.createHiddenInputs)
            {
                inputs = '<input type="hidden" name="'+this.leftInputName+'" value="'+this.leftValue+'">';
                if (this.dual)
                    inputs += '<input type="hidden" name="'+this.rightInputName+'" value="'+this.rightValue+'">';
            }
            this.jq.html('<table' + (this.width ? ' style="width:'+this.width+'px;"' : '') + 'class="trackbar" onSelectStart="return false;">\
                <tr>\
                    <td class="l"><div class="leftBlock"><span></span><span class="limit"></span><img class="leftBegun" ondragstart="return false;" src="../i/imgtrackbar/b_l.gif" width="5" height="17" alt="" /></div></td>\
                    <td class="centerBlock c"></td>\
                    <td class="r"><div class="rightBlock"><span></span><span class="limit"></span><img class="rightBegun" ondragstart="return false;" src="../i/imgtrackbar/b_r.gif" width="5" height="17" alt="" /></div></td>\
                </tr>\
            </table>'+inputs+'<div class="scale" ' + (this.width ? ' style="width:'+this.width+'px;"' : '') + '></div>');
            // Is all right?
            if (this.onMove == null) {
                this.debug([1,8]);
                    return;
            }
            // ---            
            this.leftBegun = this.gebi(this.LEFT_BEGUN_PREFIX);
            if (this.leftBegun == null) {
                this.debug([1,2]);
                    return;
            }
            this.rightBegun = this.gebi(this.RIGHT_BEGUN_PREFIX);
            if (this.rightBegun == null) {
                this.debug([1,3]);
                    return;
            }
            this.leftBlock = this.gebi(this.LEFT_BLOCK_PREFIX);
            if (this.leftBlock == null) {
                this.debug([1,4]);
                    return;
            }
            
                        
            this.rightBlock = this.gebi(this.RIGHT_BLOCK_PREFIX);
            if (this.rightBlock == null) {
                this.debug([1,5]);
                    return;
            }
            this.centerBlock = this.gebi(this.CENTER_BLOCK_PREFIX);
            if (this.centerBlock == null) {
                this.debug([1,9]);
                    return;
            }
            // ---
            if (!this.width) {
                this.debug([1,6]);
                    return;
            }
            if (!this.rightLimit) {
                this.debug([1,7]);
                    return;
            }
            // Set default
            this.valueWidth = this.width - 2 * this.widthRem;
            this.rightValue = hash.rightValue || this.rightLimit;
            this.leftValue = hash.leftValue || this.leftLimit;
            if (!this.dual) this.rightValue = this.leftValue;
            this.valueInterval = this.rightLimit - this.leftLimit;
            this.leftWidth = parseInt((this.leftValue - this.leftLimit) / this.valueInterval * this.valueWidth) + this.widthRem;
            this.rightWidth = this.valueWidth - parseInt((this.rightValue - this.leftLimit) / this.valueInterval * this.valueWidth) + this.widthRem;
            // Set limits
            if (!this.clearLimits) {
                this.leftBlock.firstChild.nextSibling.innerHTML = this.onLeftLimitTextSet();
                this.rightBlock.firstChild.nextSibling.innerHTML = this.onRightLimitTextSet();
            }
            // Do it!
            this.SetRuler();
            this.setCurrentState();
            this.onMove();            
            
            // Add handers
            var _this = this;
            this.addHandler (
                document,
                "mousemove",
                function(evt) {                    
                    if (_this.moveState) _this.moveHandler(evt);
                    if (_this.moveIntervalState) _this.moveIntervalHandler(evt);
                }
            );
            this.addHandler (
                document,
                "mouseup",
                function(evt) {
                    _this.moveState = false;
                    _this.moveIntervalState = false;
                    if (_this.itWasMove) _this.mouseUpMove(evt);
                    _this.itWasMove = false;
                }
            );
            this.addHandler (
                this.leftBegun,
                "mousedown",
                function(evt) {                    
                    evt = evt || window.event;
                    if (evt.preventDefault) evt.preventDefault();
                    evt.returnValue = false;
                    _this.lastDragDirection = 0;
                    _this.lastDragValue = 0;
                    _this.moveState = "left";
                    _this.x0 = _this.defPosition(evt).x;
                    _this.blockX0 = _this.leftWidth;
                }
            );
            this.addHandler (
                this.rightBegun,
                "mousedown",
                function(evt) {
                    evt = evt || window.event;
                    if (evt.preventDefault) evt.preventDefault();
                    evt.returnValue = false;
                    _this.lastDragDirection = 0;
                    _this.lastDragValue = 0;
                    _this.moveState = "right";
                    _this.x0 = _this.defPosition(evt).x;
                    _this.blockX0 = _this.rightWidth;
                }
            );
            this.addHandler (
                this.centerBlock,
                "mousedown",
                function(evt) {
                    evt = evt || window.event;
                    if (evt.preventDefault) evt.preventDefault();
                    evt.returnValue = false;
                    _this.moveIntervalState = true;
                    if (!(_this.allowOverrideBorders && ((_this.leftValue < _this.leftLimit) || (_this.rightValue > _this.rightLimit) ) ))
                            _this.intervalWidth = _this.width - _this.rightWidth - _this.leftWidth;
                    _this.x0 = _this.defPosition(evt).x;
                    _this.rightX0 = _this.rightWidth; 
                    _this.leftX0 = _this.leftWidth;
                }
            ),
            this.addHandler (
                this.centerBlock,
                "click",
                function(evt) {
                    if (!_this.itWasMove) _this.clickMove(evt);
                    _this.itWasMove = false;
                }
            );
            this.addHandler (
                this.leftBlock,
                "click",
                function(evt) {
                    if (!_this.itWasMove)_this.clickMoveLeft(evt);
                    _this.itWasMove = false;
                }
            );
            this.addHandler (
                this.rightBlock,
                "click",
                function(evt) {
                    if (!_this.itWasMove)_this.clickMoveRight(evt);
                    _this.itWasMove = false;
                }
            );
        } catch(e) {this.debug([1]);}
    },
    clickMoveRight : function(evt) {
        evt = evt || window.event;
        if (evt.preventDefault) evt.preventDefault();
        evt.returnValue = false;
        
        var x = this.defPosition(evt).x - this.absPosition(this.rightBlock).x;
        var w = this.rightBlock.offsetWidth;
        if (x <= 0 || w <= 0 || w < x || (w - x) < this.widthRem) return;
        this.rightWidth = (w - x);
        this.rightCounter();

        this.setCurrentState();
        this.onMove();
    },
    clickMoveLeft : function(evt) {            
        evt = evt || window.event;
        if (evt.preventDefault) evt.preventDefault();
        evt.returnValue = false;
        var x = this.defPosition(evt).x - this.absPosition(this.leftBlock).x;
        var w = this.leftBlock.offsetWidth;
        if (x <= 0 || w <= 0 || w < x || x < this.widthRem) return;
        this.leftWidth = x;
        this.leftCounter();

        this.setCurrentState();
        this.onMove();

        
        /*
        var tmpinterval = parseInt((this.leftWidth - x - this.widthRem) / this.valueWidth * this.valueInterval)
        this.leftLimit -= tmpinterval;
        this.rightLimit -= tmpinterval;
        
        this.leftValue  = (this.leftValue + this.rightValue) / 2 - tmpinterval;
        this.rightValue = (this.leftValue + this.rightValue) / 2 + tmpinterval;
        
        
        this.ResetLimits();
        this.leftCounter();
        this.rightCounter();
        */
    /*    this.setCurrentState();
        this.onMove();*/
    },
    mouseUpMove : function(evt) {
        evt = evt || window.event;
        if (evt.preventDefault) evt.preventDefault();
        evt.returnValue = false;
        this.onMouseUpMove();
    },
    clickMove : function(evt) {
        if ( this.leftBegun.style.visibility=="hidden")
            return;
        
        evt = evt || window.event;
        if (evt.preventDefault) evt.preventDefault();
        evt.returnValue = false;
        
        var x = this.defPosition(evt).x - this.absPosition(this.centerBlock).x;
        var w = this.centerBlock.offsetWidth;
        if (x <= 0 || w <= 0 || w < x) return;
        if (x >= w / 2) {
            this.rightWidth += (w - x);
            this.rightCounter();
        } else {
            this.leftWidth += x;
            this.leftCounter();
        }
        this.setCurrentState();
        this.onMove();
        this.onMouseUpMove();
    },
    setCurrentState : function() {

        this.leftBlock.style.width = this.leftWidth + "px";
        if (!this.clearValues) this.leftBlock.firstChild.innerHTML = (!this.dual && this.leftWidth > this.width / 2) ? "" : this.onLeftSliderTextSet();
        if(!this.dual) {
            var x = this.leftBlock.firstChild.offsetWidth;
            this.leftBlock.firstChild.style.right = (this.widthRem * (1 - 2 * (this.leftWidth - this.widthRem) / this.width) - ((this.leftWidth - this.widthRem) * x / this.width)) + 'px';
        }
        this.rightBlock.style.width = this.rightWidth + "px";
        if (!this.clearValues) this.rightBlock.firstChild.innerHTML = (!this.dual && this.rightWidth >= this.width / 2) ? "" : this.onRightSliderTextSet();
        if(!this.dual) {
            var x = this.rightBlock.firstChild.offsetWidth;
            this.rightBlock.firstChild.style.left = (this.widthRem * (1 - 2 * (this.rightWidth - this.widthRem) / this.width) - ((this.rightWidth - this.widthRem) * x / this.width)) + 'px';            
        }
        
        if (this.allowOverrideBorders)
        {
        if (this.leftValue < this.leftLimit-1) 
            this.leftBegun.style.visibility="hidden";
        else
                this.leftBegun.style.visibility="visible";
        
        if (this.rightValue > this.rightLimit) 
            this.rightBegun.style.visibility="hidden";
        else
                this.rightBegun.style.visibility="visible";                
                this.ResetLimits();
        }
        
    },

    moveHandler : function(evt) {

        this.itWasMove = true;
        evt = evt || window.event;
        if (evt.preventDefault) evt.preventDefault();        
        
        if (this.maximumInterval > 0)
        {
            var lastLeft = this.leftValue;
            var lastRight = this.rightValue;        
            var lastLeftWidth = this.leftWidth;
            var lastRightWidth = this.rightWidth;
        }
        
        evt.returnValue = false;
        if (this.moveState == "left") {
            this.leftWidth = this.blockX0 + this.defPosition(evt).x - this.x0;
            this.leftCounter();
        }
        if (this.moveState == "right") {
            this.rightWidth = this.blockX0 + this.x0 - this.defPosition(evt).x;
            this.rightCounter();
        }
        
        if ((this.maximumInterval > 0) && ( (this.rightValue - this.leftValue) > this.maximumInterval))
        {            
            if (this.moveState == "left") {        
                this.leftValue = lastRight - this.maximumInterval;
                this.rightValue = lastRight;                
                this.leftWidth = this.width - this.rightWidth -  this.valueWidth * (this.maximumInterval / this.valueInterval);
                this.rightWidth = lastRightWidth;
            }
            
            if (this.moveState == "right") {        
                this.leftValue = lastLeft;
                this.rightValue = lastLeft + this.maximumInterval;                
                this.leftWidth = lastLeftWidth;
                this.rightWidth = this.width - this.leftWidth-  this.valueWidth * (this.maximumInterval / this.valueInterval);
            }            
        }
        
        if (this.precisePositioning)
            this.SetPosition();    
        
        this.setCurrentState();
        this.onMove();
    },
    moveIntervalHandler : function(evt) {
        
        this.itWasMove = true;
        evt = evt || window.event;
        if (evt.preventDefault) evt.preventDefault();
        evt.returnValue = false;
        
                        
        var dX = this.defPosition(evt).x - this.x0;
        
        if (
            ((this.leftValue < this.leftLimit) && (this.rightValue > this.rightLimit) ) 
            || ((this.leftWidth > (this.width - this.widthRem * 5) )&& (this.rightValue > this.rightLimit) && (dX >0))
            || ((this.rightWidth > (this.width - this.widthRem * 5) )&& (this.leftValue < this.leftLimit) && (dX < 0))
            )
                        return;
                        
        
        if (dX > 0) {
            this.rightWidth = ((this.rightX0 - dX > this.widthRem) || this.allowOverrideBorders) ? this.rightX0 - dX : this.widthRem;
            this.leftWidth = this.width - this.rightWidth - this.intervalWidth;
        } else {
            this.leftWidth = ((this.leftX0 + dX > this.widthRem ) || this.allowOverrideBorders)? this.leftX0 + dX : this.widthRem;
            this.rightWidth = this.width - this.leftWidth - this.intervalWidth;
            
        }
        
        this.intervalMove = true;
        this.rightCounter();
        this.leftCounter();
        this.intervalMove = false;
        if (this.allowOverrideBorders)
        {
            this.leftWidth = (this.leftWidth > this.widthRem ) ? this.leftWidth : this.widthRem;
            this.rightWidth = (this.rightWidth > this.widthRem ) ? this.rightWidth : this.widthRem;
        }
        if (this.precisePositioning)
            this.SetPosition();    
        this.setCurrentState();
        this.onMove();
    },
    rightCounter : function() {
        if (this.dual) {
            if ((!this.allowOverrideBorders) || (!this.intervalMove))
            {            
                this.rightWidth = this.rightWidth > this.width - this.leftWidth ? this.width - this.leftWidth : this.rightWidth;
                this.rightWidth = this.rightWidth < this.widthRem ? this.widthRem : this.rightWidth;
            }
            this.rightValue = this.leftLimit + this.valueInterval - parseInt(((this.rightWidth - this.widthRem) / this.valueWidth) * this.valueInterval);
            
            if (this.roundUp) this.rightValue = parseInt(this.rightValue / this.roundUp) * this.roundUp;
            if (this.leftWidth + this.rightWidth >= this.width) this.rightValue = this.leftValue;
        } else {
            this.rightWidth = this.rightWidth > (this.width - this.widthRem) ? this.width - this.widthRem : this.rightWidth;
            this.rightWidth = this.rightWidth < this.widthRem ? this.widthRem : this.rightWidth;
            this.leftWidth = this.width - this.rightWidth;
            this.rightValue = this.leftLimit + this.valueInterval - parseInt((this.rightWidth - this.widthRem) / this.valueWidth * this.valueInterval);
            if (this.roundUp) this.rightValue = parseInt(this.rightValue / this.roundUp) * this.roundUp;
            this.leftValue = this.rightValue;
        }
    },
    leftCounter : function() {
        if (this.dual) {
            if ((!this.allowOverrideBorders) || (!this.intervalMove))        
            {    
                this.leftWidth = this.leftWidth > this.width - this.rightWidth ? this.width - this.rightWidth : this.leftWidth;
                this.leftWidth = this.leftWidth < this.widthRem ? this.widthRem : this.leftWidth;
            }
            this.leftValue = this.leftLimit + parseInt((this.leftWidth - this.widthRem) / this.valueWidth * this.valueInterval);
            if (this.roundUp) this.leftValue = parseInt(this.leftValue / this.roundUp) * this.roundUp;
            if (this.leftWidth + this.rightWidth >= this.width) this.leftValue = this.rightValue;
        } else {
            this.leftWidth = this.leftWidth > (this.width - this.widthRem) ? this.width - this.widthRem : this.leftWidth;
            this.leftWidth = this.leftWidth < this.widthRem ? this.widthRem : this.leftWidth;
            this.rightWidth = this.width - this.leftWidth;
            this.leftValue = this.leftLimit + parseInt((this.leftWidth - this.widthRem) / this.valueWidth * this.valueInterval);
            if (this.roundUp) this.leftValue = parseInt(this.leftValue / this.roundUp) * this.roundUp;
            this.rightValue = this.leftValue;
        }
    },
    ResetLimits : function(){
        if (!this.clearLimits) {
                this.leftBlock.firstChild.nextSibling.innerHTML = this.onLeftLimitTextSet();
                this.rightBlock.firstChild.nextSibling.innerHTML = this.onRightLimitTextSet();
            }
    },
    
    SetPositionWithNoMove : function(){
        
        var rValue = (this.rightLimit > this.rightValue ? this.rightValue : this.rightLimit);
        var lValue = (this.leftLimit < this.leftValue ? this.leftValue : this.leftLimit);
        
        // Set default                
        this.valueInterval = this.rightLimit - this.leftLimit;
        this.leftWidth = parseInt((lValue - this.leftLimit) / this.valueInterval * this.valueWidth) + this.widthRem;
        this.rightWidth = this.valueWidth - parseInt((rValue - this.leftLimit) / this.valueInterval * this.valueWidth) + this.widthRem;                
        
        this.setCurrentState();
    },
    
    SetPosition : function(){
        this.SetPositionWithNoMove();
        this.onMove();        
    },
    
    SetRuler : function() {
        
                
        if (((this.valueInterval /  this.tickRoundUp) > 100) || (!(this.showSmallTicks || this.showBigTicks  || this.showBigTicksText)))
        return;
        
        var tickCount = parseInt(this.valueInterval /  this.tickRoundUp);
        if (this.showSmallTicks)
            var blankWidth = ((this.width - this.widthRem * 2 - tickCount)  / (tickCount)) 
        else
                var blankWidth = ((this.width - this.widthRem * 2 - parseInt (tickCount/ (this.tickDivider) ))  / (tickCount))         
                
                
        var bigtickstr = "";
        
        if (this.showBigTicksText){
            var bigtickCount = parseInt (tickCount/ (this.tickDivider) )  ;
            var bigTickWidth =  (((this.width - (this.widthRem *2) - tickCount)  / (tickCount))*(this.tickDivider) + this.tickDivider );

            bigtickstr = '<div class="ticktext">';
            var padding = this.widthRem;
            for(var i=0; i<bigtickCount; i++ )
            {
                bigtickstr += '<div class="bt" style="left: '+padding+'px">'+this.onBigTickText(this.leftLimit + this.tickDivider * i * this.tickRoundUp)+'</div>';
                padding += bigTickWidth;
            }
            bigtickstr += '<div class="bt" style="left: '+padding+'px">'+this.onBigTickText(this.leftLimit + this.tickDivider * i * this.tickRoundUp)+'</div>';
            bigtickstr += "</div>";
        }

        var simpletickstr = "";
        //alert(this.showBigTicks);
        var padding = this.widthRem;
        if (this.showSmallTicks || this.showBigTicks)
        {
            var simpletickstr = "<div class='smalltick' style='width: "+this.width+"px'>";
            
            for(var i=0; i<tickCount; i++ )
            {
                if (((i % this.tickDivider) == 0) && (this.showBigTicks))
                    {simpletickstr += '<div class="tl" style="left: '+padding+'px"></div>';}
                else{
                    if (this.showSmallTicks)
                        {simpletickstr += '<div class="t" style="left: '+padding+'px"></div>';}                
                
                }
                
                padding += blankWidth ;
            }
                
            if (((i % this.tickDivider) == 0)  && this.showBigTicks)
                simpletickstr +='<div class="tl" style="left: '+padding+'px"></div>';
            else if (this.showSmallTicks)
                    simpletickstr +='<div class="t" style="left: '+padding+'px"></div>';
            simpletickstr += "</div>";
        }        
    
        
        this.jq.find("div.scale").html( bigtickstr + simpletickstr );        
    },
    updateLeftValue: function(value){
        if ((value >= this.leftLimit)&&(value<=this.rightLimit))
        {
            this.leftValue = value;
            if (!this.dual)
                this.rightValue = value;
            this.SetPositionWithNoMove();
        }     
    },
    updateRightValue: function(value){
        if ((value >= this.leftLimit)&&(value<=this.rightLimit))
        {
            this.rightValue = value;
            if (!this.dual)
                this.leftValue = value;
            this.SetPositionWithNoMove();
        }
    }
}
