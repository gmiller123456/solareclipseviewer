/*
Greg Miller gmiller@gregmiller.net 2023
https://www.celestialprogramming.com/
Released as public domain
*/

//Functions for computing solar eclipses.
//Most equations are from Elements of Solar Eclipses by Jean Meeus

'use strict';
const rad=Math.PI/180;

const maxiterations=20;
    
function solveQuadrant(sin,cos){
    if(sin>=0 && cos>=0){return Math.asin(sin);}
    if(sin<0 && cos>=0){return Math.asin(sin);}
    if(sin<0 && cos<0){return -Math.acos(cos);}
    if(sin>=0 && cos<0){return Math.acos(cos);}
}
export function getElementCoeffs(){
    return getElements2024();
}

function getElements2024(){
    const elements={};
    elements.jd=2460408.5;
    elements.Δt=69;
    elements.T0=18;

    elements.X0=-0.3182440;
    elements.X1=0.5117116;
    elements.X2=0.0000326;
    elements.X3=-0.0000084;

    elements.Y0=0.2197640;
    elements.Y1=0.2709589;
    elements.Y2=-0.0000595;
    elements.Y3=-0.0000047;

    elements.d0=7.5862002;
    elements.d1=0.0148440;
    elements.d2=-0.0000020;
    elements.d3=0.0000000;

    elements.L10=0.5358140;
    elements.L11=0.0000618;
    elements.L12=-0.0000128;
    elements.L13=0.0000000;

    elements.L20=-0.0102720;
    elements.L21=0.0000615;
    elements.L22=-0.0000127;
    elements.L23=0.0000000;

    elements.M0=89.591217;
    elements.M1=15.004080;
    elements.M2=0.000000;
    elements.M3=0.000000;

    elements.tanf1 = 0.0046683;
    elements.tanf2 = 0.0046450; 

    return elements;
    
}

function getElements1996(){
    //Example data for Oct 12, 1996
    const elements={};
    elements.Δt=63;
    elements.T0=14;

    elements.X0=0.296103;
    elements.X1=0.5060364;
    elements.X2=0.0000145;
    elements.X3=-0.00000644;

    elements.Y0=1.083058;
    elements.Y1=-0.1515218;
    elements.Y2=-0.0000102;
    elements.Y3=0.00000184;

    elements.d0=-7.63950;
    elements.d1=-0.015234;
    elements.d2=0.000002;

    elements.M0=33.40582;
    elements.M1=15.003782;

    elements.L10=0.559341;
    elements.L11=-0.0001067;
    elements.L12=-0.0000107;

    elements.L20=0.013151;
    elements.L21=-0.0001062;
    elements.L22=-0.0000106;

    elements.tanf1=0.0046865;
    elements.tanf2=0.0046632;

    return elements;
}

export function getElements1994(){
    //Example data for May 10, 1994
    const elements={};
    elements.Δt=61;
    elements.T0=17;

    elements.X0=-0.173367;
    elements.X1=0.4990629;
    elements.X2=0.0000296;
    elements.X3=-0.00000563;

    elements.Y0=0.383484;
    elements.Y1=0.0869393;
    elements.Y2=-0.0001183;
    elements.Y3=-0.00000092;

    elements.d0=17.68613;
    elements.d1=0.010642;
    elements.d2=-0.000004;

    elements.M0=75.90923;
    elements.M1=15.001621;

    elements.L10=0.566906;
    elements.L11=-0.0000318;
    elements.L12=-0.0000098;

    elements.L20=0.020679;
    elements.L21=-0.0000317;
    elements.L22=-0.0000097;

    elements.tanf1=0.0046308;
    elements.tanf2=0.0046077;

    return elements;
}
function getElements(e,t,Φ,λ,height){
    const o={};
    o.X=e.X0 + e.X1*t + e.X2*t*t + e.X3*t*t*t;
    o.Y=e.Y0 + e.Y1*t + e.Y2*t*t + e.Y3*t*t*t;
    o.d=e.d0 + e.d1*t + e.d2*t*t;
    o.M=e.M0 + e.M1*t;
    o.Xp=e.X1 + 2*e.X2*t + 3*e.X3*t*t;
    o.Yp=e.Y1 + 2*e.Y2*t + 3*e.Y3*t*t;
    o.L1=e.L10 + e.L11*t + e.L12*t*t;
    o.L2=e.L20 + e.L21*t + e.L22*t*t;

    o.H = o.M - λ - 0.00417807 * e.Δt;

    o.u1 = Math.atan(0.99664719*Math.tan(Φ*rad))/rad;
    o.ρsinΦp=0.99664719 * Math.sin(o.u1*rad)+height/6378140*Math.sin(Φ*rad);
    o.ρcosΦp=Math.cos(o.u1*rad) + height/6378140 * Math.cos(Φ*rad);

    o.ξ = o.ρcosΦp * Math.sin(o.H*rad);
    o.η = o.ρsinΦp * Math.cos(o.d*rad) - o.ρcosΦp * Math.cos(o.H*rad) * Math.sin(o.d*rad);
    o.ζ = o.ρsinΦp * Math.sin(o.d*rad) + o.ρcosΦp * Math.cos(o.H*rad) * Math.cos(o.d*rad);
    o.ξp = 0.01745329 * e.M1 * o.ρcosΦp * Math.cos(o.H*rad);
    o.ηp = 0.01745329 * (e.M1 * o.ξ * Math.sin(o.d*rad) - o.ζ * e.d1);
    o.L1p = o.L1 - o.ζ * e.tanf1;
    o.L2p = o.L2 - o.ζ * e.tanf2;

    o.u = o.X - o.ξ;
    o.v = o.Y - o.η;
    o.a = o.Xp - o.ξp;
    o.b = o.Yp - o.ηp;
    o.n = Math.sqrt(o.a*o.a + o.b*o.b);

    return o;

}

export function getLocalCircumstances(Φ,λ,height){
    const e=getElementCoeffs();
    λ=-λ;

    let t=0;
    let τm=10000;

    let iterations=0;
    let o;
    while(Math.abs(τm)>.00001 && iterations<maxiterations){
        o=getElements(e,t,Φ,λ,height);
        τm = - (o.u*o.a + o.v*o.b)/(o.n*o.n);
        t = t + τm;
        iterations++;
    }

    const m = Math.sqrt(o.u*o.u + o.v*o.v);
    const G = (o.L1p - m)/(o.L1p + o.L2p);
    const A = (o.L1p - o.L2p)/(o.L1p + o.L2p);

    //const Pm = Math.atan2(-o.vp, o.up);
    const Pm = Math.atan2(o.u/o.v)/rad;

    const sinh=Math.sin(o.d*rad)*Math.sin(Φ*rad) + Math.cos(o.d*rad)*Math.cos(Φ*rad)*Math.cos(o.H*rad);
    const h=Math.asin(sinh)/rad;
    const q = Math.asin(Math.cos(Φ*rad) * Math.sin(o.H*rad) / Math.cos(h*rad));

    let S = (o.a*o.v - o.u*o.b)/(o.n * o.L1p);
    let τ = o.L1p/o.n * Math.sqrt(1 - S*S);

    let firstContact = t - τ;
    let lastContact = t + τ;

    for(let i=0; i<10; i++){
        const fco=getElements(e,firstContact,Φ,λ,height);

        S = (fco.a*fco.v - fco.u*fco.b)/(fco.n * fco.L1p);
        const τf = - (fco.u*fco.a + fco.v*fco.b)/(fco.n*fco.n) - fco.L1p/fco.n * Math.sqrt(1 - S*S);

        firstContact = firstContact + τf;
    }

    for(let i=0; i<10; i++){
        const fco=getElements(e,lastContact,Φ,λ,height);

        S = (fco.a*fco.v - fco.u*fco.b)/(fco.n * fco.L1p);
        const τf = - (fco.u*fco.a + fco.v*fco.b)/(fco.n*fco.n) + fco.L1p/fco.n * Math.sqrt(1 - S*S);

        lastContact = lastContact + τf;
    }

    //Interior contacts
    S = (o.a*o.v - o.u*o.b)/(o.n * o.L2p);
    τ = o.L2p/o.n * Math.sqrt(1 - S*S);

    let thirdContact = t - τ;
    let secondContact = t + τ;

    for(let i=0; i<10; i++){
        const fco=getElements(e,thirdContact,Φ,λ,height);

        S = (fco.a*fco.v - fco.u*fco.b)/(fco.n * fco.L2p);
        const τf = - (fco.u*fco.a + fco.v*fco.b)/(fco.n*fco.n) - fco.L2p/fco.n * Math.sqrt(1 - S*S);

        thirdContact = thirdContact + τf;
    }

    for(let i=0; i<10; i++){
        const fco=getElements(e,secondContact,Φ,λ,height);

        S = (fco.a*fco.v - fco.u*fco.b)/(fco.n * fco.L2p);
        const τf = - (fco.u*fco.a + fco.v*fco.b)/(fco.n*fco.n) + fco.L2p/fco.n * Math.sqrt(1 - S*S);

        secondContact = secondContact + τf;
    }

    const UTFirstContact=e.T0 + firstContact - e.Δt/60/60;
    const UTSecondContact=e.T0 + secondContact - e.Δt/60/60;
    const UTThirdContact=e.T0 + thirdContact - e.Δt/60/60;
    const UTLastContact=e.T0 + lastContact - e.Δt/60/60;
    const UTMaximum = e.T0 + t  - e.Δt/60/60;

    const UT=e.T0 + t;

    return {
        jd: e.jd, t:t, UT: UT, mag: G, 
        UTMaximum: UTMaximum, 
        UTFirstContact: UTFirstContact, 
        UTSecondContact: UTSecondContact, 
        UTThirdContact: UTThirdContact, 
        UTLastContact: UTLastContact, 
        h:h, m:m, elements: o};
}

export function computeCentralLatLonForTime(e,UTC){
    const t=UTC-e.T0;

    const X=e.X0 + e.X1*t + e.X2*t*t + e.X3*t*t*t;
    const Y=e.Y0 + e.Y1*t + e.Y2*t*t + e.Y3*t*t*t;
    //const Z=Z0 + Z1*t + Z2*t*t + Z3*t*t*t;
    const d=e.d0 + e.d1*t + e.d2*t*t;
    const M=e.M0 + e.M1*t;
    const L1=e.L10 + e.L11*t + e.L12*t*t;
    const L2=e.L20 + e.L21*t + e.L22*t*t;

    const Xp=e.X1 + 2*e.X2*t + 3*e.X3*t*t;
    const Yp=e.Y1 + 2*e.Y2*t + 3*e.Y3*t*t;

    const dtemp=d*rad;
    const ω=1/Math.sqrt(1-0.006694385 * Math.cos(d*rad)*Math.cos(d*rad));

    const p=e.M1/57.2957795;
    const b=Yp - p*X*Math.sin(d*rad);
    const c=Xp + p*Y*Math.sin(d*rad);

    const y1=ω * Y;
    const b1=ω * Math.sin(d*rad);
    const b2=0.99664719*ω*Math.cos(d*rad);
    const B=Math.sqrt(1 -  X*X - y1*y1); //If B does not exist, there is no central eclipse at given time

    const Φ1=Math.asin(B*b1 + y1*b2);
    //const H=Math.asin(X/Math.cos(Φ1))/rad;
    //const cos(Φ1)*cos(H)=B*b2 - y1*b1;
    const sinH = X/Math.cos(Φ1);
    const cosH = (B*b2 - y1*b1)/Math.cos(Φ1);
    const H = solveQuadrant(sinH,cosH)/rad;

    const Φ = Math.atan(1.00336409 * Math.tan(Φ1))/rad;
    //const λ = M - H - 1.0027379 * Δt;
    const λ = M - H - 0.00417807 * e.Δt;

    const L1p=L1 - B * e.tanf1;
    const L2p=L2 - B * e.tanf2;
    const a = c - p*B*Math.cos(d*rad);
    const n = Math.sqrt(a*a + b*b);
    const duration = 7200*L2p/n;

    const sinh=Math.sin(d*rad)*Math.sin(Φ*rad) + Math.cos(d*rad)*Math.cos(Φ*rad)*Math.cos(H*rad);
    const h=Math.asin(sinh)/rad;

    const K2 = B*B + ((X*a + Y*b)*(X*a + Y*b))/(n*n);
    const K = Math.sqrt(K2);
    const width=12756*Math.abs(L2p)/K;

    const A = (L1p - L2p)/(L1p + L2p);

    return {lat: Φ, lon: -λ};
}

function computeExtremes(e,t0){
    const r={};
    const t=t0;
    r.t=t;


    r.X=e.X0 + e.X1*t + e.X2*t*t + e.X3*t*t*t;
    r.Y=e.Y0 + e.Y1*t + e.Y2*t*t + e.Y3*t*t*t;
    //const Z=Z0 + Z1*t + Z2*t*t + Z3*t*t*t;
    r.d=e.d0 + e.d1*t + e.d2*t*t;
    r.M=e.M0 + e.M1*t;
    r.L1=e.L10 + e.L11*t + e.L12*t*t;
    r.L2=e.L20 + e.L21*t + e.L22*t*t;

    r.Xp=e.X1 + 2*e.X2*t + 3*e.X3*t*t;
    r.Yp=e.Y1 + 2*e.Y2*t + 3*e.Y3*t*t;

    r.ω=1/Math.sqrt(1-0.006694385 * Math.cos(r.d*rad)*Math.cos(r.d*rad));
    r.p=e.M1/57.2957795;
    r.b=r.Yp - r.p*r.X*Math.sin(r.d*rad);
    r.c=r.Xp + r.p*r.Y*Math.sin(r.d*rad);

    r.y1=r.ω * r.Y;
    r.b1=r.ω * Math.sin(r.d*rad);
    r.b2=0.99664719*r.ω*Math.cos(r.d*rad);

    let temp=1 -  r.X*r.X - r.y1*r.y1;
    if(temp<0){ //avoid rounding errors, eclipse does not exist if < 0
        temp=0;
    }
    r.B=Math.sqrt(temp); //If B does not exist, there is no central eclipse at given time

    r.Φ1=Math.asin(r.B*r.b1 + r.y1*r.b2);
    const sinH=r.X/Math.cos(r.Φ1);
    const cosH=(r.B*r.b2 - r.y1*r.b1)/Math.cos(r.Φ1);
    r.H = solveQuadrant(sinH,cosH)/rad;

    r.Φ = Math.atan(1.00336409 * Math.tan(r.Φ1))/rad;
    //const λ = M - H - 1.0027379 * Δt;
    r.λ = -(r.M - r.H - 0.00417807 * e.Δt); //Meeus treats East long as negative, inverted here
    r.L1p=r.L1 - r.B * e.tanf1;
    r.L2p=r.L2 - r.B * e.tanf2;
    r.a = r.c - r.p*r.B*Math.cos(r.d*rad);
    r.n = Math.sqrt(r.a*r.a + r.b*r.b);
    r.duration = 7200*r.L2p/r.n;

    r.sinh=Math.sin(r.d*rad)*Math.sin(r.Φ*rad) + Math.cos(r.d*rad)*Math.cos(r.Φ*rad)*Math.cos(r.H*rad);
    r.h=Math.asin(r.sinh)/rad;

    r.K2 = r.B*r.B + ((r.X*r.a + r.Y*r.b)*(r.X*r.a + r.Y*r.b))/(r.n*r.n);
    r.K = Math.sqrt(r.K2);
    r.width=12756*Math.abs(r.L2p)/r.K;

    r.A = (r.L1p - r.L2p)/(r.L1p + r.L2p);

    return r;
}

function computeEstimate(e){
    const ω=1/Math.sqrt(1-0.006694385 * Math.cos(e.d0*rad)*Math.cos(e.d0*rad));
    const u=e.X0;
    const a=e.X1;
    const v=ω*e.Y0;
    const b=ω*e.Y1;
    const n=Math.sqrt(a*a + b*b);

    const S=(a*v - u*b)/n;
    const τ=-(u*a + v*b)/(n*n)
    const τ1=τ - Math.sqrt(1-S*S)/n;
    const τ2=τ + Math.sqrt(1-S*S)/n;

    //Hours before (τ1), and after (τ2) T0
    return {τ1: τ1,τ2: τ2};
}

function refineEstimate(e,t){
    const X=e.X0 + e.X1*t + e.X2*t*t + e.X3*t*t*t;
    const Y=e.Y0 + e.Y1*t + e.Y2*t*t + e.Y3*t*t*t;
    const d=e.d0 + e.d1*t + e.d2*t*t;
    const Xp=e.X1 + 2*e.X2*t + 3*e.X3*t*t;
    const Yp=e.Y1 + 2*e.Y2*t + 3*e.Y3*t*t;

    const ω=1/Math.sqrt(1-0.006694385 * Math.cos(e.d0*rad)*Math.cos(e.d0*rad));
    const u=X;
    const a=Xp;
    const v=ω*Y;
    const b=ω*Yp;
    const n=Math.sqrt(a*a + b*b);

    const S=(a*v - u*b)/n;
    const τ=-(u*a + v*b)/(n*n)
    const τ1=τ - Math.sqrt(1-S*S)/n;
    const τ2=τ + Math.sqrt(1-S*S)/n;

    //Hours before (τ1), and after (τ2) T0
    return {τ1: τ1,τ2: τ2};

}

export function getExtremePoints(e){
    const est=computeEstimate(e);
    const est2=refineEstimate(e,est.τ1);
    const est3=refineEstimate(e,est.τ2);

    const beginCircumstances=computeExtremes(e,est.τ1+est2.τ1);
    const endCircumstances=computeExtremes(e,est.τ2+est3.τ2);
    return {begin: beginCircumstances, end: endCircumstances};
}

export function getEclipseCenter(e){
    let t=0;
    for(let i=0;i<20;i++){
        t= - (e.X0 + t*t*(e.X2 + t*e.X3))/e.X1;
    }

    const Y=e.Y0 + e.Y1*t + e.Y2*t*t + e.Y3*t*t*t;
    const d=e.d0 + e.d1*t + e.d2*t*t;
    const M=e.M0 + e.M1*t;
    const ω=1/Math.sqrt(1-0.006694385 * Math.cos(d*rad)*Math.cos(d*rad));

    const β = Math.asin(ω * Y)/rad;
    const d1 = Math.asin(ω * Math.sin(d*rad))/rad;
    let Φ1;
    let Φ;
    let λ;
    if(β + d1 > 90){
        Φ1 = 180 - β + d1;
        Φ = Math.atan(1.00336409 * Math.tan(Φ1*raD))/rad;
        λ = - (M - 180 - 0.00417807 * e.Δt);
    } else if(β + d1 < -90){
        Φ1 = -(180 + β + d1);
        Φ = Math.atan(1.00336409 * Math.tan(Φ1*rad))/rad;
        λ = - (M + 180 - 0.00417807 * e.Δt);
    } else {
        Φ1 = β + d1;
        Φ = Math.atan(1.00336409 * Math.tan(Φ1*rad))/rad;
        λ = - (M - 0.00417807 * e.Δt);
    }
    if(λ<-180){λ+=360;}

    const UT = e.T0 + t - e.Δt/60/60;
    return {UT: UT, lat: Φ, lon: λ};
}

export function getCenterLineByLongitude(e,λ){
    return getLimitsForLongitude(e,λ,0,1,0);
}

export function getTotalityLimitsByLongitudeList(e,northsouth,startLon,endLon){
    return getLimitsByLongitudeAsList(e,northsouth,1,startLon,endLon);
}

export function getPartialLimitsByLongitudeList(e,northsouth,startLon,endLon){
    return getLimitsByLongitudeAsList(e,northsouth,0,startLon,endLon);
}

function getLimitsByLongitudeAsList(e,northsouth,G,startLon,endLon){
    const eqPoints=new Array();
    const polarPoints=new Array();

    for(let i=startLon;i<=endLon;i+=.01){
        const eq=getLimitsForLongitude(e,i,northsouth,G,0);
        const polar=getLimitsForLongitude(e,i,northsouth,G,89.9 * Math.sign(e.Y0));

        if(polar!=null  && eq!=null){
            if(Math.abs(eq.lat-polar.lat)<.1){
                eqPoints.push(eq);
            } else {
                eqPoints.push(eq);
                polarPoints.push(polar);
            }
        } else {
            eqPoints.push(null);
            polarPoints.push(null);
        }
    }

    return [eqPoints,polarPoints];
}

function getLimitsForLongitude(e,λ,northsouth,G,startΦ){

    let t=0;
    let Φ=startΦ;
    
    let i=0;
    let ΔΦ=1000;
    let τ=1000;
    while((Math.abs(τ)>.0001 || Math.abs(ΔΦ)>.0001) && i<20){
        const X=e.X0 + e.X1*t + e.X2*t*t + e.X3*t*t*t;
        const Y=e.Y0 + e.Y1*t + e.Y2*t*t + e.Y3*t*t*t;
        const d=e.d0 + e.d1*t + e.d2*t*t;
        const M=e.M0 + e.M1*t;
        const Xp=e.X1 + 2*e.X2*t + 3*e.X3*t*t;
        const Yp=e.Y1 + 2*e.Y2*t + 3*e.Y3*t*t;
        const L1=e.L10 + e.L11*t + e.L12*t*t;
        const L2=e.L20 + e.L21*t + e.L22*t*t;

        const H = M + λ - 0.00417807 * e.Δt;
    
        const height=0;
        const u1 = Math.atan(0.99664719*Math.tan(Φ*rad))/rad;
        const ρsinΦp=0.99664719 * Math.sin(u1*rad)+height/6378140*Math.sin(Φ*rad);
        const ρcosΦp=Math.cos(u1*rad) + height/6378140 * Math.cos(Φ*rad);
    
        const ξ = ρcosΦp * Math.sin(H*rad);
        const η = ρsinΦp * Math.cos(d*rad) - ρcosΦp * Math.cos(H*rad) * Math.sin(d*rad);
        const ζ = ρsinΦp * Math.sin(d*rad) + ρcosΦp * Math.cos(H*rad) * Math.cos(d*rad);
        const ξp = 0.01745329 * e.M1 * ρcosΦp * Math.cos(H*rad);
        const ηp = 0.01745329 * (e.M1 * ξ * Math.sin(d*rad) - ζ * e.d1);
        const L1p = L1 - ζ * e.tanf1;
        const L2p = L2 - ζ * e.tanf2;

        const u = X - ξ;
        const v = Y - η;
        const a = Xp - ξp;
        const b = Yp - ηp;
        const n = Math.sqrt(a*a + b*b);
    
        τ = - (u*a + v*b)/(n*n);
        const W = (v*a - u*b)/n;
        const Q = ((b * Math.sin(H*rad) * ρsinΦp + a*(Math.cos(H*rad) * Math.sin(d*rad) * ρsinΦp + Math.cos(d*rad)*ρcosΦp)))
                    / (57.29578 * n);
    
        //northsouth = 1 for northnet limit, -1 for southern limit
        const E=L1p - G * (L1p + L2p);
        ΔΦ = (W + northsouth * Math.abs(E))/Q;

        t = t + τ;
        Φ = Φ + ΔΦ;
        i++;
    }
    if (Math.abs(τ)>.0001 || Math.abs(ΔΦ)>.0001){return null;}
    
    const UT= e.T0 + t;
    
    Φ=(90+Φ)%180;
    if(Φ<0)Φ+=180;
    Φ-=90;
    return {t: t, lat: Φ, lon: λ};
}