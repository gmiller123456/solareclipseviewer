export function drawOverlay(ctx,map,eclipseData){
    const zoom=map.getZoom();
    
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    const central=drawLineOverlay(ctx,map,eclipseData.centralCurve, {color: 'black', weight: 2});
    const limitNorthT=drawLineOverlay(ctx,map,eclipseData.northTotalityLimits, {color: 'red', weight: 2});
    const limitSouthT=drawLineOverlay(ctx,map,eclipseData.southTotalityLimits, {color: 'red', weight: 2});
    const limitNorthP=drawLineOverlay(ctx,map,eclipseData.northPartialLimits, {color: 'black', weight: 2,});
    const limitSouthP=drawLineOverlay(ctx,map,eclipseData.southPartialLimits, {color: 'black', weight: 2});

    if(zoom>=4){
        ctx.font = "1em Georgia";
        ctx.textAlign="center";
        ctx.textBaseline="bottom";
        drawLabel(ctx,map,"Totality Center Line",central);

        ctx.textBaseline="top";
        drawLabel(ctx,map,"Partial Edge",limitSouthP);
        drawLabel(ctx,map,"Totality Edge",limitSouthT);

        ctx.textBaseline="bottom";
        drawLabel(ctx,map,"Totality Edge",limitNorthT);
        drawLabel(ctx,map,"Partial Edge",limitNorthP);
    }

    if(eclipseData.durationLines!=null && document.getElementById("showDurationLinesCheckbox").checked){
        for(let i=0;i<eclipseData.durationLines.length;i++){
            const l1=drawLineOverlay(ctx,map,eclipseData.durationLines[i][0], {color: 'purple', weight: 1});
            const l2=drawLineOverlay(ctx,map,eclipseData.durationLines[i][1], {color: 'purple', weight: 1});
            if(zoom>=7){
                ctx.font = ".75em Georgia";
                ctx.textBaseline="top";
                drawLabel(ctx,map,""+(i+1)+" minute",l1);
                ctx.textBaseline="bottom";
                drawLabel(ctx,map,""+(i+1)+" minute",l2);
            }

        }
    }


}

function drawLabel(ctx,map,text,points){
    const o=map._getMapPanePos();
    const o1=map.getPixelOrigin();
    const p1=map.project(points.first);
    const p2=map.project(points.last);

    const x1=p1.x+(o.x-o1.x);
    const x2=p2.x+(o.x-o1.x);
    const y1=p1.y+(o.y-o1.y);
    const y2=p2.y+(o.y-o1.y);

    const angle=Math.atan2(y2-y1,x2-x1);

    ctx.save();
    ctx.translate(x1,y1);
    ctx.rotate(angle);

    ctx.fillText(text,0,0);

    ctx.restore()
}


function drawLineOverlay(ctx,map,points,options){
    const bounds=map.getBounds();
    const n=bounds._northEast.lat;
    const e=bounds._northEast.lng;
    const s=bounds._southWest.lat;
    const w=bounds._southWest.lng;
    
    let firstPoint=null;
    let lastPoint=null;

    const o=map._getMapPanePos();
    const o1=map.getPixelOrigin();

    ctx.beginPath();
    ctx.strokeStyle=options.color;
    ctx.lineWidth=options.weight;

    const p=map.project(points[0]);
    ctx.moveTo(p.x+(o.x-o1.x),p.y+(o.y-o1.y));

    for(let i=1;i<points.length;i++){
        const t=points[i];
        if(t.lat<=n && t.lat>=s  && t.lng<=e && t.lng>=w){
            if(firstPoint==null) firstPoint=i;
            lastPoint=i;
            const p=map.project(points[i]);
            ctx.lineTo(p.x+(o.x-o1.x),p.y+(o.y-o1.y));
        }
    }
    ctx.stroke();
    const mid=Math.floor((lastPoint-firstPoint)/2)+firstPoint;
    return {first: points[mid], last: points[mid+1]};
}
