/**
 *  main.js
 *
 *  Original Template Created by Junichi Kitano on 2013/05/15.
 * 
 *  Copyright (c) 2013, Fixstars Corporation
 *  All rights reserved.
 *  Released under the BSD 2-Clause license.
 *   http://flashair-developers.com/documents/license.html

 # Version 0.1

 # Copyright (c) 2014, jake (at) allaboutjake (dot) com
 # All rights reserved.

 # Redistribution and use in source and binary forms, with or without
 # modification, are permitted provided that the following conditions are met:
 #     * Redistributions of source code must retain the above copyright
 #       notice, this list of conditions and the following disclaimer.
 #     * Redistributions in binary form must reproduce the above copyright
 #       notice, this list of conditions and the following disclaimer in the
 #       documentation and/or other materials provided with the distribution.
 #     * The name of the author and/or copyright holder nor the
 #       names of its contributors may be used to endorse or promote products
 #       derived from this software without specific prior written permission.
 # 
 # THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 # ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 # WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 # DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, AUTHOR, OR ANY CONTRIBUTORS
 # BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 # CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE 
 # GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) 
 # HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 # LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT 
 # OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
 # - You should understand what you are doing.  This software is not intended
 #   as turn-key, reliable solution.  You should engineer your own solution, 
 #   which may wind up being better, safer, and more reliable than mine.
 # - **Proceed at your own risk**. You've been warned.  If you **break your bot**, 
 #   **burn your house down**, or **injure yourself or others**, **I take no 
 #   responsibility**.

*/
// JavaScript Document

var firmwareCapabilities;

/* Cookie code from http://www.w3schools.com/js/js_cookies.asp */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

/* The following function will convert a file name into a valid
 8.3 file name. This only is necessary on v1.0 FlashAir cards. */
function get83name(longName) {
	var   n  = longName.lastIndexOf(".");
    var ext  = (n == -1) ? "" : longName.substr(n + 1);
	var name = (n == -1) ? longName : longName.substr(0, n);
	
	name = name.replace(/[ .]/gi,"");
	name = name.replace(/[^A-Za-z0-9]/gi,"_").toUpperCase();
	ext  = ext.replace(/[^A-Za-z0-9]/gi,"_").toUpperCase();
	if (ext.length > 3) {
		ext = ext.substr(0,3);
	}
	if (name.length > 8) {
		name = name.substr(0,8);
	}
	return name + "." + ext;
}

/* The firmware capabilities object probes the card for the firmware version. The firmware
   version will be cached in a cookie to make subsequent access faster.
 */
function FirmwareCapabilities() {
	var FIRMWARE_UNKNOWN = 9999;
	var firmwareVersion  = FIRMWARE_UNKNOWN;

	function parseFirmwareString(str) {
		if (str.indexOf("F24") == 0) {
			// Version 1 card
			return 1;
		} else if (str.indexOf("F19") == 0) {
			// Version 2 card
			return 2;
		} else if (str.indexOf("FA9") == 0) {
			// Version 3 card
			return 3;
		} else {
			// Unknown card version
			return FIRMWARE_UNKNOWN;
		}
	}
	
	function probeFlashAir() {
		/* Reference: https://flashair-developers.com/en/documents/api/commandcgi/#108 */
		$.ajax({url: "command.cgi?op=108", 
			type:"GET",
			success: function (data, textStatus, jqXHR) {
				console.log("Card firmware version probe result " + data);
				firmwareVersion = parseFirmwareString(data);
				setCookie("firmware", data, 365);
			},
			error: function () {setStatus("Cannot get FlashAir version", "error");}
		});
	}
	
	this.supportsLongFileNames = function() {
		return firmwareVersion > 1;
	}
	
	this.validateFileName = function(filename) {
		return this.supportsLongFileNames() ? filename : get83name(filename);
	}
	
	var firmwareString = getCookie("firmware");
	if (firmwareString!="") {
        firmwareVersion = parseFirmwareString(firmwareString);
		console.log("Using cached firmware version " + firmwareVersion);
    } else {
		probeFlashAir();
	}
	setStatus("FlashAir v" + firmwareVersion + " detected");
}

function reloadFileList(async) {
	$.ajax({
		url: document.URL,
		success: function(data) {
			var pageData = $.parseHTML(data, null, true);
			$.each(pageData, function(index) {
				if (this.id == "filelist") {
					var script = this.innerHTML;
					window.eval(script);
					if ( isV1(wlansd) ) {
						convertFileList(wlansd);
					}
				    wlansd.sort(cmptime);
				    showFileList(location.pathname);
				}	
			});
		},
		type: 'get',
		dataType: 'html',
		async: async,
	});
}

function deleteFile(filename) {
	url = "/upload.cgi?DEL="+filename
	$.ajax({url: url, 
			type:"GET",
			success: function (data, textStatus, jqXHR) {
						if (data.indexOf("SUCCESS") == -1) {
							//we have a failure
							alert("Delete failed");
						} else {							
							reloadFileList(true);
						}
					},
		});
}

// Judge the card is V1 or V2.
function isV1(wlansd) {
	if ( wlansd.length == undefined || wlansd.length == 0 ) {
		// List is empty so the card version is not detectable. Assumes as V2.
		return false;
	} else if ( wlansd[0].length != undefined ) {
		// Each row in the list is array. V1.
		return true;
	} else {
		// Otherwise V2.
		return false;
	}
}

// Convert data format from V1 to V2.
function convertFileList(wlansd) {
	for (var i = 0; i < wlansd.length; i++) {
		var elements = wlansd[i].split(",");
		wlansd[i] = new Array();
		wlansd[i]["r_uri"] = elements[0];
		wlansd[i]["fname"] = elements[1];
		wlansd[i]["fsize"] = Number(elements[2]);
		wlansd[i]["attr"]  = Number(elements[3]);
		wlansd[i]["fdate"] = Number(elements[4]);
		wlansd[i]["ftime"] = Number(elements[5]);
	}
}
// Callback Function for sort()
function cmptime(a, b) {
    if( a["fdate"] == b["fdate"] ) {
        return a["ftime"] - b["ftime"];
    }else{
        return a["fdate"] - b["fdate"];
    }
}

// Show file list
function showFileList(path) {	
	// Clear box.
	$("#list").html('');
    // Output a link to the parent directory if it is not the root directory.
    if ( path != "/" ) {
		// Make parent path
		var parentpath = path;
		if ( parentpath[parentpath.length - 1] != '/' ) {
			parentpath += '/';
		}
		parentpath += '..';
		// Make a link to the parent path.
        $("#list").append(
            $("<div class=\"file-entry\"></div>").append(
                $('<a href="' + parentpath + '" class="dir">..</a>')
            )
        );
    }
    $.each(wlansd, function() {
        var file = this;
		// Skip hidden file.
        if( file["attr"] & 0x02 ) {
            return;
        }
		// Make a link to directories and files.
        var filelink = $('<a></a>').attr('href',file["r_uri"]+'/'+file["fname"]);
		var delelink = $('<a></a>').click(function() {
				deleteFile(file["r_uri"]+'/'+file["fname"])
				return false;
			});
		var caption = file["fname"];
        var fileobj = $("<div class=\"file-entry\"></div>");
		// Append a file entry or directory to the end of the list.
        $("#list").append(
            fileobj.append(
				filelink.append(
					caption
				)		 		
			)
        );
		if( !(file["attr"] & 0x10) ) {
			filelink.append("&nbsp;").append(delelink.append("<img src='/SD_WLAN/js/delete.png' width=25 height=25 class='delete'>")) 
		}
    });     
}

function setStatus(str, className) {
	$("#status").html(str);
	if(className) {
		$("#status").attr( "class", className );
	}
}

function sendFile(file, path) {
	$.get("/upload.cgi?UPDIR="+encodeURIComponent(path));
	
	var fileName = firmwareCapabilities.validateFileName(file.name);
	
	var data = new FormData();
	data.append("file", file, fileName);	
    $.ajax({type: 'POST',
			url: '/upload.cgi',// + file.fileName,
			data: data,
			contentType: false,
			processData: false,
			success: function (data, textStatus, jqXHR) {						
						if (data.indexOf("Success") == -1) {
							//we have a failure
                            setStatus(fileName + ": <span>Upload Failed!</span>", error);
						} else {
							reloadFileList(false);
							var messageShown = false;
							$.each(wlansd, function(index, value) {
								var compareName = fileName;
								// Patch contributed by Jared Wellman to fix V1 issue.
								if (isV1(wlansd))
									compareName = fileName.toUpperCase();
								if (value['fname'] == compareName) {
									if (value['fsize'] == file.size) {
										//alert("Upload complete - file sizes match")
										setStatus(fileName + ": <span>SIZE OK!</span>", "success");
									} else {
										//alert("Upload failed - file size mismatch")
										setStatus(fileName + ": <span>BAD SIZE!</span>", "error");
									}
									messageShown = true;
									return false;
								}
							});
							if (!messageShown) setStatus(fileName + ": <span>Something went wrong</span>", "error");
						}
					},
		    xhr: function(){
		        	// get the native XmlHttpRequest object
					var xhr = $.ajaxSettings.xhr() ;
					// set the onprogress event handler
					xhr.upload.onprogress = function(evt){ 
						setStatus(fileName + ": " + (evt.loaded/evt.total*100).toFixed(1) + "%", "progress");			
					};
					// set the onload event handler
					xhr.upload.onload = function(){ 
						setStatus(fileName + ": " + "DONE!", "normal");
					};
	
    				// return the customized object
					return xhr ;
				}
  		  });
}

// Document Ready
$(function() {
	
	firmwareCapabilities = new FirmwareCapabilities();
	
	if ( isV1(wlansd) ) {
		convertFileList(wlansd);
	}
    wlansd.sort(cmptime);
	if(wlansd.length) {
		showFileList(location.pathname);
	}
	$("#footer").append(new Date());
	// grab your file object from a file input
	$('#file').change(function () {
	  sendFile(this.files[0], location.pathname);
	});
	
	$('html').on('dragover', function (e) { 
		e.preventDefault(); 
		e.stopPropagation(); 
		// if (!$('html').hasClass("shadow")) { 
		// 	$('html').addClass('shadow'); } 
		});
	$('html').on('dragenter', function (e) { e.preventDefault(); e.stopPropagation(); $('html').addClass('shadow'); });	
	$('html').on('dragleave', function (e) { e.preventDefault(); e.stopPropagation(); $('html').removeClass('shadow'); });	
	$('html').on('drop', function (e) {
	  e.preventDefault();
	  $('html').removeClass('shadow'); 
	  sendFile(e.originalEvent.dataTransfer.files[0], location.pathname);
	});
	
});
