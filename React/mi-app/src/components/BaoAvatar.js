function BaoAvatar({ pensando }) {

return (

<div style={{textAlign:"center", marginBottom:"20px"}}>

<svg
width="120"
height="120"
viewBox="0 0 200 200"
style={{
animation: pensando ? "pulse 1.5s infinite" : "float 3s ease-in-out infinite"
}}
>

{/* cabeza */}
<circle cx="100" cy="100" r="70" fill="#ffffff" stroke="#ddd" strokeWidth="3"/>

{/* orejas */}
<circle cx="55" cy="45" r="25" fill="#000"/>
<circle cx="145" cy="45" r="25" fill="#000"/>

{/* ojos */}
<ellipse cx="75" cy="100" rx="20" ry="25" fill="#000"/>
<ellipse cx="125" cy="100" rx="20" ry="25" fill="#000"/>

{/* ojos blancos */}
<circle cx="75" cy="95" r="6" fill="#fff"/>
<circle cx="125" cy="95" r="6" fill="#fff"/>

{/* nariz */}
<ellipse cx="100" cy="120" rx="10" ry="7" fill="#000"/>

{/* boca */}
<path
d="M90 135 Q100 145 110 135"
stroke="#000"
strokeWidth="3"
fill="none"
/>

</svg>

<p style={{marginTop:"10px", fontWeight:"500"}}>
{pensando ? "BAO está pensando..." : "Tu amigo BAO"}
</p>

</div>

);

}

export default BaoAvatar;