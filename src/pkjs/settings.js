"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSettings = buildSettings;
exports.saveSettings = saveSettings;
var helper_1 = require("./helper");
function buildSettings(userLat, userLng) {
    var destinations = (0, helper_1.loadDestinations)();
    var units = (0, helper_1.loadUnits)();
    var telemetry = (0, helper_1.loadTelemetryEnabled)();
    var experimental = (0, helper_1.loadExperimentalEnabled)();
    var html = '';
    html +=
        '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">';
    html += '<style>';
    html +=
        'body{font-family:sans-serif;padding:16px;background:#1a1a2e;color:#eee;max-width:400px;margin:0 auto}';
    html += 'h1{color:#4fc3f7;font-size:20px;margin:0 0 16px}';
    html +=
        '.dest{padding:8px;margin:4px 0;background:#16213e;border-radius:6px;display:flex;gap:8px}';
    html += '.dest-name{font-size:14px;flex:1;overflow-wrap:break-word;align-content: center;}';
    html +=
        '.del-btn{background:#e74c3c;border:none;color:#fff;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:14px;line-height:1;flex-shrink:0;width: 30px;align-content: center;}';
    html +=
        '.prev-btn{background:#4fc3f7;border:none;color:#1a1a2e;border-radius:4px;padding:4px 10px;cursor:pointer;font-size:12px;line-height:1;flex-shrink:1;margin-right:4px}';
    html += '.input-wrap{position:relative}';
    html +=
        'input{width:100%;padding:8px;margin:8px 0;border:1px solid #333;border-radius:4px;background:#0f3460;color:#eee;box-sizing:border-box}';
    html +=
        'button{background:#4fc3f7;color:#1a1a2e;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;font-weight:bold;width:100%}';
    html += '.empty{color:#666;text-align:center;padding:20px}';
    html +=
        '.suggestions{position:absolute;top:100%;left:0;right:0;background:#16213e;border:1px solid #333;border-radius:0 0 4px 4px;max-height:200px;overflow-y:auto;z-index:10;display:none;list-style:none;padding:0;margin:0}';
    html += '#list{list-style:none;padding:0;margin:0}';
    html += '.suggestions li{padding:8px;cursor:pointer;font-size:13px;border-bottom:1px solid #333}';
    html += '.suggestions li:hover{background:#0f3460}';
    html += '.section-title{color:#4fc3f7;font-size:14px;margin:16px 0 8px}';
    html += '.notice{font-size:11px;color:#888;padding:16px 0 0;line-height:1.5}';
    html += '.notice a{color:#4fc3f7}';
    html += '.notice strong{color:#aaa}';
    html += '</style></head><body>';
    html += '<h1>Saved Destinations</h1>';
    html += '<ul id="list"></ul>';
    html += '<div id="preview-modal" onclick="closePreview(event)" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:1000;align-items:center;justify-content:center;padding:16px">';
    html += '<div style="position:relative;width:100%;max-width:400px" onclick="event.stopPropagation()">';
    html += '<span onclick="closePreview()" style="position:absolute;top:-14px;right:-14px;background:#e74c3c;color:#fff;border:none;border-radius:50%;width:28px;height:28px;font-size:20px;cursor:pointer;text-align:center;line-height:28px;z-index:10;font-family:sans-serif">&times;</span>';
    html += '<canvas id="preview" style="width:100%;border-radius:6px;background:#0f3460"></canvas>';
    html += '</div></div>';
    html += '<div class="section-title">Add Destination</div>';
    html += '<input type="text" id="name" placeholder="Label (optional)" autocomplete="off">';
    html += '<div class="input-wrap">';
    html += '<input type="text" id="addr" placeholder="Type address or lat,lng" autocomplete="off">';
    html += '<ul id="suggestions" class="suggestions"></ul>';
    html += '</div>';
    html += '<button onclick="addDest()" style="background:#2ecc71;color:#fff">Add Destination</button>';
    html += '<button onclick="saveCurrentPos()" style="margin-top:8px">Save Current Position</button>';
    html += '<div class="section-title">Units</div>';
    html += '<div style="display:flex;gap:8px;margin:8px 0">';
    html +=
        '<label style="flex:1;text-align:center;padding:8px;background:#0f3460;border-radius:6px;cursor:pointer">';
    html +=
        '<input type="radio" name="units" value="metric"' +
            (units === 'metric' ? ' checked' : '') +
            '> km / m';
    html += '</label>';
    html +=
        '<label style="flex:1;text-align:center;padding:8px;background:#0f3460;border-radius:6px;cursor:pointer">';
    html +=
        '<input type="radio" name="units" value="imperial"' +
            (units === 'imperial' ? ' checked' : '') +
            '> mi / ft';
    html += '</label>';
    html += '</div>';
    html += '<div class="section-title">Telemetry</div>';
    html +=
        '<label style="display:flex;align-items:center;gap:8px;padding:8px;background:#0f3460;border-radius:6px;cursor:pointer;margin:8px 0">';
    html +=
        '<input type="checkbox" id="telemetry"' +
            (telemetry ? ' checked' : '') +
            '> Send anonymous usage data (logs, errors) to improve the app, no coordinates, destination, names or unique identifier are send (needs restart)';
    html += '</label>';
    html += '<div class="section-title">Experimental</div>';
    html +=
        '<label style="display:flex;align-items:center;gap:8px;padding:8px;background:#0f3460;border-radius:6px;cursor:pointer;margin:8px 0">';
    html +=
        '<input type="checkbox" id="experimental"' +
            (experimental ? ' checked' : '') +
            '> Maximize message size for faster map updates, needs app restart (may be unstable)';
    html +=
        '<div class="notice">This option tries to maximize the size of the messages sent to the watch, improving map update speed, but the behavior can lead to the app not updating at all. Sadly the emulator and real hardware behave differently. Please try this option and enable telemetry so I can make sure it works on every Pebble watch, not just my Time 2.</div>';
    html += '</label>';
    html += '<button onclick="saveAndClose()">Save & Close</button>';
    html += '<div class="section-title">Attributions</div>';
    html +=
        '<div class="notice">&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>. Map data licensed under the Open Database License (ODbL). Routing by <a href="http://project-osrm.org/" target="_blank">OSRM</a>. Geocoding by <a href="https://photon.komoot.io" target="_blank">Photon</a> (Komoot).</div>';
    html += '<script>';
    html += 'var dests = ' + JSON.stringify(destinations) + ';';
    html += 'var _userLat = ' + (userLat !== undefined ? userLat : 'undefined') + ';';
    html += 'var _userLng = ' + (userLng !== undefined ? userLng : 'undefined') + ';';
    html += 'var _hasUserPos = ' + (userLat !== undefined ? 'true' : 'false') + ';';
    html += 'function render(){var l=document.getElementById("list");';
    html +=
        'if(dests.length===0){l.innerHTML="<li class=\'empty\'>No saved destinations</li>";return}';
    html +=
        'l.innerHTML=dests.map(function(d,i){return"<li class=\'dest\'><span class=\'dest-name\'>"+(d.name||d.lat+","+d.lng)+"</span><button class=\'prev-btn\' onclick=\'preview("+i+")\'>Preview</button><button class=\'del-btn\' onclick=\'remove("+i+")\'>X</button></li>"}).join("");}';
    html += 'function remove(i){dests.splice(i,1);render();}';
    html += 'var _timer=null;';
    html +=
        'document.getElementById("addr").addEventListener("input",function(){clearTimeout(_timer);var v=this.value.trim();var sug=document.getElementById("suggestions");if(v.length<3||/^-?\\d/.test(v)){sug.style.display="none";return}_timer=setTimeout(function(){var xhr=new XMLHttpRequest();xhr.open("GET","https://photon.komoot.io/api/?q="+encodeURIComponent(v)+"&limit=7",true);xhr.onload=function(){if(xhr.status>=200&&xhr.status<300){var data=JSON.parse(xhr.responseText);if(data.features&&data.features.length){sug.innerHTML=data.features.map(function(f,i){var p=f.properties;var label=p.name+(p.city?", "+p.city:"")+(p.country?", "+p.country:"");return"<li onclick=\'pickSuggestion("+i+")\'>"+label+"</li>"}).join("");window._sugs=data.features;sug.style.display="block"}else{sug.style.display="none"}}};xhr.send()},300)});';
    html +=
        'document.getElementById("addr").addEventListener("blur",function(){setTimeout(function(){document.getElementById("suggestions").style.display="none"},200)});';
    html +=
        'function pickSuggestion(i){var f=window._sugs[i];if(!f)return;var c=f.geometry.coordinates;var nm=document.getElementById("name").value.trim()||f.properties.name;dests.push({lat:c[1],lng:c[0],name:nm});document.getElementById("addr").value="";document.getElementById("name").value="";document.getElementById("suggestions").style.display="none";window._sugs=null;render()}';
    html +=
        'function addDest(){var addr=document.getElementById("addr").value.trim();if(!addr)return;var nm=document.getElementById("name").value.trim();var parts=addr.split(",").map(function(s){return parseFloat(s.trim())});if(parts.length===2&&!isNaN(parts[0])&&!isNaN(parts[1])){dests.push({lat:parts[0],lng:parts[1],name:nm||addr});document.getElementById("addr").value="";document.getElementById("name").value="";render();return}var xhr=new XMLHttpRequest();xhr.open("GET","https://photon.komoot.io/api/?q="+encodeURIComponent(addr)+"&limit=1",true);xhr.onload=function(){if(xhr.status>=200&&xhr.status<300){var d=JSON.parse(xhr.responseText);if(d.features&&d.features.length){var c=d.features[0].geometry.coordinates;dests.push({lat:c[1],lng:c[0],name:nm||d.features[0].properties.name||addr});document.getElementById("addr").value="";document.getElementById("name").value="";render()}else{alert("Not found")}}};xhr.send()}';
    html +=
        'function saveAndClose(){var u=document.querySelector(\'input[name="units"]:checked\');var t=document.getElementById("telemetry").checked;var e=document.getElementById("experimental").checked;var payload={destinations:dests,units:u?u.value:"metric",telemetry_enabled:t,experimental_enabled:e};document.location="pebblejs://close#"+encodeURIComponent(JSON.stringify(payload))}';
    html +=
        'function saveCurrentPos(){var nm=document.getElementById("name").value.trim();if(!nm){alert("Name is required");return}if(!_hasUserPos){alert("Current location not available");return}dests.push({lat:_userLat,lng:_userLng,name:nm});document.getElementById("name").value="";render()}';
    html +=
        'function worldPx(lat,lng,zoom){var n=Math.pow(2,zoom);return{wx:(lng+180)/360*n*256,wy:(1-Math.log(Math.tan(lat*Math.PI/180)+1/Math.cos(lat*Math.PI/180))/Math.PI)/2*n*256}}';
    html +=
        'function loadTile(z,x,y){return new Promise(function(r){var img=new Image();img.crossOrigin="anonymous";img.onload=function(){r({img:img,tx:x,ty:y})};img.onerror=function(){r(null)};img.src="https://tile.openstreetmap.org/"+z+"/"+x+"/"+y+".png"})}';
    html +=
        'function closePreview(e){if(e&&e.target!==document.getElementById("preview-modal"))return;document.getElementById("preview-modal").style.display="none"}';
    html +=
        'function preview(i){var d=dests[i];if(!d)return;document.getElementById("preview-modal").style.display="flex";var cv=document.getElementById("preview");var maxW=Math.min(window.innerWidth-32,400);var cw=Math.round(maxW);var ch=Math.round(cw*0.6);cv.width=cw;cv.height=ch;var cx=cv.getContext("2d");cx.fillStyle="#0f3460";cx.fillRect(0,0,cw,ch);cx.fillStyle="#4fc3f7";cx.font="12px sans-serif";cx.textAlign="center";cx.fillText("Loading route...",cw/2,ch/2);cx.textAlign="start";var origin=_hasUserPos?{lat:_userLat,lng:_userLng}:null;var url="https://routing.openstreetmap.de/routed-foot/route/v1/foot/";if(origin)url+=origin.lng+","+origin.lat+";";url+=d.lng+","+d.lat+"?geometries=geojson&overview=full&steps=false";fetch(url).then(function(r){return r.json()}).then(function(rData){cx.fillStyle="#0f3460";cx.fillRect(0,0,cw,ch);if(!rData||rData.code!=="Ok"||!rData.routes||!rData.routes.length){cx.fillStyle="#e74c3c";cx.font="12px sans-serif";cx.fillText("Route not found",10,20);return}var route=rData.routes[0];var coords=route.geometry.coordinates;var minLat,maxLat,minLng,maxLng;if(origin){minLat=origin.lat;maxLat=origin.lat;minLng=origin.lng;maxLng=origin.lng}else{minLat=coords[0][1];maxLat=minLat;minLng=coords[0][0];maxLng=minLng}function xb(lat,lng){if(lat<minLat)minLat=lat;if(lat>maxLat)maxLat=lat;if(lng<minLng)minLng=lng;if(lng>maxLng)maxLng=lng}if(origin)xb(origin.lat,origin.lng);xb(d.lat,d.lng);for(var j=0;j<coords.length;j++)xb(coords[j][1],coords[j][0]);var pad=Math.max((maxLat-minLat)*0.15,(maxLng-minLng)*0.15,0.005);minLat-=pad;maxLat+=pad;minLng-=pad;maxLng+=pad;var zoom=3;for(var z=18;z>=3;z--){var n=Math.pow(2,z);var pa=worldPx(minLat,minLng,z);var pb=worldPx(maxLat,maxLng,z);var w=Math.abs(pb.wx-pa.wx);var hh=Math.abs(pb.wy-pa.wy);if(w<=cw*0.92&&hh<=ch*0.92){zoom=z;break}}var clat=(minLat+maxLat)/2;var clng=(minLng+maxLng)/2;var cp=worldPx(clat,clng,zoom);var vl=cp.wx-cw/2;var vt=cp.wy-ch/2;var ts=256;var tx0=Math.floor(vl/ts);var ty0=Math.floor(vt/ts);var tx1=Math.floor((vl+cw-1)/ts);var ty1=Math.floor((vt+ch-1)/ts);var maxT=Math.pow(2,zoom)-1;tx0=Math.max(0,Math.min(maxT,tx0));tx1=Math.max(0,Math.min(maxT,tx1));ty0=Math.max(0,Math.min(maxT,ty0));ty1=Math.max(0,Math.min(maxT,ty1));var tps=[];for(var tx=tx0;tx<=tx1;tx++){for(var ty=ty0;ty<=ty1;ty++){tps.push(loadTile(zoom,tx,ty))}}Promise.all(tps).then(function(tiles){for(var t=0;t<tiles.length;t++){var tile=tiles[t];if(tile){var sx=Math.round(tile.tx*ts-vl);var sy=Math.round(tile.ty*ts-vt);cx.drawImage(tile.img,sx,sy,ts,ts)}}if(coords.length>1){cx.strokeStyle="#3366ff";cx.lineWidth=4;cx.lineCap="round";cx.lineJoin="round";cx.beginPath();for(var j=0;j<coords.length;j++){var p=worldPx(coords[j][1],coords[j][0],zoom);var x=p.wx-vl;var y=p.wy-vt;if(j===0)cx.moveTo(x,y);else cx.lineTo(x,y)}cx.stroke()}if(origin){var op=worldPx(origin.lat,origin.lng,zoom);var ox=op.wx-vl;var oy=op.wy-vt;cx.fillStyle="#22cc66";cx.beginPath();cx.arc(ox,oy,6,0,2*Math.PI);cx.fill();cx.strokeStyle="#fff";cx.lineWidth=2;cx.stroke()}var dp=worldPx(d.lat,d.lng,zoom);var dx=dp.wx-vl;var dy=dp.wy-vt;cx.fillStyle="#ff3333";cx.beginPath();cx.arc(dx,dy,6,0,2*Math.PI);cx.fill();cx.strokeStyle="#fff";cx.lineWidth=2;cx.stroke();cx.fillStyle="rgba(0,0,0,0.6)";cx.fillRect(0,ch-20,cw,20);cx.fillStyle="#fff";cx.font="10px sans-serif";cx.textAlign="center";cx.fillText((route.distance/1000).toFixed(1)+" km  "+Math.round(route.duration/60)+" min",cw/2,ch-7);cx.textAlign="start"})}).catch(function(){cx.fillStyle="#0f3460";cx.fillRect(0,0,cw,ch);cx.fillStyle="#e74c3c";cx.font="12px sans-serif";cx.fillText("Error loading route",10,20)})}';
    html += 'render();';
    html += '<\/script></body></html>';
    return html;
}
function saveSettings(response) {
    try {
        var data = JSON.parse(decodeURIComponent(response));
        if (data.destinations) {
            (0, helper_1.saveDestinations)(data.destinations);
        }
        if (data.units) {
            (0, helper_1.saveUnits)(data.units);
        }
        if (data.telemetry_enabled !== undefined) {
            (0, helper_1.saveTelemetryEnabled)(data.telemetry_enabled);
        }
        if (data.experimental_enabled !== undefined) {
            (0, helper_1.saveExperimentalEnabled)(data.experimental_enabled);
        }
    }
    catch (err) {
        console.log('Config parse error: ' + err);
    }
    return [];
}
