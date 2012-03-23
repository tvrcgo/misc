
function xml2json(xml){

	var root = {};

	if (xml.nodeType === 1) { // element
		// TODO: Element Attributes
	}
	
	if (xml.nodeType == 3){ // TEXT
		root = xml.nodeValue;
	}

	if (xml.hasChildNodes()){
		
		var len = xml.childNodes.length;

		for (var i=0; i<len; i++){
			
			var node = xml.childNodes.item(i);

			if (typeof root[node.nodeName] == "undefined"){ 

				if (node.nodeType == 3) {
					if (node.nodeValue.replace(/[\r\n\s]/ig, "")=="") {
						continue;
					}
					else {
					    root = node.nodeValue;
						return root;
					}
					
				}
				
				root[node.nodeName] = xml2json(node);
				
			}
			else {

				if (root[node.nodeName].constructor != Array){
					var tmp = root[node.nodeName];
					root[node.nodeName] = new Array;
					root[node.nodeName].push(tmp);
				}

				root[node.nodeName].push(xml2json(node));

			}

		}

	}

	return root;
}