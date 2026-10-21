import assert from 'node:assert/strict';
import {visiblePoll} from '../src/lib/visible-poll';
async function main(){
  let hidden=false,listener:(()=>void)|undefined,calls=0,aborted=0,mode='success';
  const timers=new Map<number,()=>void>();let next=0;
  const visibility={hidden:()=>hidden,subscribe:(fn:()=>void)=>{listener=fn;return()=>{listener=undefined;};}};
  const clock={set:(fn:()=>void,delay:number)=>{assert.equal(delay,20000);timers.set(++next,fn);return next;},clear:(id:unknown)=>{timers.delete(id as number);}};
  const tick=()=>new Promise<void>(resolve=>setImmediate(resolve));
  const polling=visiblePoll(async signal=>{calls++;if(mode==='auth')return false;if(mode==='pending')await new Promise<void>(resolve=>signal.addEventListener('abort',()=>{aborted++;resolve();},{once:true}));},visibility,clock);
  await tick();assert.equal(calls,1);assert.equal(timers.size,1);
  hidden=true;listener!();await tick();assert.equal(timers.size,0);assert.equal(calls,1);
  mode='pending';hidden=false;listener!();assert.equal(calls,2);hidden=true;listener!();await tick();assert.equal(aborted,1);assert.equal(timers.size,0);
  mode='success';hidden=false;listener!();await tick();assert.equal(calls,3);assert.equal(timers.size,1);
  const scheduled=[...timers.values()][0];timers.clear();scheduled();await tick();assert.equal(calls,4);assert.equal(timers.size,1);
  mode='pending';polling.refresh();assert.equal(calls,5);polling.dispose();await tick();assert.equal(aborted,2);assert.equal(timers.size,0);assert.equal(listener,undefined);
  polling.refresh();await tick();assert.equal(calls,5);
  mode='auth';const expired=visiblePoll(async()=>{calls++;return false;},visibility,clock);await tick();assert.equal(timers.size,0);const stoppedCalls=calls;listener!();expired.refresh();await tick();assert.equal(calls,stoppedCalls);expired.dispose();
  console.log(JSON.stringify({pollEvery20s:true,hiddenStops:true,resumeRefreshes:true,disposeAborts:true,authLossStops:true,staleCompletionDoesNotReschedule:true,result:'PASS'}));
}
main().catch(()=>{console.error('VISIBLE_POLL_FAILED');process.exitCode=1;});
