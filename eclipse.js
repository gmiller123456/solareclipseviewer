/*
Greg Miller gmiller@gregmiller.net 2023
https://www.celestialprogramming.com/
Released as public domain
*/

//Functions for computing solar eclipses.

//Algorithms from various sources including:
//A Manual of Spherical and Practical Astronomy - Chauvenet 1863
//The Mathematical Theory of Eclipses According to Chauvenet's Transformation of Bessel's Method - Buchanan 1904
//Explanatory Supplement to the Astronomical Ephemeris 1961
//Explanatory Supplement to the Astronomical Almanac 1992
//Elements of Solar Eclipses - Meeus 1989
//Prediction and Analysis of Solar Eclipse Circumstances - Williams 1971

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
    //return getElements1994();
    //return getElements1996();
}

function getElements2024(){
    const elements={};
    elements.jd=2460408.5;
    elements.Δt=69.1;
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
    o.Mp=e.M1;
    o.L1=e.L10 + e.L11*t + e.L12*t*t;
    o.L2=e.L20 + e.L21*t + e.L22*t*t;
    o.tanf1=e.tanf1;
    o.tanf2=e.tanf2;

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

    return {lat: Φ, lon: -λ, magnitude: A, duration: duration, width: width};
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

export function getLatLonEclipseAtNoon(e){
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
    return getLimitsForLogitude(e,λ,0,1,0);
}

export function getTotalityLimitsByLongitudeList(e,northsouth,startLon,endLon){
    return getLimitsByLongitudeAsList(e,northsouth,1,startLon,endLon);
}

export function getPartialLimitsByLogitudeList(e,northsouth,startLon,endLon){
    return getLimitsByLongitudeAsList(e,northsouth,0,startLon,endLon);
}

function getLimitsByLongitudeAsList(e,northsouth,G,startLon,endLon){
    const eqPoints=new Array();
    const polarPoints=new Array();

    for(let i=startLon;i<=endLon;i+=.01){
        const eq=getLimitsForLogitude(e,i,northsouth,G,0);
        const polar=getLimitsForLogitude(e,i,northsouth,G,89.9 * Math.sign(e.Y0));

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

function getLimitsForLogitude(e,λ,northsouth,G,startΦ){

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


function computeOutlinePoint(be,Q,umbra){
    //The Explanatory Supplement to the Astronomical Ephemeris 1961
    //Prediction and Analysis of Solar Eclipse Circumstances - Williams 1971
    //P220
    const e=Math.sqrt(0.00672267);
    const sind=Math.sin(be.d*rad);
    const cosd=Math.cos(be.d*rad);
    const ρ1=Math.sqrt(1-e*e*cosd*cosd);
    const ρ2=Math.sqrt(1-e*e*sind*sind);
    const sind1=sind/ρ1;
    const cosd1=Math.sqrt(1-e*e)*cosd/ρ1;

    const sind1d2=e*e*sind*cosd/(ρ1*ρ2); //P220 (bottom)
    const cosd1d2=Math.sqrt(1-e*e)/(ρ1*ρ2);
    
    Q*=rad;

    const sinQ=Math.sin(Q);
    const cosQ=Math.cos(Q);

    let tanf=be.tanf1;
    let l=be.l1;
    if(umbra){
        l=be.l2;
        tanf=be.tanf2;
    }

    let ξ=be.x - l*sinQ;
    let η=(be.y - l*cosQ)/ρ1;
    let ζ1=Math.sqrt(1 - ξ*ξ - η*η);

    let ζ=ρ2*(ζ1*cosd1d2 - η*sind1d2);
    let L = l - ζ*tanf;

    ξ=be.x - L*sinQ;
    η=(be.y - L*cosQ)/ρ1;
    ζ1=Math.sqrt(1 - ξ*ξ - η*η);

    //for(let i=0;i<100;i++){
        ζ=ρ2*(ζ1*cosd1d2 - η*sind1d2);
        L = l - ζ*tanf;

        ξ=be.x - L*sinQ;
        η=(be.y - L*cosQ)/ρ1;
        ζ1=Math.sqrt(1 - ξ*ξ - η*η);
    //}

    const cosϕ1sinθ=ξ;
    const cosϕ1cosθ=ζ1*cosd1 - η*sind1;

    const θ=Math.atan2(cosϕ1sinθ,cosϕ1cosθ)/rad; //C.51
    
    let λ=be.H - θ; //C.53, C.22
    const ϕ1=Math.asin(η*cosd1 + ζ1*sind1); //C.52
    let ϕ=Math.atan((1/Math.sqrt(1-e*e))*Math.tan(ϕ1))/rad; //C.54
    if(ϕ>90) ϕ-=180;
    if(ϕ<-90) ϕ+=180;

    if(λ>180) λ=λ-360;
    return {lat: ϕ, lon: -λ};
}

function propperAngle(d){
    //return d;
    let t=d;
    if(t<0){t+=360;}
    if(t>=360) {t-=360;}
    return t;
}

function getOutlineCurveQRange(be,l){
    //Exp Sup 1961
    const msq=be.x*be.x + be.y*be.y; //Derived from x=mSinM, y=mCosM p228
    const m=Math.sqrt(msq);
    const tanM=be.x/be.y; //Derived from x=mSinM, y=mCosM p228
    const M=Math.atan2(be.x,be.y);
    const denom=2*l*m;
    const numer=m*m + l*l - 1;
    const cosQM=(m*m + l*l - 1)/(2*l*m);
    let Q1=propperAngle((Math.acos(cosQM)+M)/rad); 
    let Q2=propperAngle((-Math.acos(cosQM)+M)/rad); 

    //TODO: This probably only works for the 2024 eclipse
    if(isNaN(Q1) || isNaN(Q2)){
        Q2=0;
        Q1=360;
    }

    if(Q1<Q2) Q1+=360;

    return {start: Q2, end: Q1};
}


export function computeOutlineCurve(t){
    const el=getElementCoeffs();
    const be={};
    be.x= el.X0 +  el.X1*t +  el.X2*t*t +  el.X3*t*t*t;
    be.y= el.Y0 +  el.Y1*t +  el.Y2*t*t +  el.Y3*t*t*t;
    be.d= el.d0 +  el.d1*t +  el.d2*t*t;
    be.μ= el.M0 +  el.M1*t;
    be.Xp= el.X1 + 2* el.X2*t + 3* el.X3*t*t;
    be.Yp= el.Y1 + 2* el.Y2*t + 3* el.Y3*t*t;
    be.L1= el.L10 +  el.L11*t +  el.L12*t*t;
    be.L2= el.L20 +  el.L21*t +  el.L22*t*t;
    be.tanf1=el.tanf1;
    be.tanf2=el.tanf2;

    be.l1=be.L1;
    be.l2=be.L2;
    be.Δt=el.Δt;
    be.H = be.μ - 0.00417807 * be.Δt;

    const prange=getOutlineCurveQRange(be,be.l1);
    const urange=getOutlineCurveQRange(be,be.l2);

    const penumbra=new Array();
    const umbra=new Array();
    
    let p=computeOutlinePoint(be,prange.start,false);
    let i=0;
    while((isNaN(p.lat) || !isNaN(p.lon)) && i<.3){
        p=computeOutlinePoint(be,prange.start+i,false);
        i+=.001;
    }
    penumbra.push(p);
    

    for(let i=prange.start;i<prange.end;i+=.1){
        penumbra.push(computeOutlinePoint(be,i,false));
    }
    
    p=computeOutlinePoint(be,prange.end,false);
    i=0;
    while((isNaN(p.lat) || isNaN(p.lon)) && i<.3){
        p=computeOutlinePoint(be,prange.end-i,false);
        i+=.001;
    }
    penumbra.push(p);

    for(let i=0;i<360;i+=.1){
        umbra.push(computeOutlinePoint(be,i,true));
    }
    
    return {umbra: umbra, penumbra: penumbra};
}

export function getRiseSetCurves(){
    let t=-3;
    const e=getElementCoeffs();
    const list1=new Array();
    const list2=new Array();
    const list3=new Array();
    const list4=new Array();

    let maxlat=-100;
    let minlat=100;
    let nStart;
    let sStart;

    while(t<.5){
        const be=getElements(e,t,0,0,0);
        const p=computeRiseSetPoints(be);
        if(!isNaN(p[0].lat)){
            list1.push(p[0]);
            if(p[0].lat>maxlat){ maxlat=p[0].lat; nStart=p[0].lon;}
            if(p[0].lat<minlat){ minlat=p[0].lat; sStart=p[0].lon;}
        }
        if(!isNaN(p[1].lat)){
            list2.unshift(p[1]);
            if(p[1].lat<minlat){ minlat=p[1].lat; sStart=p[1].lon;}
            if(p[1].lat<minlat){ minlat=p[1].lat; sStart=p[1].lon;}
        }
        t+=.01;
    }
    t=.5;

    maxlat=-100;
    minlat=100;
    let nEnd;
    let sEnd;

    while(t<4){
        const be=getElements(e,t,0,0,0);
        const p=computeRiseSetPoints(be);
        if(!isNaN(p[0].lat)) list3.push(p[0]);
        if(!isNaN(p[1].lat)) list4.unshift(p[1]);
        if(!isNaN(p[0].lat)){
            list3.push(p[0]);
            if(p[0].lat>maxlat){ maxlat=p[0].lat; nEnd=p[0].lon;}
            if(p[0].lat<minlat){ minlat=p[0].lat; sEnd=p[0].lon;}
        }
        if(!isNaN(p[1].lat)){
            list4.unshift(p[1]);
            if(p[1].lat>maxlat){ maxlat=p[1].lat; nEnd=p[1].lon;}
            if(p[1].lat<minlat){ minlat=p[1].lat; sEnd=p[1].lon;}
        }
        t+=.01;
    }
    return {setting: list1.concat(list2), rising: list3.concat(list4), nStart: nStart, sStart: sStart, nEnd: nEnd, sEnd: sEnd};

}

function computeRiseSetPoints(be){
    //TODO: Flattening of the Earth
    //P232 rise set curve
    const ζ=0;
    const M=Math.atan2(be.X,be.Y);
    const m=Math.sqrt(be.X*be.X + be.Y*be.Y);

    const cosγM=(m*m + 1 - be.L1*be.L1) / (2*m); //Without flattening

    const γM=Math.acos(cosγM);
    const γM2=2*Math.PI-γM;

    const γ1=γM+M;
    const γ2=γM2+M;

    let ll1=computeRiseSetPoint(be,γ1);
    let ll2=computeRiseSetPoint(be,γ2);
    return [ll1,ll2];
}

function computeRiseSetPoint(be,γ){
    const ζ=0;
    const η=Math.cos(γ);
    const ξ=Math.sin(γ);

    const sind=Math.sin(be.d*rad);
    const cosd=Math.cos(be.d*rad);

    const cosϕsinθ=ξ;
    const cosϕ1cosθ=-η*sind+ζ*cosd;

    const tanθ=cosϕsinθ/cosϕ1cosθ;
    const θ=Math.atan2(cosϕsinθ,cosϕ1cosθ);
    const λ=-(be.H*rad-θ);

    const sinϕ=η*cosd+ζ*sind;
    const ϕ=Math.asin(sinϕ);

    return {lat: ϕ/rad, lon: (λ<=Math.PI) ? λ/rad : λ/rad-360};

}

export function getMaxEclipseAtRiseSetPoints(){
    let t=-4;
    const list=new Array();
    while(t<4){
        const e=getElementCoeffs();
        const be=getElements(e,t,0,0,0);
        list.push(getMaxEclipseAtRiseSetPoint(be));
        t+=.01;
    }

    return list;
}

function getΔ(Q,be){
    const sinγQ=be.X*Math.cos(Q) - be.Y*Math.sin(Q);
    const γQ=Math.asin(sinγQ);
    const γ=γQ+Q;
    const ξ=Math.sin(γ);
    const η=Math.cos(γ)
    const xξ=be.X-ξ;
    const yη=be.Y-η;
    const Δ=Math.sqrt(xξ*xξ + yη*yη);
    return Δ;
}

function getMaxEclipseAtRiseSetPoint(be){
    //From Exp Sup 1961 P231
    const sind=Math.sin(be.d*rad);
    const cosd=Math.cos(be.d*rad);

    const bp=-be.Yp + be.Mp*be.X*sind;
    const c1p=be.Xp + be.Mp*be.Y*sind + be.Mp*be.L1*be.tanf1*cosd;
        
    
    let Q = Math.atan2(bp,c1p);
    const Δa=getΔ(Q,be);
    const Δb=getΔ(Q-Math.PI,be);
    //continue with the point where Δ<=be.l

    const l=be.L1;
    if(Δa<l){
        Q=Q;
    } else if(Δb<l){
        Q-=Math.PI;
    }

    const sinγQ=be.X*Math.cos(Q) - be.Y*Math.sin(Q);
    const γQ=Math.asin(sinγQ);
    const γ=γQ+Q;
    const η=Math.cos(γ)
    
    const cosϕsinθ=Math.sin(γ);
    const ζ=0; //Maybe?
    const cosϕcosθ=-η*sind+ζ*cosd;
    
    const cotθ = cosϕcosθ/cosϕsinθ;
    const θ=Math.atan(1/cotθ)/rad;
    const λ=-(be.H-θ);
    const sinϕ=η*cosd+ζ*sind;
    const ϕ=Math.asin(sinϕ)/rad;

    return {lat: ϕ, lon: λ}
    
}

function getGreatestEclipseTime(e){
    const be0=getElements(e,0,0,0,0);

    const x0xpy0yp=be0.X*be0.Xp + be0.Y*be0.Yp;
    const n1=be0.Xp*be0.Xp + be0.Yp*be0.Yp;
    const t=-(be0.X*be0.Xp + be0.Y*be0.Yp)/n1;

    return t;
}

export function getGreatestEclipse(elements){
    const t=getGreatestEclipseTime(elements);
    return(computeCentralLatLonForTime(elements,t+elements.T0));
}