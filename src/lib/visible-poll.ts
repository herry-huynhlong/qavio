type Visibility={hidden:()=>boolean;subscribe:(listener:()=>void)=>()=>void};
type Clock={set:(callback:()=>void,delay:number)=>unknown;clear:(handle:unknown)=>void};
const browserClock:Clock={set:(callback,delay)=>setTimeout(callback,delay),clear:handle=>clearTimeout(handle as ReturnType<typeof setTimeout>)};
export const browserVisibility:Visibility={hidden:()=>document.hidden,subscribe:listener=>{document.addEventListener('visibilitychange',listener);return()=>document.removeEventListener('visibilitychange',listener);}};
/** One in-flight read; hide/dispose aborts it. Returning false stops after auth loss. */
export function visiblePoll(work:(signal:AbortSignal)=>Promise<boolean|void>,visibility:Visibility,clock:Clock=browserClock){
  let disposed=false,terminal=false,generation=0,timer:unknown,request:AbortController|undefined;
  function cancel(){generation++;if(timer!==undefined)clock.clear(timer);timer=undefined;request?.abort();request=undefined;}
  async function poll(){
    if(disposed||terminal||visibility.hidden()||request)return;
    const current=generation,controller=new AbortController();request=controller;
    try{const keepGoing=await work(controller.signal);if(current===generation&&keepGoing===false)terminal=true;}
    catch{/* The caller reports errors; retry only while visible and still authenticated. */}
    finally{if(current===generation){request=undefined;if(!disposed&&!terminal&&!visibility.hidden())timer=clock.set(()=>{timer=undefined;void poll();},20000);}}
  }
  function refresh(){cancel();void poll();}
  const unsubscribe=visibility.subscribe(refresh);void poll();
  return {refresh,dispose(){disposed=true;cancel();unsubscribe();}};
}
