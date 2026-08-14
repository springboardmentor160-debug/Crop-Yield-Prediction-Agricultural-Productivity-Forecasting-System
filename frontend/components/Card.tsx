export default function Card({title,value}:any){
return(
<div className="bg-white p-5 rounded-xl shadow">
<p>{title}</p>
<h1 className="text-3xl font-bold">{value}</h1>
</div>
)
}