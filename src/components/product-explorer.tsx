"use client";

import { useRef, useState } from "react";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { productRoles } from "@/content/vi";
import type {VisualImages,VisualSlot} from '@/lib/visuals';
import {ScreenshotViewer} from './screenshot-viewer';

export function ProductExplorer({images={}}:{images?:VisualImages}) {
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  return <div className="product-explorer">
    <div className="explorer-heading"><span><UtensilsCrossed size={18} /> QuánPilot</span><span className="illustration-label">Quy trình theo vai trò</span></div>
    <div role="tablist" aria-label="Khám phá theo vai trò" className="role-tabs">
      {productRoles.map((item, index) => <button key={item.id} ref={el => { tabs.current[index] = el; }} id={`tab-${item.id}`} role="tab" aria-selected={selected === index} aria-controls={`panel-${item.id}`} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % productRoles.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + productRoles.length) % productRoles.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = productRoles.length - 1;
        else return;
        event.preventDefault(); setSelected(next); tabs.current[next]?.focus();
      }}>{item.label}</button>)}
    </div>
    {productRoles.map((role, index) => <div key={role.id} id={`panel-${role.id}`} role="tabpanel" aria-labelledby={`tab-${role.id}`} tabIndex={0} hidden={selected !== index} className="role-panel">
      {selected===index&&<><ScreenshotViewer image={images[(['menu-screen','service-screen','kitchen-screen','cashier-screen','dashboard-screen'] as VisualSlot[])[index]]} title={role.label}/></>}
      <h3>{role.title}</h3><p>{role.text}</p>
      <ol className="flow-steps">{role.steps.map((step, i) => <li key={step}><span>{`0${i + 1}`}</span>{step}{i < role.steps.length - 1 && <ArrowRight size={14} aria-hidden="true" />}</li>)}</ol>
    </div>)}
  </div>;
}
