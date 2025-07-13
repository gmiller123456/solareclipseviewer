/*
Greg Miller gmiller@gregmiller.net 2022
https://www.celestialprogramming.com/
Released as public domain
*/

import {getElementCoeffs,computeOutlineCurve} from "./eclipse.js";
import {getPenumbraBeginAndEndInfo,getGreatestEclipse,getRiseSetCurves, computeCentralLatLonForTime, getMaxEclipseAtRiseSetPoints, getExtremePoints, getTotalityLimitsByLongitudeList, getPartialLimitsByLongitudeList} from "./eclipse.js";

let map;
let umbraLine=null;
let penumbraLine=null;

function drawRiseSetCurves(){
    const lists=getRiseSetCurves();
    const setting=createPolyLineFromLatLonList(lists.setting);
    const rising=createPolyLineFromLatLonList(lists.rising);
    setting.addTo(map);
    rising.addTo(map);
    return lists;
}

function computeGreatestEclipse(){
    const ge=getGreatestEclipse(getElementCoeffs());
    let p=new L.LatLng(ge.lat,ge.lon);
    let m=L.circleMarker(p,{radius: 5});
    m.addTo(map);
}

function computePenumbraExtremeInfo(){
    const pi=getPenumbraBeginAndEndInfo(getElementCoeffs());
    let p=new L.LatLng(pi.start.lat,pi.start.lon);
    let m=L.circleMarker(p,{radius: 1});
    m.addTo(map);

    p=new L.LatLng(pi.end.lat,pi.end.lon);
    m=L.circleMarker(p,{radius: 1});
    m.addTo(map);
    return pi;
}

export function computeEclipseData(map1,workerMessage){
    map=map1;
    const e=getElementCoeffs();
    const extremes=getExtremePoints(e);
    const begin=e.T0+extremes.begin.t-e.Δt/60/60;
    const end=e.T0+extremes.end.t-e.Δt/60/60;

    const centralCurve=computeCentralCurve(e,begin,end);

    const startLon=extremes.begin.λ;
    const endLon=extremes.end.λ;

    const limits=drawRiseSetCurves();

    const north=new Array();
    getTotalityLimitsByLongitudeList(e,1,startLon,endLon)[0].forEach(el => {if(el!=null) north.push(new L.LatLng(el.lat,el.lon))});

    const south=new Array();
    getTotalityLimitsByLongitudeList(e,-1,startLon,endLon)[0].forEach(el => {if(el!=null) south.push(new L.LatLng(el.lat,el.lon))});

    const northP=new Array();
    getPartialLimitsByLongitudeList(e,1,limits.nStart,limits.nEnd)[0].forEach(el => {if(el!=null) northP.push(new L.LatLng(el.lat,el.lon))});
    
    const southP=new Array();
    getPartialLimitsByLongitudeList(e,-1,limits.sStart,limits.sEnd)[0].forEach(el => {if(el!=null) southP.push(new L.LatLng(el.lat,el.lon))});

    computeGreatestEclipse();
    const pi=computePenumbraExtremeInfo();


    let eclipseData={};
    eclipseData.e=e;
    eclipseData.extremes=extremes;
    eclipseData.beginTime=pi.start.time;
    eclipseData.endTime=pi.end.time;
    eclipseData.centralCurve=centralCurve;
    eclipseData.northTotalityLimits=north;
    eclipseData.southTotalityLimits=south;
    eclipseData.northPartialLimits=northP;
    eclipseData.southPartialLimits=southP;
    //eclipseData.centerPoint=centerPoint;
    eclipseData.durationLines=null;

    const backgroundWorker=new Worker("backgroundworker.js",{type: "module"});
    backgroundWorker.addEventListener("message",workerMessage);
    backgroundWorker.postMessage(eclipseData);

    return eclipseData;
}

function createPolyLineFromLatLonList(list){
    const t=new Array();
    for(let i=0;i<list.length;i++){
        if(!isNaN(list[i].lat) && !isNaN(list[i].lon)){
            t.push(new L.LatLng(list[i].lat,list[i].lon));
        }
    }
    if(t.length>0) t.push(t[0]);
    const line=new L.Polyline(t, {color: 'black', weight: 1});
    return line;
}

function createPolygonFromLatLonList(list,color){
    const t=new Array();
    for(let i=0;i<list.length;i++){
        if(!isNaN(list[i].lat) && !isNaN(list[i].lon)){
            t.push(new L.LatLng(list[i].lat,list[i].lon));
        }
    }
    if(t.length>0) t.push(t[0]);
    const line=new L.polygon(t, {color: color, weight: 0});
    return line;
}

export function displayShadowOutlines(hour){
    if(umbraLine) map.removeLayer(umbraLine);
    if(penumbraLine) map.removeLayer(penumbraLine);
    const curves=computeOutlineCurve(hour);
    umbraLine=createPolygonFromLatLonList(curves.umbra,"#000000ff");
    umbraLine.addTo(map);
    penumbraLine=createPolygonFromLatLonList(curves.penumbra,'#000000aa');
    penumbraLine.addTo(map);
}

function computeCentralCurve(e,begin,end){

    let a=new Array();
    let i=begin;
    while(i<=end+.1){
        const p=computeCentralLatLonForTime(e,i);
        if(p!=null && p.lat!=null && p.lon!=null && !isNaN(p.lat) && !isNaN(p.lon)){
            a.push(new L.LatLng(p.lat,p.lon));
        }
        i+=.0001;
    }
    return a;
}

