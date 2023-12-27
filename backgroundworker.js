
import {getLocalCircumstances} from "./eclipse.js";

function findNorthLatForDuration(lon,max,min,target){
    let result=9999;
    let count=0;
    let total;

    while(((max-min)>.00001) && count<10000){
        const guess=(max-min)/2+min;
        const c=getLocalCircumstances(guess, lon,0);
        total=(c.UTThirdContact-c.UTSecondContact)*60;

        result=guess;
        if(result==target){
            max=min;
        } else if(total>target){
            min=guess;
        } else {
            max=guess;
        }
        count++;
    }
    if(total+.01<target) result=null;
    return result;
}

function findSouthLatForDuration(lon,max,min,target){
    let result=-9999;
    let count=0;
    let total;
    
    while(((max-min)>.00001) && count<10000){
        const guess=(max-min)/2+min;
        const c=getLocalCircumstances(guess, lon,0);
        total=(c.UTThirdContact-c.UTSecondContact)*60;

        result=guess;
        if(result==target){
            max=min;
        } else if(total<target){
            min=guess;
        } else {
            max=guess;
        }
        count++;
    }
    if(total+.01<target) result=null;
    return result;
}

function getTotalityDurationLines(d,target){
    let north=new Array();
    let south=new Array();

    for(let i=0;i<d.northTotalityLimits.length && i<d.southTotalityLimits.length;i++){
        const lng=d.northTotalityLimits[i].lng;
        let max=d.northTotalityLimits[i].lat;
        let min=d.southTotalityLimits[i].lat;
        let mid=(max-min)/2+min;

        const n=findNorthLatForDuration(lng,max,mid,target);
        const s=findSouthLatForDuration(lng,mid,min,target);
        if(n!=null) north.push({lat: n, lng: lng});
        if(s!=null) south.push({lat: s, lng: lng});
    }
    return [north,south];
}


function messageReceived(e){
    const eclipseData=e.data;

    const lines=new Array();
    lines.push(getTotalityDurationLines(eclipseData,1));
    lines.push(getTotalityDurationLines(eclipseData,2));
    lines.push(getTotalityDurationLines(eclipseData,3));
    lines.push(getTotalityDurationLines(eclipseData,4));

    this.self.postMessage(lines);

}

self.addEventListener('message', messageReceived, false);

