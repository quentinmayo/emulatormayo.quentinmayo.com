"use client";
import { useState } from "react";
export default function CopyCommand({command}:{command:string}) {
 const [message,setMessage]=useState("");
 async function copy(){try{await navigator.clipboard.writeText(command);setMessage("Copied");}catch{setMessage("Select and copy the command above.");}}
 return <div className="command-block"><pre><code>{command}</code></pre><div><button type="button" onClick={copy}>Copy command</button><span role="status">{message}</span></div></div>;
}
