import React, { useEffect, useState } from 'react';
import { videoRequest } from './VideoBlockFields.jsx';
export default function VideoAnalyticsPanel() {
  const [rows,setRows]=useState([]),[error,setError]=useState('');
  async function load(){try{setRows(await videoRequest('/analytics'));setError('');}catch(e){setError(e.message);}}
  useEffect(()=>{load();},[]);
  const groups=new Map();
  for(const row of rows){const key=`${row.id}:${row.campaign_id}:${row.automated}`;if(!groups.has(key))groups.set(key,{...row,counts:{}});groups.get(key).counts[row.event_type]=Number(row.total);}
  return <section className="rounded-xl bg-[#003258] p-5 text-white"><div className="flex justify-between"><h3>Video campaigns · all time</h3><button type="button" onClick={load}>Refresh videos</button></div><p className="text-sm my-2">Unique events per page session. Scanner detection is heuristic; suspected automation is shown separately. Completion reflects playback position, including seeking.</p>{error && <p role="alert">{error}</p>}<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{['Video','Campaign','Activity','Clicks','Visits','Plays','25%','50%','75%','100%'].map(t=><th className="p-2 text-left" key={t}>{t}</th>)}</tr></thead><tbody>{[...groups.entries()].map(([key,row])=><tr key={key}><td>{row.title}</td><td>{row.campaign_id || 'Direct / preview'}</td><td>{row.automated ? 'Suspected scanner' : 'Unflagged'}</td>{['click','visit','play','25','50','75','100'].map(type=><td className="p-2" key={type}>{row.counts[type] || 0}</td>)}</tr>)}</tbody></table></div>{!rows.length && !error && <p>No video activity yet.</p>}</section>;
}
