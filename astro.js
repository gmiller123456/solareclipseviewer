export function hoursToTime(hours,tz){
    hours+=tz.offset/60/60;  //Convert to EDT
    let h=Math.trunc(hours);
    let m=(hours-h)*60;
    let s=Math.trunc((m-Math.trunc(m))*60);
    m=Math.trunc(m);

    if(h<10){h="0"+h;}
    if(m<10){m="0"+m;}
    if(s<10){s="0"+s;}

    let ap="am";
    if(h>=12) ap="pm";
    if(h>=13) h-=12;
    return h+":"+m+":"+s+" "+ap;
}

export function prettyTime(hours){
    let sign="";
    if(hours<0){
        sign="-";
        hours=-hours;
    }
    let days=0;
    if (hours>24){
        days=Math.trunc(hours/24);
        hours-=days*24;
    }
    let h=Math.trunc(hours);
    let m=(hours-h)*60;
    let s=((m-Math.trunc(m))*60).toFixed(1);
    m=Math.trunc(m);

    if(h>0 || days >0){
        if(s<10) s="0"+s;
        if(m<10) m="0"+m;
    }
    if(days>0){
        if(h<10) h="0"+h;
    }

    let t=s+"s";
    if(m!=0) t=m+"m "+t;
    if(h!=0 || days >0) t=h+"h "+t;
    if(days>0) t=days+"d "+t;
    return sign+t;

}

export function convertTDBToUTC(jd_tdb){
    //Conversion already performed using deltaT in eclipse module
    throw("TDB to UTC Not needed");
    const jd_tt = jd_tdb; //differenece in TT is negligable
    const jd_tai = jd_tt - 32.184 / 60 / 60 / 24;
    const jd_utc = jd_tai - getLeapSeconds(jd_tai) / 60 / 60 / 24;

    return jd_utc;
}

export function getLeapSeconds(jd) {
    //Source IERS Resolution B1 and http://maia.usno.navy.mil/ser7/tai-utc.dat
    //This function must be updated any time a new leap second is introduced

    if (jd > 2457754.5) return 37.0;
    if (jd > 2457204.5) return 36.0;
    if (jd > 2456109.5) return 35.0;
    if (jd > 2454832.5) return 34.0;
    if (jd > 2453736.5) return 33.0;
    if (jd > 2451179.5) return 32.0;
    if (jd > 2450630.5) return 31.0;
    if (jd > 2450083.5) return 30.0;
    if (jd > 2449534.5) return 29.0;
    if (jd > 2449169.5) return 28.0;
    if (jd > 2448804.5) return 27.0;
    if (jd > 2448257.5) return 26.0;
    if (jd > 2447892.5) return 25.0;
    if (jd > 2447161.5) return 24.0;
    if (jd > 2446247.5) return 23.0;
    if (jd > 2445516.5) return 22.0;
    if (jd > 2445151.5) return 21.0;
    if (jd > 2444786.5) return 20.0;
    if (jd > 2444239.5) return 19.0;
    if (jd > 2443874.5) return 18.0;
    if (jd > 2443509.5) return 17.0;
    if (jd > 2443144.5) return 16.0;
    if (jd > 2442778.5) return 15.0;
    if (jd > 2442413.5) return 14.0;
    if (jd > 2442048.5) return 13.0;
    if (jd > 2441683.5) return 12.0;
    if (jd > 2441499.5) return 11.0;
    if (jd > 2441317.5) return 10.0;
    if (jd > 2439887.5) return 4.21317 + (jd - 2439126.5) * 0.002592;
    if (jd > 2439126.5) return 4.31317 + (jd - 2439126.5) * 0.002592;
    if (jd > 2439004.5) return 3.84013 + (jd - 2438761.5) * 0.001296;
    if (jd > 2438942.5) return 3.74013 + (jd - 2438761.5) * 0.001296;
    if (jd > 2438820.5) return 3.64013 + (jd - 2438761.5) * 0.001296;
    if (jd > 2438761.5) return 3.54013 + (jd - 2438761.5) * 0.001296;
    if (jd > 2438639.5) return 3.44013 + (jd - 2438761.5) * 0.001296;
    if (jd > 2438486.5) return 3.34013 + (jd - 2438761.5) * 0.001296;
    if (jd > 2438395.5) return 3.24013 + (jd - 2438761.5) * 0.001296;
    if (jd > 2438334.5) return 1.945858 + (jd - 2437665.5) * 0.0011232;
    if (jd > 2437665.5) return 1.845858 + (jd - 2437665.5) * 0.0011232;
    if (jd > 2437512.5) return 1.372818 + (jd - 2437300.5) * 0.001296;
    if (jd > 2437300.5) return 1.422818 + (jd - 2437300.5) * 0.001296;
    return 0.0;
}

export function JulianDateFromUnixTime(t){
	//Not valid for dates before Oct 15, 1582
	return (t / 86400000) + 2440587.5;
}

export function UnixTimeFromJulianDate(jd){
	//Not valid for dates before Oct 15, 1582
	return (jd-2440587.5)*86400000;
}