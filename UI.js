/*
Greg Miller gmiller@gregmiller.net 2022
https://www.celestialprogramming.com/
Released as public domain
*/

import {hoursToTime,prettyTime,UnixTimeFromJulianDate} from "./astro.js";
import {drawOverlay} from "./overlay.js";
import {computeEclipseData,displayShadowOutlines} from "./EclipseMapping.js";
import {getElementCoeffs, getLocalCircumstances } from "./eclipse.js";
import {TimeZoneMap} from "./TimeZoneMap.js";

const timeZoneMap=new TimeZoneMap();
let timeZone={id: "America/New_York", offset: -14400};
//populateTimeZones();

const canvas=document.getElementById("overlayCanvas");
const ctx = canvas.getContext("2d");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
let markerList=[];
let lineList=[];

let lat=localStorage.getItem("eclipsemap_lat");
let lon=localStorage.getItem("eclipsemap_lon");
let zoom=localStorage.getItem("eclipsemap_zoom");
if(!lat || !lon || !zoom){
    lat=38.2738;
    lon=-86.414;
    zoom=5;
}

var map = L.map('map',{ zoomControl: false, renderer: L.canvas() }).setView([lat,lon], zoom);
let mapURL="https://tile.openstreetmap.org/{z}/{x}/{y}.png";
let mapAttrib='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
let airialURL="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
let airialAttrib="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
let mapLayer=L.tileLayer(mapURL,{attribution: mapAttrib})
let airialLayer=L.tileLayer(airialURL,{
    attribution: airialAttrib,
    maxNativeZoom:19,
        maxZoom:25
});

var OpenTopoMapLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 25,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxNativeZoom:16,
	maxZoom: 25
});

/*
TODO: Many more map styles at:
https://leaflet-extras.github.io/leaflet-providers/preview/
*/

const eclipseData=computeEclipseData(map,workerMessage);
map.addLayer(mapLayer);

// Add in a crosshair for the map
var crosshairIcon = L.icon({
    iconUrl: 'images/circle site.png',
    iconSize:     [20, 20], // size of the icon
    iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
});

const p=map.getCenter();
const crosshairs=L.marker(p,{icon:crosshairIcon}).addTo(map);

map.on('move', updateDisplay, this);
map.on('click', mapClick,this);

function mapClick(e){
    const p=e.latlng;
    const c=getLocalCircumstances(p.lat, p.lng,0);
    let s="Not Total";
    if(c.UTThirdContact-c.UTSecondContact>0) s=prettyTime(c.UTThirdContact-c.UTSecondContact);

    let m=L.circleMarker(p,{radius: 5, color: "#00000099"});
    m.addTo(map).bindTooltip(s, {permanent: true});

    markerList.push(m);
    if(markerList.length>1){
        const t=markerList[markerList.length-2];
        let dist=(t.getLatLng().distanceTo(m.getLatLng()) * 0.0006213712);

        if(dist<.25){
            dist=Math.floor(dist*5280)+"ft";
        } else {
            dist=dist.toFixed(2)+"mi";
        }
        
        const line=new L.Polyline([t.getLatLng(),m.getLatLng()], {color: 'black', weight: 1});
        line.addTo(map);
        line.bindTooltip(dist, {permanent: true});
        line.openTooltip();
        lineList.push(line);
    }
}

function removeAllMapLayers(){
    map.removeLayer(mapLayer);
    map.removeLayer(airialLayer);
    map.removeLayer(OpenTopoMapLayer);
    map.removeLayer(Esri_WorldGrayCanvas);
}

function setMap(){
    removeAllMapLayers();
    map.addLayer(mapLayer);
}

function setSat(){
    removeAllMapLayers();
    map.addLayer(airialLayer);
}

function setTopo(){
    removeAllMapLayers();
    map.addLayer(OpenTopoMapLayer);
}

function setBwMap(){
    removeAllMapLayers();
    map.addLayer(Esri_WorldGrayCanvas);
}

function displayLocalCircumstances(){
    const p=map.getCenter();
    const c=getLocalCircumstances(p.lat, p.lng,0);
    const t=document.getElementById("localCircumstancesTable");
    t.rows[1].cells[1].innerHTML=(p.lat-0).toFixed(4);
    t.rows[2].cells[1].innerHTML=(p.lng-0).toFixed(4);
    t.rows[3].cells[1].innerHTML=(c.h-0).toFixed(1);
    t.rows[4].cells[1].innerHTML=(c.mag*100).toFixed(1)+"%";
    if(c.mag>0){
        t.rows[5].cells[1].innerHTML=hoursToTime(c.UTFirstContact,timeZone);
        t.rows[6].cells[1].innerHTML=hoursToTime(c.UTLastContact,timeZone);
        t.rows[7].cells[1].innerHTML=prettyTime(c.UTLastContact-c.UTFirstContact);
    } else {
        t.rows[5].cells[1].innerHTML="";
        t.rows[6].cells[1].innerHTML="";
        t.rows[7].cells[1].innerHTML="";
    }

    if(c.mag>=1){
        t.rows[8].cells[1].innerHTML=hoursToTime(c.UTSecondContact,timeZone);
        t.rows[10].cells[1].innerHTML=hoursToTime(c.UTThirdContact,timeZone);
        t.rows[11].cells[1].innerHTML=prettyTime(c.UTThirdContact-c.UTSecondContact);
    } else {
        t.rows[8].cells[1].innerHTML="";
        t.rows[10].cells[1].innerHTML="";
        t.rows[11].cells[1].innerHTML="";
    }
    t.rows[9].cells[1].innerHTML=hoursToTime(c.UTMaximum,timeZone);
}

function formatUTCOffset(tz){
    let s=tz.offset;
    let pm="";
    if(s>=0) pm="+";
    let hours=Math.floor(s/60/60);
    let t=s-hours*60*60;
    t=t/60;
    let ez="";
    if (t<10) ez="0"
    return pm+hours+":"+ez+t;
}

function updateDisplay(e){
    const center=map.getCenter();
    
    timeZone=timeZoneMap.getTZFromLatLon(center.lat,center.lng);
    document.getElementById("timeZoneDisplay").innerText="GMT " + formatUTCOffset(timeZone);
    const t=displayLocalCircumstances();
    displayShadowOutlines(document.getElementById("timeSlider").value-0);
    crosshairs.setLatLng(center);
    drawOverlay(ctx,map,eclipseData);
    updateTimeLabel(animhour);
    localStorage.setItem("eclipsemap_lat",center.lat);
    localStorage.setItem("eclipsemap_lon",center.lng);
    localStorage.setItem("eclipsemap_zoom",map.getZoom());
}

function workerMessage(e){
    const lines=e.data;
    eclipseData.durationLines=lines;
    document.getElementById("durationLinesLoadingSpinner").classList.remove("loadingSpinner");
    document.getElementById("showDurationLinesCheckbox").style.visibility="visible";
    updateDisplay();
}

function clearMarkers(e){
    for(let i=0;i<markerList.length;i++){
        map.removeLayer(markerList[i]);
    }
    for(let i=0;i<lineList.length;i++){
        map.removeLayer(lineList[i]);
    }
    markerList=[];
    lineList=[];
}

function durationLinesCheck(){
    updateDisplay();
}

function populateTimeZones(){
    const date=new Date(2024,4,8);
    const tz=-(date.getTimezoneOffset()/60);
    const e=document.getElementById("timeZoneSelect");
    for(let i=-11;i<=14;i++){
        const o=document.createElement("option");
        o.value=i;
        if(i>=0){
            o.text="UTC + "+i;
        } else {
            o.text="UTC - "+Math.abs(i);
        }
        if(i==tz) o.selected="selected";
        e.add(o,null);
    }

}

function sliderInput(e){
    runAmination=false;
    animhour=document.getElementById("timeSlider").value-0;
    displayShadowOutlines(animhour);
    updateTimeLabel(animhour);
}

function updateTimeLabel(hour){
    const e=getElementCoeffs();
    let time=e.T0 + hour - e.Δt/60/60
    if(time < eclipseData.beginTime){
        document.getElementById("timeSliderLabel").innerText="N/A";
    } else {
        document.getElementById("timeSliderLabel").innerText=hoursToTime(time,timeZone);
    }
}

function animate(){
    displayShadowOutlines(animhour);
    updateTimeLabel(animhour);

    if(runAmination && animhour<eclipseData.endTime){
        animhour+=.01;
        window.setTimeout(animate,50);
        document.getElementById("timeSlider").value=animhour;
    }
}

function locationClick(){
    navigator.geolocation.getCurrentPosition(positionListener);
}

function positionListener(p){
    map.setView([p.coords.latitude, p.coords.longitude]);
}

function realTimeClick(e){
    runAmination=false;
    document.getElementById("timeSlider").disabled=true;

}

function alarm(time,cutoff){
    if(Math.abs(time-cutoff*1000)<=1000){
        beep();
    }
}

function alarms(first, second, third, fourth){
    if(document.getElementById("tenSecondWarning").checked){
        alarm(first,10);
        alarm(second,10);
        alarm(third,10);
        alarm(fourth,10);
    }

    if(document.getElementById("oneMinuteWarning").checked){
        alarm(first,60);
        alarm(second,60);
        alarm(third,60);
        alarm(fourth,60);
    }

    if(document.getElementById("fiveMinuteWarning").checked){
        alarm(first,300);
        alarm(second,300);
        alarm(fourth,300);
    }
}

function updateCountdown(){
    const e=getElementCoeffs();
    const p=map.getCenter();
    const c=getLocalCircumstances(p.lat, p.lng,0);
    const t=document.getElementById("countdownTable");
    const time=new Date().getTime()+testTimeOffset;
    const fc=UnixTimeFromJulianDate(c.UTFirstContact/24.0+c.jd)-time;
    const lc=UnixTimeFromJulianDate(c.UTLastContact/24.0+c.jd)-time;
    const sc=UnixTimeFromJulianDate(c.UTSecondContact/24.0+c.jd)-time;
    const tc=UnixTimeFromJulianDate(c.UTThirdContact/24.0+c.jd)-time;
    alarms(fc,sc,tc,lc);

    if(c.mag>0){
        t.rows[0].cells[1].innerHTML=prettyTime(fc/1000/60/60);
        t.rows[3].cells[1].innerHTML=prettyTime(lc/1000/60/60);
    } else {
        t.rows[0].cells[1].innerHTML="";
        t.rows[3].cells[1].innerHTML="";
    }

    if(c.mag>=1){
        t.rows[1].cells[1].innerHTML=prettyTime(sc/1000/60/60);
        t.rows[2].cells[1].innerHTML=prettyTime(tc/1000/60/60);
    } else {
        t.rows[1].cells[1].innerHTML="";
        t.rows[2].cells[1].innerHTML="";
    }
}

function setRealTimeDisplay(){
    const e=getElementCoeffs();
    const t0=UnixTimeFromJulianDate(e.jd) + (e.T0 - e.Δt/60/60)*60*60*1000;
    const now=new Date().getTime()+testTimeOffset;
    const diff=(now-t0)/1000/60/60;
    animhour=diff;
    document.getElementById("timeSlider").value=animhour;

    displayShadowOutlines(animhour);
    updateTimeLabel(animhour);
}

function displayCountdown(){
    if(document.getElementById("realTimeCheckbox").checked==true){
        setRealTimeDisplay();
    }
    if(document.getElementById("showCountdownCheckbox").checked==true){
        updateCountdown();
    }

    window.setTimeout(()=>{
        displayCountdown();
    },100);
}

function countdownClick(e){
    const d=document.getElementById("countdownDiv");
    if(document.getElementById("showCountdownCheckbox").checked==true){
        d.style.display="inline-block";
    } else {
        d.style.display="none";
    }
}

function beep() {
    beepSound.play();
}

function simulationModeClick(){
    const e=getElementCoeffs();
    const t0=UnixTimeFromJulianDate(e.jd) + (e.T0 - e.Δt/60/60)*60*60*1000;
    testTimeOffset=t0+eclipseData.beginTime*60*60*1000 - new Date().getTime() + 1*60*60*1000;

    document.getElementById("simulationModeDiv").style.display="block";
    document.getElementById("realTimeCheckbox").checked=true;
    realTimeClick(null);
}

export function simulationTimeClick(v){
    testTimeOffset+=v*1000*60;
}

export function initUI(){
    animate();

    document.getElementById("setMapImg").addEventListener("click",setMap);
    document.getElementById("setSatImg").addEventListener("click",setSat);
    document.getElementById("setTopoImg").addEventListener("click",setTopo);
    document.getElementById("setBwMapImg").addEventListener("click",setBwMap);
    document.getElementById("clearMarkersButton").addEventListener("click",clearMarkers);
    document.getElementById("showDurationLinesCheckbox").addEventListener("click",durationLinesCheck);
    //document.getElementById("timeZoneSelect").addEventListener("input",updateDisplay);
    document.getElementById("timeSlider").addEventListener("input",sliderInput);
    document.getElementById("locationButton").addEventListener("click",locationClick);
    document.getElementById("showCountdownCheckbox").addEventListener("click",countdownClick);
    document.getElementById("realTimeCheckbox").addEventListener("click",realTimeClick);
    document.getElementById("warningButton").addEventListener("click",beep);
    document.getElementById("simulationHref").addEventListener("click",simulationModeClick);
    
    window.addEventListener("resize",updateDisplay);
    window.setTimeout(()=>{
        displayCountdown();
    },100);
    updateDisplay(null);
}

const beepSound = new Audio("alarm.wav");

let runAmination=true;
let animhour=eclipseData.beginTime;
let testTimeOffset=0;
//let testTimeOffset=((32*24 + 14)*60 + 35)*60*1000;
