/*
 * Google Map Manager
 * 
 * @author: tvrcgo
 * @since:	2010.06.08
 *
**/

var GMapManager = GMM = function(args){
	
	var me = this;

	this.zoom = 4;
	this.lat = 35.86;
	this.lng = 104.19;

	this.map = null;
	this.focus = null;
	this.center = null;
	
	
	var plugin = function(target, member){
		for(var i in member){
			target[i] = member[i];
		}
	};

	var exec = function(func, args){
		if (typeof func == 'function') {
			func(args);
		}
	};

	var __overlayPool = [];

	// Event Handler
	plugin(this, function(){
	
		var __eventPool = [];
		
		return {
	
			observe: function(eventName, callback){

				if (typeof __eventPool[eventName] == 'undefined'){
					__eventPool[eventName] = [];
				}

				__eventPool[eventName].push(callback);

				return me;
			},

			abort: function(eventName, callback){

				var stack = __eventPool[eventName];

				if(stack!==undefined){
					for(var i in stack){
						if(stack[i]===callback)
							stack[i] = null;
					}
				}

				return me;
			},

			notify: function(eventName, args){
				var stack = __eventPool[eventName];
				if(stack && stack.length>0){
					for(var i in stack){
						exec(stack[i], args);
					}
				}

				return me;
			}

		};
	
	}());


	// init
	plugin(this, function(){

		var mapinit = function(){

			me.center = new GLatLng(me.lat, me.lng);

			GEvent.bind(me.map,'moveend', me, function(){
				// update center point
				me.center = me.map.getCenter();
				// notify map-moveend event
				me.notify("map-moveend", me.center);
			});

			GEvent.bind(me.map, 'mousemove', me, function(latlng){
				// notify map-mousemove event
				me.notify("map-mousemove", latlng);
			});

			GEvent.bind(me.map,'zoomend', me, function(old_zm, new_zm){
				// notify map-zoomend event
				me.zoom = new_zm;
				me.notify("map-zoomend", [old_zm, new_zm]);
			});

			GEvent.bind(me.map,'click', me, function(overlay, latlng, overlaylatlng){
				// notify map-click event
				me.notify("map-click", [overlay, latlng, overlaylatlng]);
			});

			GEvent.bind(me.map,'dblclick', me, function(overlay,latlng){
				me.notify("map-dblclick", latlng);
			});

			me.map.disableDoubleClickZoom(); //禁用双击缩放
			me.map.enableScrollWheelZoom(); //启用滚轮缩放

			me.notify("map-ready", me.map);
		};
	
		return {
		
			load: function(renderId){
				try{
					if (GBrowserIsCompatible()) {
						me.map = new GMap2(document.getElementById(renderId));
						me.map.setCenter(new GLatLng(me.lat, me.lng), me.zoom);
						
						mapinit();

						return me;
					}
				}
				catch(e){
					this.notify('map-loaderror');
				}
			}
		};

	}());

	
	// Overlay
	plugin(this, function(){
		
		var Icon = function(args){
	
			if (args===undefined||args.image===undefined) {
				return false;
			}

			var iconSize = args.iconSize||16;
			var iconAnchor = args.iconAnchor||8;

			var icon = new GIcon();
			icon.image = args.image||"";
			icon.iconSize = new GSize(iconSize,iconSize);
			icon.iconAnchor = new GPoint(iconAnchor,iconAnchor);
			icon.infoWindowAnchor = new GPoint(8,8);

			return icon;
		};

		var Overlay = function(target, args){

			this.target = target;
			
			this.args = {};
			
			for(var i in args){
				this.args[i] = args[i];
			}

			var _me = this;

			plugin(this, {
				
				show: function(){
					me.map.addOverlay(_me.target);
					return _me;
				},

				hide: function(){
					me.map.removeOverlay(_me.target);
					return _me;
				}

			});

			return this;
		};

		var toLatlngs = function(array){
			if (typeof array === 'object'&&array.constructor === Array) {
				var latlngs = [];
				for(var i=0,len=array.length; i<len; i++) {
					latlngs.push(new GLatLng(array[i][0], array[i][1]));
				}
				return latlngs;
			}
			else{
				return [];
			}
		};
		
		return {
			
			remove: function(){
				var overlay = arguments[0]||me.focus;
				if (overlay!==null)
					overlay.hide();
				return me;
			},

			clear: function(){
				me.map.clearOverlays();
				for(var i=0,len=__overlayPool.length; i<len; i++){
					__overlayPool.pop();
				}
				return me;
			},

			pan: function(){
				var latlng = new GLatLng(arguments[0]||me.lat, arguments[1]||me.lng);
				me.map.setCenter(latlng, arguments[2]||me.zoom);
			},

			getCenter: function(){
				return me.Marker({lat:me.center.lat(), lng:me.center.lng(), draggable:true});
			},
			
			// Overlays Type
			Marker: function(){
				
				var args = arguments[0]||{};

				var marker = new GMarker(new GLatLng(args.lat||me.lat,args.lng||me.lng), args||{});
				var overlay = new Overlay(marker, args);

				overlay.type = "marker";

				overlay.openInfoWindow = function(html){
					marker.openInfoWindowHtml(html||overlay.args.html);
				};

				overlay.args.lat = args.lat||me.lat;
				overlay.args.lng = args.lng||me.lng;
						
				GEvent.bind(marker,'click',me,function(latlng){
					me.focus = overlay;
					exec(args.click, latlng);
					me.notify("marker-click", [overlay, latlng]);
				});

				GEvent.bind(marker,'infowindowopen',me,function(){
					exec(args.infowindowopen, overlay);
					me.notify("marker-infowindowopen", overlay);
				});

				GEvent.bind(marker,'infowindowclose',me,function(){
					exec(args.infowindowclose, overlay);
					me.notify("marker-infowindowclose", overlay);
				});

				GEvent.bind(marker,'dragstart',me,function(latlng){
					// close infowindow before dragstart
					marker.closeInfoWindow();
					// update focus overlay
					me.focus = overlay;
					// trigger marker.dragend
					exec(args.dragstart, latlng);
					// notify marker-dragstart event
					me.notify("marker-dragstart", [overlay, latlng]);
				});

				GEvent.bind(marker,'dragend',me,function(latlng){
					// update lat,lng
					overlay.args.lat = latlng.lat();
					overlay.args.lng = latlng.lng();
					// update focus
					me.focus = overlay;
					// trigger marker.dragend
					exec(args.dragend, [overlay, latlng]);
					// notify marker-dragend event
					me.notify("marker-dragend", [overlay, latlng]);
				});

				return overlay;
			},

			Markers: function(){
			
				var latlngs = arguments[0]||[];
				var overlays = [];

				for(var i=0,len=latlngs.length; i<len; i++) {
					overlays.push(me.Marker({lat:latlngs[i][0], lng:latlngs[i][1]}));
				}

				plugin(overlays, function(){
				
					return {

						show: function(idx){

							for (var j=0,len=overlays.length; j<len; j++ ) {
								
								me.map.addOverlay(overlays[j].target);

								if (idx!==undefined&&idx!==j) {
									me.map.removeOverlay(overlays[j].target);
								}
							}

							if (idx!==undefined) {
								return overlays[idx];
							}
							else{
								return overlays;
							}

						},

						hide: function(idx){

							if (idx!==undefined&&typeof idx==='number') {
								me.map.removeOverlay(overlays[idx].target);
							}
							else{
								for (var k=0,len=overlays.length; k<len; k++) {
									me.map.removeOverlay(overlays[k].target);
								}
							}

						}

					}

				}());

				return overlays;
			},

			Polyline: function(){

				var args = arguments[0]||{};

				var polyline = new GPolyline(toLatlngs(args.latlngs)||[], args.color||"#F00", args.weight||5, args.opacity||0.8, args);
				var overlay = new Overlay(polyline, args);

				overlay.type = "polyline";

				overlay.openInfoWindow = function(latlng, html){
					me.map.openInfoWindowHtml(latlng, html);
				};

				GEvent.bind(polyline,'click', me,function(latlng){
					me.focus = overlay;
					exec(args.click, [overlay, latlng]);
					me.notify("polyline-click", [overlay, latlng]);
				});

				return overlay;
			},

			Polygon: function(){
				
				var args = arguments[0]||{};
				
				var polygon = new GPolygon(toLatlngs(args.latlngs)||[], args.strokeColor||"#F00", args.strokeWeight||3, args.strokeOpacity||0.8, args.fillColor||"#F90", args.fillOpacity||0.5, args);
				var overlay = new Overlay(polygon, args);

				overlay.type = "polygon";
				
				GEvent.bind(polygon,'click', me, function(latlng){
					me.focus = overlay;
					me.notify("polygon-click", [overlay, latlng]);
				});

				return overlay;

			}
		
		};

	}());

	// Positioning
	plugin(this, function(){
		
		return {

			positioning: function(){
				if(navigator.geolocation){
					navigator.geolocation.getCurrentPosition(function(position){
						var lat = position.coords.latitude;
						var lng = position.coords.longitude;
						var latlng = new GLatLng(lat,lng);
						me.notify('positioning', latlng);
					});
				}
			}

		};
	
	}());

};


GMM.Drawer = function(manager){

	if(manager===undefined)
		return null;

	var line;

	var last = null;

	var overlays = [];

	var map_click = function(args){
		
		var latlng = args[1]||args[2];

		// 将动态线固定
		if(last!==null)
			overlays.push(manager.Polyline({latlngs:[[last.lat(), last.lng()], [latlng.lat(), latlng.lng()]]}).show());

		last = latlng;

		// 标记折点
		overlays.push(manager.Marker({lat:latlng.lat(), lng:latlng.lng(), html:latlng.lat()+", "+latlng.lng()}).show());

	};

	var map_mousemove = function(latlng){
		
		// 删除动态线
		if(line!==undefined)
			line.hide();
		
		// 画动态线
		if(last!==null)
			line = manager.Polyline({latlngs:[[last.lat(), last.lng()], [latlng.lat(), latlng.lng()]], color:"#CCFF00"}).show();
	};

	return {

		working: false,
		
		start: function(){
			manager.observe("map-mousemove", map_mousemove);
			manager.observe("map-click", map_click);
			this.working = true;

			manager.notify('drawer-start');
		},

		stop: function(){
			if(line!==undefined)
				line.hide();
			manager.abort("map-mousemove", map_mousemove);
			manager.abort("map-click", map_click);

			this.working = false;
			last = null;

			manager.notify('drawer-stop');
		},

		toggle: function(){
		
			if (this.working) {
				this.stop();
				manager.notify('drawer-stop');
			}
			else{
				this.start();
				manager.notify('drawer-start');
			}

		},

		drawPolygon: function(){

			var latlngs = [];
			for(var i in overlays){
				if(overlays[i].type=='marker') {
					var latlng = overlays[i].target.getLatLng();
					latlngs.push([latlng.lat(), latlng.lng()]);
				}
			}

			var polygon = manager.Polygon({latlngs:latlngs}).show();
			//manager.map.addOverlay(polygon.target);
			overlays.push(polygon);
		},

		clear: function(){
			for(var i=0,len=overlays.length; i<len; i++){
				manager.map.removeOverlay(overlays[i].target);	
			}
			overlays = [];
		}
	
	};

};


GMM.ClickMarker = function(gmm){

	return {
	
		working: false,

		start: function(){},

		stop: function(){}
	};

};


