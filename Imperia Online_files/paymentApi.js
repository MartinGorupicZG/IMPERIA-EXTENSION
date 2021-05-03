paymentApi = {
		containerId: 'panel',
		scriptsVersion : 8,
		paymentsURL:'//payments.imperiaonline.org/',
		loadArguments : null,
		scriptSource : function() {
			
		    var scripts = document.getElementsByTagName('script');
		    for(i in scripts) {
		    	if(typeof scripts[i].src != 'undefined') {
			    	if(scripts[i].src.match('paymentApi.js')) {
			    		var script = scripts[i].src;
			    		
			    	}
		    	}
		    }
		    

		    return script.substring(0, script.lastIndexOf('/static/scripts/')) + '/';
		},
		paymentPanelSetup:{},
		noCall : false,
		prepare : function(){
			paymentApi.noCall = 1;
			paymentApi.init();
		},
		init : function(){
			if(arguments) {
				if(arguments.length > 0 && (typeof arguments[0].token!='undefined')) {
					window.paymentPanelSetup = arguments[0].token;
					delete(arguments[0].token);
				}
			}
			this.loadArguments = arguments;
			this.paymentsURL = this.scriptSource();
			paymentApi.paymentsURL = this.paymentsURL;
			if(!window.jQuery || !window.paymenPanel){
				
				if(!window.jQuery){
					this.loadJsFile(this.paymentsURL+'static/scripts/jquery-1.9.1.js?v='+this.scriptsVersion,function(){
						paymentApi.haveJQuery();
					});
				} else {
					paymentApi.haveJQuery();
				}
			} else {
				this.proccess();
			}
				
				/*//bypass pre-commit hook*/
		},
		haveJQuery : function() {
			if(!window.paymenPanel){
				this.loadJsFile(this.paymentsURL+'static/scripts/main.js?v='+this.scriptsVersion,function(){
					paymentApi.haveMain();
				});
			} else {
				paymentApi.haveMain();
			}
		},
		haveMain : function() {
			if(!window.progressTimers){
				this.loadJsFile(this.paymentsURL+'static/scripts/paymentTimers.js?v='+this.scriptsVersion,function(){
					paymentApi.proccess();
				});
			} else {
				paymentApi.proccess();
			}
		},
		proccess : function(){
			if(!window.jQuery || !window.paymenPanel || paymentApi.noCall == 1) {
				paymentApi.noCall = 0;
				return;
			}
			
			this.paymentPanelSetup=window.paymentPanelSetup;
			this.containerId = (typeof this.paymentPanelSetup != 'undefined' && typeof this.paymentPanelSetup.containerId != 'undefined')?this.paymentPanelSetup.containerId:'panel';
			paymenPanel.window.baseContainteId = this.containerId;
			this.paymentsURL = this.scriptSource();
			paymentApi.paymentsURL = this.paymentsURL;
			paymenPanel.defaultCallUrl = this.paymentsURL;
			request={
					'call':'payments.getMainPaymentScreen','data':this.paymentPanelSetup
					};
			if(typeof this.paymentPanelSetup == 'string'){
				paymenPanel.mainContainers[this.paymentPanelSetup] = this.containerId;
			}
			if(this.loadArguments!=null) {
				if(this.loadArguments.length > 0){
					delete(paymentApi.loadArguments[0].token)
					request.loadArg = this.loadArguments[0];
				}
			}
			
			paymenPanel.makeRequest(request);
		},
		loadJsFile:function(u,c){        	
            a=document.createElement('script');m=document.getElementsByTagName('script')[0];
            if (a.readyState){  //IE
                a.onreadystatechange = function(){
                    if (a.readyState == "loaded" || a.readyState == "complete"){
                    	if (c && typeof(c) === "function") {
	                        a.onreadystatechange = null;
	                        c.call();
                    	}
                    }
                };
            } else {  //Others
                a.onload = function(){if(c&&typeof(c)==="function"){a.onload = c.call();}};
            }
            a.async=0;
            a.src=u;
            m.parentNode.insertBefore(a,m)
        },
		invoke:function(method,token,data){
			data.token = token;
			if(typeof this[method] == 'function') {
				this[method](data);
			}
		}
};

setTimeout(function(){
	if( typeof window.paymentPanelSetup != 'undefined' && window.paymentPanelSetup != '') {
		paymentApi.init();
	}
},0);