"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function FarmProfile(){

const router = useRouter();


const [data,setData]=useState({

farm_name:"",
location:"",
latitude:"",
longitude:"",
area:"",

crop_type:"",
season:"",

soil_type:"",
soil_ph:"",
nitrogen:"",
phosphorus:"",
potassium:""

});

const change=(e:any)=>{

setData({

...data,
[e.target.name]:e.target.value

});

};


const save = async () => {
    const res = await fetch("http://127.0.0.1:8000/farm", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
       body: JSON.stringify({
    ...data,
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    area: parseFloat(data.area),
    soil_ph: parseFloat(data.soil_ph),
    nitrogen: parseFloat(data.nitrogen),
    phosphorus: parseFloat(data.phosphorus),
    potassium: parseFloat(data.potassium),
}),
    });
        const result = await res.json();

        console.log(result);

        if (res.ok) {
            alert(result.message);
                router.push("/dashboard/predict");
            } else {
            alert(JSON.stringify(result, null, 2));
        }
};

return(


<div className="farm-page">


<h2>🌱 YieldSense AI</h2>

<h1>Register Farm & Crop Information</h1>

<div className="farm-container">

{/* FARM SECTION */}
<div className="farm-card">

<h2>🚜 Farm Information</h2>

<div className="grid">

<input name="farm_name"
placeholder="Farm Name"
onChange={change}
/>

<input
name="location"
placeholder="Location"
onChange={change}
/>

<input
name="latitude"
placeholder="Latitude"
onChange={change}
/>

<input
name="longitude"
placeholder="Longitude"
onChange={change}
/>

<input
name="area"
placeholder="Area (acres) - Enter only number"
onChange={change}
/>

<input
name="soil_type"
placeholder="Soil Type"
onChange={change}
/>

</div>

</div>

{/* CROP SECTION */}

<div className="farm-card">

<h2>🌾 Crop & Soil Details</h2>

<div className="grid">

<input
name="crop_type"
placeholder="Crop Type"
onChange={change}
/>

<input
name="season"
placeholder="Season"
onChange={change}
/>

<input
name="soil_ph"
placeholder="Soil PH"
onChange={change}
/>

<input
name="nitrogen"
placeholder="Nitrogen"
onChange={change}
/>

<input
name="phosphorus"
placeholder="Phosphorus"
onChange={change}
/>

<input
name="potassium"
placeholder="Potassium"
onChange={change}
/>

</div>

</div>

</div>

<button
className="save-btn"
onClick={save}
>

Save Farm Details

</button>

</div>


);

}