

// Grid data structure

var Grid = function(){

	var _nodes = new Array();

	var _path = new Array();

	var _grid = {
	
		setNode: function(ids){

			if (typeof ids == 'string'){
				_nodes[ids] = ids;
				if (_path[ids]==null){
					_path[ids] = [];
				}
				
			}
			else if (typeof ids == 'object' && ids.constructor===Array){
				for(var i in ids){
					_grid.setNode(ids[i]);
				}
			}

			return _grid;
		},

		getNode: function(id){

			if (typeof id == 'string'){
				return _nodes[id];
			}
			else{
				return _nodes;
			}

		},

		setPath: function(args){

			if (typeof args[0] == 'string'){
				
				var node1 = args[0];
				var node2 = args[1];
				var weight = args[2];

				if (_nodes[node1]==null){
					_grid.setNode(node1);
				}

				if (_nodes[node2]==null){
					_grid.setNode(node2);
				}

				if (weight!=null){
					_path[node1][node2] = _path[node2][node1] = weight;
				}

			}
			else if (typeof args[0] == 'object' && args[0].constructor===Array){
				for (var i in args){
					_grid.setPath(args[i]);
				}
			}

			return _grid;

		},

		getPath: function(node1, node2){
			
			if (typeof node1 == 'string' && typeof node2 == 'string'){
				if (_path[node1][node2]!==null&&_path[node2][node1]!==null&&_path[node1][node2]==_path[node2][node1]){
					return _path[node1][node2];
				}
			}
			else{
				return _path;
			}
		}
	};

	return _grid;

};



// dijkstra algorithm  

var Dijkstra = function(source){

	var grid = source;

	var snodes = [];
	var unodes = [];
	
	var grid_nodes = grid.getNode();
	for (var i in grid_nodes) {
		unodes.push(grid_nodes[i]);
	}

	var _in_array = function(item, arr){
		var isin = false;
		for (var i in arr){
			if (item == arr[i]){
				isin = true;
				break;
			}
		}
		return isin;
	};

	var dijkstra = {
		
		start: function(startNode){
			
			snodes.push(startNode);
			var s_idx = startNode;

			var MIN_PATH = new Array();
			var PATHES = new Array();

			var path = { len:0, step:[] };
			var restep_offset = 0;
			
			path.step.push(s_idx);

			while (unodes.length>0) {

				var min = { target:null, weight:Number.POSITIVE_INFINITY };
				var temp = [];

				while (unodes.length>0) {

					var u_idx = unodes.pop();
					temp.push(u_idx);

					if (_in_array(u_idx, snodes)){
						continue;
					}

					var su_edge = grid.getPath(s_idx, u_idx);

					if (su_edge != null){
			
						if (su_edge < min.weight){
							min.weight = su_edge;
							min.target = u_idx;
						}

						var loop_min = null;
						var loop_path = null;
						
						if (MIN_PATH[s_idx] < path.len){
							loop_min = MIN_PATH[s_idx] + su_edge;
							loop_path = PATHES[s_idx].concat(u_idx);
						}
						else{
							loop_min = path.len + su_edge;
							loop_path = path.step.concat(u_idx);
						}

						if (MIN_PATH[u_idx]!=null && MIN_PATH[u_idx] < loop_min){
							loop_min = MIN_PATH[u_idx];
							loop_path = PATHES[u_idx];
						}

						MIN_PATH[u_idx] = loop_min;
						PATHES[u_idx] = loop_path;

					}
					
				}
				
				if (min.target!=null){
					s_idx = min.target;
					path.len += min.weight;
					path.step.push(s_idx);
					snodes.push(s_idx);

					restep_offset = 0;
				}
				else {
					s_idx = snodes[restep_offset++];
					path.len = 0;
					path.step = PATHES[s_idx];
				}

				console.log(snodes);

				while (temp.length>0){
					var tmp_idx = temp.pop();
					if (tmp_idx != s_idx){
						unodes.push(tmp_idx);
					}
				}
			}

			console.log(MIN_PATH);
			console.log(PATHES);
		}

	};

	return dijkstra;
	
};


// instance of dijkstra

var grid = new Grid();

grid.setPath([['A','B',6],['A','C',3],['B','C',2],['B','D',5],['C','D',3],['D','F',3],['C','E',4],['E','F',5],['D','E',2]]);
//grid.setPath([['a','b',3],['b','c',2],['c','d',5],['d','e',4],['e','f',5],['d','f',3],['c','f',4],['f','g',7],['g','h',9],['h','l',2],['f','l',6],['c','l',3],['l','i',7],['i','j',3],['j','k',4],['k','l',5],['k','c',3]]);


var dijkstra = new Dijkstra(grid);

dijkstra.start('A');
