var files = [];
var request;
var inputFile = document.getElementById('input-file');
var dropZone = document.getElementById('drop-zone');
var progressBar = document.getElementById("upload-progress-bar");
var submitBtn = document.getElementById('submit-upload-button');
var resetBtn = document.getElementById('reset-upload-button');
var abortBtn = document.getElementById('abort-upload-button');
submitBtn.disabled = true;
resetBtn.disabled = true;
abortBtn.disabled = true;

function fileSelect(evt) {

	evt.stopPropagation();
	evt.preventDefault();

	var evtFiles;
	if (evt.target.files) {
		evtFiles = evt.target.files;
	} else if (evt.dataTransfer.files) {
		evtFiles = evt.dataTransfer.files;
	} else {
		return false;
	}

	for (var i = 0; i < evtFiles.length; i++) {
		// Only process image files:
		if (evtFiles[i].type.match('image.*')) {
			files.push(evtFiles[i]);
		}
	}
	
	if(files.length < 1){
		return false;
	}
	submitBtn.disabled = false;
	resetBtn.disabled = false;

	var ftb = document.getElementById('file-table-body');
	ftb.innerHTML = "";

	for (var i = 0; i < files.length; i++) {
		var f = files[i];
		var fName = f.name;
		var fType = f.type;
		// file size from bytes to KB:
		var fSize = (f.size / 1000).toFixed(2);
		var fLastMod = f.lastModifiedDate.toLocaleDateString();

		var reader = new FileReader();
		reader.onload = function(e) {

			var src = e.target.result;
			//var tableRow = '<tr><th>'+imgEl+'</th><th>'+fName+'</th><th>'+fType+'</th><th>'+fSize+' KB</th><th>'+fLastMod+'</th></tr>';
			//ftb.insertAdjacentHTML('beforeend', tableRow);

			prototype({
				'template' : '.file-row-prototype',
				'selectors' : ['src', 'name', 'type', 'size', 'lastMod'],
				'values' : [src, fName, fType, fSize, fLastMod],
				//				'selectors' : ['name','type','size','lastMod'],
				//				'values' : [fName,fType,fSize,fLastMod],
				'targets' : '#file-table-body'
			});
		};
		reader.readAsDataURL(f);
	}

};

function fileDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy';
};

function abort(){
	if(request){
		request.abort();
	}
};

function reset(){
	files = [];
    progressBar.style.width = 0;
    progressBar.innerHTML = ""; 
	submitBtn.textContent = "Upload";
	submitBtn.disabled = true;
	resetBtn.disabled = true;
	document.getElementById('file-table-body').innerHTML = "";
};

function progress(e){  
    if (e.lengthComputable) {
    	percLoaded = Math.round(e.loaded / e.total * 100) + "%";
    	progressBar.style.width = percLoaded;
    	progressBar.innerHTML = percLoaded; 
        submitBtn.textContent = percLoaded;
    }  
};

function upload(e) {
	e.preventDefault();
	
	submitBtn.disabled = true;
	resetBtn.disabled = true;

	if (!files || files.length === 0) {
		console.log('no files to upload');
		return false;
	}

	var formdata = new FormData();
	for (var i = 0; i < files.length; i++) {
		var f = files[i];
		if (f.type.match('image.*')) {
			formdata.append('files[]', f);
		}
	}

	request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		//if (request.readyState == 4) {
		try {
			var resp = JSON.parse(request.response);
			console.log(request.response);
		} catch (e) {
			var resp = {
				status : 'error',
				data : 'Unknown error occurred: [' + request.responseText + ']'
			};
		}
		console.log(resp.status + ': ' + resp.data);
		//}
	};
	
	request.onloadend = function(e){
		console.log(e.target.response);
	};

	request.upload.addEventListener("progress", progress, false);
	request.open("POST", "gallery/fileUpload.php", true);
	request.send(formdata);
};


var form = document.getElementById('image-upload-form');
form.reset();
form.onsubmit = upload;

abortBtn.onclick = abort

resetBtn.onclick = reset;

inputFile.onchange = fileSelect;
//inputFile.addEventListener('change', fileSelect, false);

dropZone.addEventListener('dragover', fileDragOver, false);
dropZone.addEventListener('drop', fileSelect, false);
