export default function FormBox({title,fields}:any){

return(

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-xl font-bold mb-5">
{title}
</h2>

{fields.map((field:string)=>(

<input
key={field}
placeholder={field}
className="
w-full mb-4 p-3
border rounded-lg
"
/>

))}

</div>

)

}