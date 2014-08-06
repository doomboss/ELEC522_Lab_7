// Variables for HTML elements
document.body.style.backgroundColor="#8C858B";
var canvas, context, meterBar, tempValTxt;
var intervalTimer;

// Drawing Area
var	canvasWidth, canvasHeight;
var canvasBkGndColor = "#98B5E2"; // Red-Green-Blue color in hex RRGGBB, 00=Black, FF=White
var temperature = 0;
var beginX=20, beginY=275, counterX = 0;
var delaySec = 1000;
document.getElementById("timerBox").value = delaySec;
var serverAddress = "http://127.0.0.1:8001/Lab_7_WebServices_Cho/Lab7_LV_TempSensor";
document.getElementById("serverAddress").value = serverAddress;
// Send HTTP GET request to LabView web service to return value from the sensor
function doHttpRequestForTempSensor (){
	var reqLV = new XMLHttpRequest();  // Make object to do this HTTP request
	if ("withCredentials" in reqLV) {
    // XHR for Chrome/Firefox/Opera/Safari.
		reqLV.open("get", serverAddress, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    reqLV = new XDomainRequest();
    reqLV.open("get", serverAddress);
  } else {
    // CORS not supported.
    reqLV = null;
  }
	reqLV.onreadystatechange = cbHttpReqListenerGetTempValAndPlot;
	// Make sure the next line points to real url.(on your PC) of LabView temperature sensor
	//    (the LabView program with the Slider).  To find URL, in LabView Project window, 
	//    right click on the *.vi file and select "Show Method URL"
	reqLV.open("get", serverAddress, true);			  
	reqLV.send();
}

// Initialize the program
function init(){
	// Get elements from HTML document
	canvas = document.getElementById("mainCanvas"); // Get from html doc
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;	
	context = canvas.getContext('2d');
	context.fillStyle = canvasBkGndColor;
	context.rect(0,0,canvasWidth,canvasHeight);   // Make a drawing area, and call it context
    context.fill();	// clear drawing area so only background color
	
	//hardcoding like a pro... drawing X and Y with the below code.
	context.moveTo(20,25);
	context.lineTo(20, 275);
	context.stroke();
	context.lineTo(580, 275);
	context.stroke();
	
	
/*
	meterBar 	= document.getElementById ... (complete this code, look at HTML file)
	tempValTxt 	= ...

	Write code here to draw lines for axis of graph.
	Draw axis grid lines so leave about 5% area of canvas on all sides of graph.
	Helpful to think and draw graph on paper -- consider how to scale axis lines
	   as well as data points within this graph.  A minimum value of temperature is
	   0 C and should be plotted directly on X-axis, and maximum value is 125 C which
	   should be plotted at top of graph (5% below top edge of canvas).  Think through 
	   a plan of how to mathematically do all of this.
*/
	   
	// Setup timer, so will periodically get new temperature value from the LabView program.
	intervalTimer = setInterval( doHttpRequestForTempSensor, delaySec );  // Each 1 sec, send XMLHttpRequest to LabView for sensor value
}
 
// Plot new Temperature point on the Graph
function plotNewTempPt( newTempVal ){
		document.getElementById("meter").value = newTempVal; // set meter
		document.getElementById("tempVal").innerHTML = newTempVal; //set text below canvas
/*
	Write code to put the new value into the 1) meter, and 2) text value below the canvas
	
	Write code to draw a line from the prior point to this new point.
	   The Y-value relates to the temperature value.
	   The X-value relates to time.  Make a counter keep track of how many data
	   points are obtained from the LabView program, and move X-value accordingly.
	   
	if( Put Condition Here So Know When Graph is Completed )  // Quit reading new pts if plot done
		clearInterval( intervalTimer );
*/
}

// Find value string from HTTP response XML text.  Pass in string variables.
//   msg is HTTP response XML text
//   varName is variable Name as a string
function findValueInResponseXML(msg, varName){
	console.log("In func msg is " + msg);
	console.log("In func varName is " + varName);
	
	var s1 = msg.slice( msg.indexOf( varName ) );
	console.log("In func s1 is " + s1);
	var sV0 = "<Value>";
	var sV1 = "</Value>";
	return( s1.slice( (s1.indexOf(sV0)) + (sV0.length), s1.indexOf(sV1) ) );
}

// Make call back function for the XMLHttpRequest
function cbHttpReqListenerGetTempValAndPlot () {
	console.log("For HTTP request, the readyState is " + this.readyState);
	
	if( this.readyState == 4 ){
		console.log("HTTP request completed.  Response text is below.");
		var msg = this.responseText;
		console.log( msg );
		var newValAsStrg = findValueInResponseXML(msg, "Temperature Slider Value");
		var newTempVal = Number( newValAsStrg ).toFixed(2);
		console.log("The new Temp Value is " + newTempVal );
		
		//the plotting part, plot every 1 second
		context.moveTo(beginX, beginY); //move pointer, have to do this or it wont draw correctly...
		beginX+=5; //always move 5 pixels in X axis
		beginY=275 - (newTempVal*2); //275 is the lowest Y position it can get, therefore use it to minus the temperature to get correct Y position
		context.lineTo(beginX, beginY); //drawing from original position to new position.
		//Drawing line 
		context.lineTo(beginX, 275);
		context.moveTo(beginX, beginY);
		//
		counterX++; //dummy counter, not using but it is counting!!
		context.stroke();
		//plotting part
		if(beginX >=575) //575 is the maximum X position it can go, set if statement to prevent going over position.
			clearInterval(intervalTimer);
		plotNewTempPt( newTempVal );
	}
}
function setTimer(){ //used for onclick function for the timerBox
	delaySec =  prompt("Enter the timer for extracting data delay", delaySec);
	if(delaySec == null|| delaySec == ""){
		alert("Set to 1000ms by default!!");
		delaySec = 1000;
	}
	else if(delaySec <1000){
		alert("Too fast... set to 1000ms by default!!");
		delaySec = 1000;
	}
	document.getElementById("timerBox").value = delaySec;
	clearInterval(intervalTimer);
	intervalTimer = setInterval( doHttpRequestForTempSensor, delaySec );  // send XMLHttpRequest to LabView for sensor value with whatever value is in delaySec
}

function setAddress(){ //onclick function for the setAddress in HTML.
	serverAddress =  prompt("Enter the server address", serverAddress);
	if(serverAddress == null|| serverAddress == ""){
		alert("Set to default!!");
		serverAddress = "http://127.0.0.1:8001/Lab_7_WebServices_Cho/Lab7_LV_TempSensor";
	}
	document.getElementById("serverAddress").value = serverAddress;
	init();
}


// Call init function when the web page window is finished loading
window.onload = init;
