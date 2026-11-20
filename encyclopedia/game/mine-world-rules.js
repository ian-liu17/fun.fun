// Original MINE!!! world timing, in active-play seconds. Pausing stops the clock.
export const CYCLE_SECONDS=360;
export const NIGHT_START=210;
export const SUNRISE_START=330;
export function worldClock(time){
 const total=Number.isFinite(time)?Math.max(0,time):0,dayIndex=Math.floor(total/CYCLE_SECONDS),seconds=total%CYCLE_SECONDS;
 const phase=seconds<180?'day':seconds<NIGHT_START?'sunset':seconds<SUNRISE_START?'night':'sunrise';
 const daylight=phase==='day'?1:phase==='sunset'?1-(seconds-180)/30:phase==='sunrise'?(seconds-SUNRISE_START)/30:0;
 const nextNight=dayIndex*CYCLE_SECONDS+NIGHT_START+(seconds>=NIGHT_START?CYCLE_SECONDS:0);
 return {day:dayIndex+1,seconds,phase,daylight,isNight:phase==='night',untilNight:phase==='night'?0:nextNight-total,untilSunrise:phase==='night'?SUNRISE_START-seconds:0,nextNight,nextMorning:(dayIndex+1)*CYCLE_SECONDS,sunAngle:seconds<NIGHT_START?seconds/NIGHT_START*Math.PI:Math.PI+(seconds-NIGHT_START)/(CYCLE_SECONDS-NIGHT_START)*Math.PI};
}
export function formatCountdown(seconds){const n=Math.max(0,Math.ceil(seconds));return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
