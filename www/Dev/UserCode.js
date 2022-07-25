//window.alert("Start");
var oIntervId_500ms;
var oIntervId_1000ms;
var oIntervId_PLC_1000ms;
var aGetConfiguredAxes;
const iMaxNumOfAxes = 3;
const sUser = "boschrexroth";
const sPassword = "boschrexroth";
var oConnectionTimeout;
const iConnectionTimeout_ms = 2000; // connection timeout in [ms]
var strIPAddress;


// the next objects can be used to request data from a web server
// get more information here: https://developer.mozilla.org/de/docs/Web/API/XMLHttpRequest
// CORE data
var RestGetToken = new XMLHttpRequest();
var RestGetCORE_CPU_Util = new XMLHttpRequest();
var RestGetCORE_CPU_Mem = new XMLHttpRequest();
var RestGetCORE_State = new XMLHttpRequest();
var RestGetMotion_State = new XMLHttpRequest();
var RestGetCORE_CPU_Util1 = new XMLHttpRequest();
var RestGetCORE_CPU_Mem1 = new XMLHttpRequest();
var RestGetCORE_State1 = new XMLHttpRequest();
var RestGetMotion_State1 = new XMLHttpRequest();
var RestClearError = new XMLHttpRequest();
var RestGetAxisConfig = new XMLHttpRequest();
// Axis data
var RestGetAxisValues_1 = new XMLHttpRequest();
var RestGetAxisValues_2 = new XMLHttpRequest();
var RestGetAxisValues_3 = new XMLHttpRequest();
var RestGetPLCOpenState_1 = new XMLHttpRequest();
var RestGetPLCOpenState_2 = new XMLHttpRequest();
var RestGetPLCOpenState_3 = new XMLHttpRequest();
//PLC Data
var RestGetbTest = new XMLHttpRequest();
var RestGetiTest = new XMLHttpRequest();
var RestGetrTest = new XMLHttpRequest();
var RestPutrTest = new XMLHttpRequest();
var RestPutiTest = new XMLHttpRequest();
var RestPutbTest = new XMLHttpRequest();
//USB Data
var RestGetUSBID_Unmount = new XMLHttpRequest();
var RestGetUSBID_Mount = new XMLHttpRequest();
var RestMountUSB = new XMLHttpRequest();
var RestUnmountUSB = new XMLHttpRequest();
var RestUSBPath = new XMLHttpRequest();
//controlling back up and restore
var RestBackupRecipe = new XMLHttpRequest();
var RestRestoreRecipe = new XMLHttpRequest();
var RestBackupApp = new XMLHttpRequest();
var RestRestoreApp = new XMLHttpRequest();
var IPaddresses = [];
var localIPAddress = '192.168.1.1';
var elementIDs = [];
var childs;
var parent;
var setID = 1;
var activeElementID;

let bLockRead = false;

var RestTest = new XMLHttpRequest(); // Test

// get IP address from textbox
var oIPAddress = document.getElementById('textBox_IP_address');

function LockRead(){
	bLockRead = true;
}

function unLockRead(){
	bLockRead = false;
}


//-------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------

// Button Connect
//var oConnect  = document.getElementById('BtnConnect');
//oConnect.addEventListener ('click', FC_Connect, true);

function FC_Connect(ipAddressConnect) {
    //location.replace("./controller.html");
    //copy ip address
	strIPAddress = ipAddressConnect;//oIPAddress.value;
    //window.alert("Executing...")
    //window.open("./controller.html");
    window.open("https://" + strIPAddress + "/your-webserver/controller.html");
 /*   var g;
    g = document.createElement("div");
    h = document.getElementById('connectionContainer');
    h.appendChild(g);
    g.innerHTML = document.getElementById('singleConnection').innerHTML;
    g.setAttribute("id", "div" + setID);
    elementIDs.push(g.id)
    console.log(g.id)
	*/
    elementIDs.push(setID)
    setID = setID + 1;
	// start connection timeout
	oConnectionTimeout = setTimeout(function(){ alert("Connection timeout!") }, iConnectionTimeout_ms);
	/*
	// hide the CORE data object on the webpage
	document.getElementById('Card_CORE_Section_1').style.display = "none";
	
	// hide the axis status on the webpage -> below the axis configuration will be read from the CORE. If a axis exist, then show the panel again.
	let iIndex;
	for (iIndex = 0; iIndex < iMaxNumOfAxes; iIndex++) {			
		// remove axis status from webpage
		let oTest  = document.getElementById('Card_Axis_' + (iIndex + 1)); 
		oTest.style.display = "none";
	} 
	*/

	// This is the first REST command to the ctrlX CORE (get security token)
	RestGetToken.open("POST", "https://" + strIPAddress + "/identity-manager/api/v1/auth/token", true);


	let json = JSON.stringify({
		"name":sUser,"password":sPassword
	});
	RestGetToken.setRequestHeader('Content-type', 'application/json');
	RestGetToken.responseType = 'json';
	
	
	// send command
	RestGetToken.send(json);
	
}; 

RestGetToken.onload = function() {
		
	if (RestGetToken.status >= 200 && RestGetToken.status < 300) { // HTTP successfull response
		
		// delete the "connection timeout"
		clearTimeout(oConnectionTimeout);
		
		//window.alert("Status = " + RestGetToken.status);
		//window.alert(RestGetToken.response);
		  
		myObj = RestGetToken.response;
		xToken = myObj.access_token;
		//window.alert(xToken);
			 
		// show the CORE data object on the webpage
		document.getElementById('Card_CORE_Section_1').style.display = "flex";
			 
		// Communication established, start a cyclic function
		// start the interval (1000ms)
        IPaddresses.push(strIPAddress);
        //for (let i = 0; i < IPaddresses.length; i++) {
        //    window.alert(IPaddresses[i])
       //}
       //window.alert(IPaddresses.length)
		oIntervId_1000ms = setInterval(ReadCOREValues, 1000);
		//oIntervId_PLC_1000ms = setInterval(ReadPLCValues, 1000);

		
		// read axis configuration
		/*RestGetAxisConfig.open("GET", "https://" + strIPAddress + "/automation/api/v1/motion/axs?type=browse", true); 
		RestGetAxisConfig.setRequestHeader('Content-type', 'application/json');
		RestGetAxisConfig.setRequestHeader('Authorization', "Bearer " + xToken);
		RestGetAxisConfig.responseType = 'json';
		RestGetAxisConfig.send();*/
			
			
		// hide the connect button
		oConnect.style.display = "none";
		// show the disconnect button
		oDisconnect.style.display = "none";
		// show the clear error button (CORE)
		oClearError.style.display = "none";
			
	}
}



// Button Disconnect
var oDisconnect  = document.getElementById('BtnDisconnect');
oDisconnect.addEventListener ('click', FC_Disconnect, true);

function FC_Disconnect() {
	// stop the interval
	stopInterval_500ms();
	//window.alert("Stop reading");
	stopInterval_1000ms();

	// hide the disconnect button
	oDisconnect.style.display = "none";
	// show the connect button
	oConnect.style.display = "inline";
	
	// hide several objects on the webpage
	document.getElementById('Card_CORE_Section_1').style.display = "none";
	
	
	let iIndex;
	for (iIndex = 0; iIndex < iMaxNumOfAxes; iIndex++) {			
		// remove axis status from webpage
		let oTest  = document.getElementById('Card_Axis_' + (iIndex + 1)); 
		oTest.style.display = "none";
	} 
	
	// hide the clear error button (CORE)
	oClearError.style.display = "none";
	
}

RestGetAxisConfig.onload  = function() {
 
	myObj = RestGetAxisConfig;
 
	if (myObj.status == 200) { // HTTP successfull response
	
		aGetConfiguredAxes = myObj.response.value;

		//window.alert(myObj.response.value);
		//window.alert(myObj.response.value[1]);
		//window.alert(myObj.response.value.length);
		
		// how many axes are configured
		if (aGetConfiguredAxes.length > 0)
		{
			// start a cyclic function
			oIntervId_500ms = setInterval(function() {ReadAxisValues(aGetConfiguredAxes);}, 500);
			
			var i;
			for (i = 0; i < aGetConfiguredAxes.length; i++) {
				// update the webpage with data from the axis status
				var oText = document.getElementById('Text_Axis_' + (i + 1));
				oText.innerHTML = aGetConfiguredAxes[i];
				
				// show axis status if a axis is configured
				var oTest  = document.getElementById('Card_Axis_' + (i + 1)); 
				oTest.style.display = "flex";
			} 
		}
		else
		{
		//	window.alert("Failure with: get the axis configuration")
		}
	
	} else { // HTTP error
	  
		// handle error
	//	window.alert("HTTPS error number: " + myObj.status);
		
	}
};




//-------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------



// Function stops the interval
function stopInterval_500ms() {
    clearInterval(oIntervId_500ms); 
}


// Function stops the interval
function stopInterval_1000ms() {
    clearInterval(oIntervId_1000ms); 
	clearInterval(oIntervId_PLC_1000ms);
}

function ReadAxisValues(aAxes){
	
	// execute several REST commands
	//window.alert(aAxes);

	if (aAxes == undefined)
	{
	//	window.alert("no axis configured");
		stopInterval_500ms()
	}
	else if (aAxes.length > 0)
	{
		
		RestGetAxisValues_1.open("GET", "https://" + strIPAddress + "/automation/api/v1/motion/axs/" + aAxes[0] + "/state/values/actual", true);
		RestGetAxisValues_1.setRequestHeader('Content-type', 'application/json');
		RestGetAxisValues_1.setRequestHeader('Authorization', "Bearer " + xToken);
		RestGetAxisValues_1.responseType = 'json';
		RestGetAxisValues_1.send();
	
	
		RestGetPLCOpenState_1.open("GET", "https://" + strIPAddress + "/automation/api/v1/motion/axs/" + aAxes[0] + "/state/opstate/plcopen", true);
		RestGetPLCOpenState_1.setRequestHeader('Content-type', 'application/json');
		RestGetPLCOpenState_1.setRequestHeader('Authorization', "Bearer " + xToken);
		RestGetPLCOpenState_1.responseType = 'json';
		RestGetPLCOpenState_1.send();
		
		if (aAxes.length > 1)
		{
			RestGetAxisValues_2.open("GET", "https://" + strIPAddress + "/automation/api/v1/motion/axs/" + aAxes[1] + "/state/values/actual", true);
			RestGetAxisValues_2.setRequestHeader('Content-type', 'application/json');
			RestGetAxisValues_2.setRequestHeader('Authorization', "Bearer " + xToken);
			RestGetAxisValues_2.responseType = 'json';
			RestGetAxisValues_2.send();
			
			RestGetPLCOpenState_2.open("GET", "https://" + strIPAddress + "/automation/api/v1/motion/axs/" + aAxes[1] + "/state/opstate/plcopen", true);
			RestGetPLCOpenState_2.setRequestHeader('Content-type', 'application/json');
			RestGetPLCOpenState_2.setRequestHeader('Authorization', "Bearer " + xToken);
			RestGetPLCOpenState_2.responseType = 'json';
			RestGetPLCOpenState_2.send();
		}
		
		
		if (aAxes.length > 2)
		{
			RestGetAxisValues_3.open("GET", "https://" + strIPAddress + "/automation/api/v1/motion/axs/" + aAxes[2] + "/state/values/actual", true);
			RestGetAxisValues_3.setRequestHeader('Content-type', 'application/json');
			RestGetAxisValues_3.setRequestHeader('Authorization', "Bearer " + xToken);
			RestGetAxisValues_3.responseType = 'json';
			RestGetAxisValues_3.send();
			
			RestGetPLCOpenState_3.open("GET", "https://" + strIPAddress + "/automation/api/v1/motion/axs/" + aAxes[2] + "/state/opstate/plcopen", true);
			RestGetPLCOpenState_3.setRequestHeader('Content-type', 'application/json');
			RestGetPLCOpenState_3.setRequestHeader('Authorization', "Bearer " + xToken);
			RestGetPLCOpenState_3.responseType = 'json';
			RestGetPLCOpenState_3.send();
		}
	}

}

function ReadCOREValues(){
	
	// execute several REST commands
	for (let i = 0; i < IPaddresses.length; i++) {
        localIPAddress = IPaddresses[i];
        activeElementID = elementIDs[i];
     /*   console.log(document.getElementById(elementIDs[i]).id)
        parent = document.getElementById(elementIDs[i]);
        childs = parent.childNodes;
        parent = childs[1]
        childs = parent.childNodes;
        parent = childs[1]
        childs = parent.childNodes;
        parent = childs[9]
        childs = parent.childNodes;
        parent = childs[2]
        childs = parent.childNodes;
        console.log(childs)*/

        RestGetCORE_CPU_Util.open("GET", "https://192.168.1.1/automation/api/v1/framework/metrics/system/cpu-utilisation-percent", true); 
        RestGetCORE_CPU_Util.setRequestHeader('Content-type', 'application/json');
        RestGetCORE_CPU_Util.setRequestHeader('Authorization', "Bearer " + xToken);
        RestGetCORE_CPU_Util.responseType = 'json';
        RestGetCORE_CPU_Util.send();
        
        RestGetCORE_CPU_Mem.open("GET", "https://192.168.1.1/automation/api/v1/framework/metrics/system/memused-percent", true); 
        RestGetCORE_CPU_Mem.setRequestHeader('Content-type', 'application/json');
        RestGetCORE_CPU_Mem.setRequestHeader('Authorization', "Bearer " + xToken);
        RestGetCORE_CPU_Mem.responseType = 'json';
        RestGetCORE_CPU_Mem.send();
        
        RestGetCORE_State.open("GET", "https://192.168.1.1/automation/api/v1/framework/state", true); 
        RestGetCORE_State.setRequestHeader('Content-type', 'application/json');
        RestGetCORE_State.setRequestHeader('Authorization', "Bearer " + xToken);
        RestGetCORE_State.responseType = 'json';
        RestGetCORE_State.send();
        
        RestGetMotion_State.open("GET", "https://192.168.1.1/automation/api/v1/motion/state/opstate", true); 
        RestGetMotion_State.setRequestHeader('Content-type', 'application/json');
        RestGetMotion_State.setRequestHeader('Authorization', "Bearer " + xToken);
        RestGetMotion_State.responseType = 'json';
        RestGetMotion_State.send();

        RestGetCORE_CPU_Util1.open("GET", "https://192.168.1.2/automation/api/v1/framework/metrics/system/cpu-utilisation-percent", true); 
        RestGetCORE_CPU_Util1.setRequestHeader('Content-type', 'application/json');
        RestGetCORE_CPU_Util1.setRequestHeader('Authorization', "Bearer " + xToken);
        RestGetCORE_CPU_Util1.responseType = 'json';
        RestGetCORE_CPU_Util1.send();
        
        RestGetCORE_CPU_Mem1.open("GET", "https://192.168.1.2/automation/api/v1/framework/metrics/system/memused-percent", true); 
        RestGetCORE_CPU_Mem1.setRequestHeader('Content-type', 'application/json');
        RestGetCORE_CPU_Mem1.setRequestHeader('Authorization', "Bearer " + xToken);
        RestGetCORE_CPU_Mem1.responseType = 'json';
        RestGetCORE_CPU_Mem1.send();
        
        RestGetCORE_State1.open("GET", "https://192.168.1.2/automation/api/v1/framework/state", true); 
        RestGetCORE_State1.setRequestHeader('Content-type', 'application/json');
        RestGetCORE_State1.setRequestHeader('Authorization', "Bearer " + xToken);
        RestGetCORE_State1.responseType = 'json';
        RestGetCORE_State1.send();
        
        RestGetMotion_State1.open("GET", "https://192.168.1.2/automation/api/v1/motion/state/opstate", true); 
        RestGetMotion_State1.setRequestHeader('Content-type', 'application/json');
        RestGetMotion_State1.setRequestHeader('Authorization', "Bearer " + xToken);
        RestGetMotion_State1.responseType = 'json';
        RestGetMotion_State1.send();
    }
	
}




RestGetCORE_CPU_Util.onload  = function() {
 
  // copy response object
  myObj = RestGetCORE_CPU_Util;
 
  if (myObj.status == 200) { // HTTP successfull response

	// window.alert(myObj);
	
	// update the webpage with data from the CORE
	let oActualCPUUtilisation = document.getElementById('Status_CPU_UtilisationPercent1'); 
	oActualCPUUtilisation.innerHTML = myObj.response.value + " %";
  
  } else { // HTTP error
  
    // handle error
   // window.alert("Could not read data from CORE: HTTPS ERROR NUMBER: " + myObj.status);
	//stopInterval_1000ms();
    // window.alert("Failure: 1");
  }
};

RestGetCORE_CPU_Util1.onload  = function() {
 
  // copy response object
  myObj = RestGetCORE_CPU_Util1;
 
  if (myObj.status == 200) { // HTTP successfull response

	// window.alert(myObj);
	
	// update the webpage with data from the CORE
	let oActualCPUUtilisation = document.getElementById('Status_CPU_UtilisationPercent2'); 
	oActualCPUUtilisation.innerHTML = myObj.response.value + " %";
  
  } else { // HTTP error
  
    // handle error
   // window.alert("Could not read data from CORE: HTTPS ERROR NUMBER: " + myObj.status);
	//stopInterval_1000ms();
    // window.alert("Failure: 1");
  }
};


RestGetCORE_CPU_Mem.onload  = function() {
	
  // copy response object
  myObj = RestGetCORE_CPU_Mem;
 
  if (myObj.status == 200) { // HTTP successfull response
	
	// window.alert(myObj);
	
	// update the webpage with data from the CORE
	let oActualCPUMemUsed  = document.getElementById('Status_CPU_MemoryUsedPercent1'); 
	oActualCPUMemUsed.innerHTML = myObj.response.value + " %";
  
  } else { // HTTP error
  
    // handle error
    window.alert("Could not read data from CORE: HTTPS ERROR NUMBER: " + myObj.status);
	stopInterval_1000ms();
  }
};

RestGetCORE_CPU_Mem1.onload  = function() {
	
  // copy response object
  myObj = RestGetCORE_CPU_Mem1;
 
  if (myObj.status == 200) { // HTTP successfull response
	
	// window.alert(myObj);
	
	// update the webpage with data from the CORE
	let oActualCPUMemUsed  = document.getElementById('Status_CPU_MemoryUsedPercent2'); 
	oActualCPUMemUsed.innerHTML = myObj.response.value + " %";
  
  } else { // HTTP error
  
    // handle error
    //window.alert("Could not read data from CORE: HTTPS ERROR NUMBER: " + myObj.status);
	//stopInterval_1000ms();
  }
};


RestGetCORE_State.onload  = function() {
 
 // copy response object
  myObj = RestGetCORE_State;
 
  if (myObj.status == 200) { // HTTP successfull response
	
	// window.alert(myObj);
	
	// update the webpage with data from the CORE
	let oActualCPUState  = document.getElementById('Status_CORE_State' + activeElementID); 
	oActualCPUState.innerHTML = myObj.response.state;
  
  } else { // HTTP error
  
    // handle error
    //window.alert("Could not read data from CORE: HTTPS ERROR NUMBER: " + myObj.status);
	//stopInterval_1000ms();
  }
};


RestGetMotion_State.onload  = function() {
 
  // copy response object
  myObj = RestGetMotion_State;
 
  if (myObj.status == 200) { // HTTP successfull response
	
	// window.alert(myObj);
	
	// update the webpage with data from the CORE
	let oActualMotionState  = document.getElementById('Status_Motion_State1'); 
	oActualMotionState.innerHTML = myObj.response.value;
  
  } else { // HTTP error
     let oActualMotionState  = document.getElementById('Status_Motion_State1'); 
     oActualMotionState.innerHTML = "N/A";
    // handle error
    //window.alert("Could not read data from CORE: HTTPS ERROR NUMBER: " + myObj.status + "  -> perhaps no motion app is installed");
	//stopInterval_1000ms();
  }
};


RestGetMotion_State1.onload  = function() {
 
  // copy response object
  myObj = RestGetMotion_State1;
 
  if (myObj.status == 200) { // HTTP successfull response
	
	// window.alert(myObj);
	
	// update the webpage with data from the CORE
	let oActualMotionState  = document.getElementById('Status_Motion_State2'); 
	oActualMotionState.innerHTML = myObj.response.value;
  
  } else { // HTTP error
     let oActualMotionState  = document.getElementById('Status_Motion_State2'); 
     oActualMotionState.innerHTML = "N/A";
    // handle error
    //window.alert("Could not read data from CORE: HTTPS ERROR NUMBER: " + myObj.status + "  -> perhaps no motion app is installed");
	//stopInterval_1000ms();
  }
};



// Button ClearError -> CORE
var oClearError  = document.getElementById('BtnClearError');
oClearError.addEventListener ('click', function() {FC_ClearError(0);});

// Button ClearError -> DRIVE 1
var oClearError_Drives1  = document.getElementById('BtnClearErrorAxis_1');
oClearError_Drives1.addEventListener ('click', function() {FC_ClearError(1);});

// Button ClearError -> DRIVE 2
var oClearError_Drives2  = document.getElementById('BtnClearErrorAxis_2');
oClearError_Drives2.addEventListener ('click', function() {FC_ClearError(2);});

// Button ClearError -> DRIVE 3
var oClearError_Drives3  = document.getElementById('BtnClearErrorAxis_3');
oClearError_Drives3.addEventListener ('click', function() {FC_ClearError(3);});


function FC_ClearError(iDevice) {
	
	// window.alert("Function ClearError);
	
	if (xToken != "") {
		
		if (iDevice == 1){ // Drive 1
			RestClearError.open("POST", "https://" + strIPAddress + "/automation/api/v1.0/motion/axs/AxisX/cmd/reset", true);
			
		} else if (iDevice == 2){ // Drive 2
			RestClearError.open("POST", "https://" + strIPAddress + "/automation/api/v1.0/motion/axs/AxisY/cmd/reset", true);
			
		} else if (iDevice == 3){ // Drive 3
			RestClearError.open("POST", "https://" + strIPAddress + "/automation/api/v1.0/motion/axs/AxisZ/cmd/reset", true);
			
		} else {	// CORE
			RestClearError.open("PUT", "https://" + strIPAddress + "/automation/api/v1.0/diagnosis/clear/error", true); // PUT must be used for this command
		}
		
		// complete the http protocol
		RestClearError.setRequestHeader('Content-type', 'application/json');
		RestClearError.setRequestHeader('Authorization', "Bearer " + xToken);
		RestClearError.responseType = 'json';
		RestClearError.send();
	}
}


RestClearError.onload  = function() {

	if (RestClearError.status == 200) { // HTTP successfull response
	  
	  // window.alert("Function ClearError successfull");
	
	} else { // HTTP error
	  // handle error
//	  window.alert("HTTPS error number: " + RestClearError.status);
	}
};






// ----------------------------------------------------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------------------------------------------------
var oTest  = document.getElementById('BtnFunctionTest');
oTest.addEventListener ('click', FC_Test, true);

function FC_Test() {
	
//	RestTest.open("GET", "https://" + strIPAddress + "/automation/api/v1/motion/axs?type=browse", true); 
//	RestTest.setRequestHeader('Content-type', 'application/json');
//	RestTest.setRequestHeader('Authorization', "Bearer " + xToken);
//	RestTest.responseType = 'json';
//	RestTest.send();
	
	// window.alert("Test");

}


RestTest.onload  = function() {
 
	myObj = RestTest;
 
	if (myObj.status == 200) { // HTTP successfull response

	//	window.alert(myObj.response.value);
		// window.alert(myObj.response.value[0]);
		// window.alert(myObj.response.value[4]);
		// window.alert(myObj.response.value[5]);
		// window.alert(myObj.response.value.length);
		
		// update the webpage with data from...
		//var ActualMotionState  = document.getElementById('Status_Motion_State'); 
		//ActualMotionState.innerHTML = myObj;
	  
	} else { // HTTP error
	  
		// handle error
	//	window.alert("HTTPS error number: " + myObj.status);
		
	}
};










