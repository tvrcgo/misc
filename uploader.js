
function DragController(id, mode) {

  var el_ = (typeof id === "string") ? document.getElementById(id) : id;
  var self = this;

  mode = mode||"bin";

  this.dragenter = function(e) {
    e.stopPropagation();
    e.preventDefault();
  };

  this.dragover = function(e) {
    e.stopPropagation();
    e.preventDefault();
  };

  this.dragleave = function(e) {
    e.stopPropagation();
    e.preventDefault();
  };

  this.drop = function(e) {
  
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    for (var i = 0, file; file = files[i]; i++) {

      var imageType = /image(\/|\.)*/;
      if (!file.type.match(imageType)) {
        continue;
      }

      var reader = new FileReader();
	  reader.srcFile = file;

      reader.onerror = function(evt) {
         var msg = 'Error ' + evt.target.error.code;
         switch (evt.target.error.code) {
           case FileError.NOT_READABLE_ERR:
             msg += ': NOT_READABLE_ERR';
             break;
         };
         alert(msg);
      };

      reader.onload = self.onload||function(e){};
	  reader.onprogress = self.onprogress||function(e){};

	  if (mode==='bin'){
		reader.readAsBinaryString(file);
	  }
	  else {
		reader.readAsDataURL(file);
	  }
	  
    }

    return false;
  };

  el_.addEventListener("dragenter", this.dragenter, false);
  el_.addEventListener("dragover", this.dragover, false);
  el_.addEventListener("dragleave", this.dragleave, false);
  el_.addEventListener("drop", this.drop, false);
};

XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
	function byteValue(x) {
		return x.charCodeAt(0) & 0xff;
	}
	var ords = Array.prototype.map.call(datastr, byteValue);
	var ui8a = new Uint8Array(ords);
	this.send(ui8a.buffer)
};

FileReader = FileReader||{};
FileReader.prototype.srcFile = null;

function FileUploader(upload_path){
	
	var self = this;

	var xhr = new XMLHttpRequest();
	xhr.open('POST', upload_path||"/upload.php", true);

	xhr.upload.addEventListener("progress", function(e) {  
		if (e.lengthComputable && self.onprogress) {  
			self.onprogress(e);
		}  
	}, false);

	xhr.upload.addEventListener("load", function(e){  
		if (self.onload) {
			self.onload(e);
		}
	}, false);

	self.upload = function(fr){

		var bin = fr.result;
		var src = fr.srcFile;

		var boundary = "iwjjfklsijeklfkdjsi";
		xhr.setRequestHeader("Content-Type", "multipart/form-data, boundary="+boundary); // simulate a file MIME POST request.  
		//xhr.setRequestHeader("Content-Length", src.fileSize);

		var body = '';  
		body += "--" + boundary + "\r\n";  
		body += "Content-Disposition: form-data; name=\"upload_file\"; filename=\"" + encodeURIComponent(src.fileName) + "\"\r\n";  
		body += "Content-Type: "+src.type+"\r\n\r\n";  
		body += bin + "\r\n";  
		body += "--" + boundary + "--\r\n"; 

		xhr.sendAsBinary(body);
	};
	 
};

